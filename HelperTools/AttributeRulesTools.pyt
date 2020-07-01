# -*- coding: utf-8 -*-

import os
from pathlib import Path
import pandas as pd
import re

import arcpy

class Toolbox(object):
    def __init__(self):
        """Define the toolbox (the name of the toolbox is the name of the
        .pyt file)."""
        self.label = "Toolbox"
        self.alias = ""

        # List of tool classes associated with this toolbox
        self.tools = [ApplyIndustryRulesGP]


class ApplyIndustryRulesGP(object):
    def __init__(self):
        """Define the tool (tool name is the name of the class)."""
        self.label = "Apply Industry Rules"
        self.description = ""
        self.canRunInBackground = False

    def getParameterInfo(self):
        """Define parameter definitions"""
        industry = arcpy.Parameter(name='industry',
                                   displayName='Industry',
                                   direction='Input',
                                   datatype='GPString',
                                   parameterType='Required')
        workspace = arcpy.Parameter(name='gdb',
                                    displayName='Geodatabase',
                                    direction='Input',
                                    datatype='DEWorkspace',
                                    parameterType='Required')
        industry_folder = (Path(__file__).parents[1]) / 'Industry'
        industry.filter.list = [p.name for p in industry_folder.glob('*')]
        return [industry, workspace]

    def isLicensed(self):
        """Set whether tool is licensed to execute."""
        return True

    def updateParameters(self, parameters):
        """Modify the values and properties of parameters before internal
        validation is performed.  This method is called whenever a parameter
        has been changed."""
        return

    def updateMessages(self, parameters):
        """Modify the messages created by internal validation for each tool
        parameter.  This method is called after internal validation."""
        return

    def execute(self, parameters, messages):
        """The source code of the tool."""
        params = [p.valueAsText for p in parameters]
        industry, workspace = params
        industry_folder = str(Path(__file__).parents[1] / 'Industry' / industry)
        applyIndustry = ApplyIndustryRules(workspace, industry_folder)
        applyIndustry.main()


class ApplyIndustryRules:
    """
    Apply all Attribute Rules expressions found in a directory to a workspace
    """
    comments_to_parameter = {
        'Assigned To': "in_table",
        'Name': "name",
        'Type': 'type',
        'Description': "description",
        'Subtypes': "subtype",
        'Field': "field",
        'Trigger': "triggering_events",
        'Exclude From Client': "exclude_from_client_evaluation",
        'Error Number': "error_number",
        'Error Message': "error_message",
        'Is Editable': "is_editable",
        'Disable': "is_enabled"
    }

    def __init__(self, workspace: str, industry: str):
        self.workspace = workspace
        self.industry = Path(industry)

        self.is_un = True
        self.all_args = []
        self.all_seq = []
        self.req_args = ['in_table', 'type', 'name']
        self.pat = re.compile("(?:'sequence': )'(.*?)'")

    def build_all_args(self) -> list:
        """ build list of all arguments for each rule """
        fcs = set()
        all_args = []
        all_seq = []
        pat = re.compile("(?:'sequence': )'(.*?)'")
        for path in self.industry.rglob('*.js'):
            if path.parent.name.lower() == 'notused':
                continue
            f = open(str(path), "r")

            kwargs = {}
            while True:
                text_line = f.readline()
                if not text_line.startswith('//'):
                    break
                param, details = text_line.split(':', 1)
                param = param.strip('/ ')
                details = details.strip()
                if param not in self.comments_to_parameter:
                    arcpy.AddMessage(f"{param} not defined in lookup")
                    continue
                if param == 'Assigned To':
                    if self.is_un:
                        kwargs[self.comments_to_parameter[param]] = os.path.join(self.workspace, details)
                        if arcpy.Exists(os.path.join(self.workspace, details)) == False:
                            arcpy.AddMessage(f"{details} does not exist")
                            continue
                        fcs.add(os.path.join(self.workspace, details))
                    else:
                        kwargs[self.comments_to_parameter[param]] = details
                elif param == 'Type':
                    kwargs[self.comments_to_parameter[param]] = details.upper()
                elif param == 'Subtypes':
                    if self.is_un:
                        kwargs[self.comments_to_parameter[param]] = 'ALL' if details == 'All' else details
                    else:
                        kwargs[self.comments_to_parameter[param]] = None if details == 'All' else details
                elif param == 'Trigger':
                    trigger_events = [det.strip().upper() for det in details.split(',')]
                    if self.is_un:
                        kwargs[self.comments_to_parameter[param]] = trigger_events
                    else:
                        kwargs['triggering_insert'] = 1 if 'INSERT' in trigger_events else 0
                        kwargs['triggering_delete'] = 1 if 'DELETE' in trigger_events else 0
                        kwargs['triggering_update'] = 1 if 'UPDATE' in trigger_events else 0
                elif param == 'Exclude From Client':
                    details = details.lower() == 'true'
                    if self.is_un:
                        kwargs[self.comments_to_parameter[param]] = details
                    else:
                        kwargs[self.comments_to_parameter[param]] = 1 if details else 0
                elif param in ('Description', 'Name', 'Error Number', 'Error Message', 'Field'):
                    kwargs[self.comments_to_parameter[param]] = details
            f.seek(0, 0)
            script_expression = f.read()
            kwargs['script_expression'] = script_expression
            if 'NextSequenceValue' in script_expression:
                seq_names = pat.findall(script_expression) or []
                if not seq_names:
                    arcpy.AddMessage('***** Could not parse sequences, make sure to the dict format for definition')
                else:
                    all_seq.extend([dict(seq_name=seq_name, seq_start_id=1, seq_inc_value=1) for seq_name in seq_names])

            missing_args = [req_arg for req_arg in self.req_args if req_arg not in kwargs]
            if missing_args:
                arcpy.AddMessage(f'***** The args {missing_args} are missing from {path}')
            all_args.append(kwargs)
        return all_args, fcs, all_seq

    def recreate_un_seq(self, all_seq):
        if not all_seq:
            return
        sequences = arcpy.da.ListDatabaseSequences(self.workspace)
        existing_seq = {seq.name for seq in sequences}
        seq_to_remove = set({seq['seq_name'] for seq in all_seq}).intersection(existing_seq)

        for seq in seq_to_remove:
            arcpy.AddMessage(f"Deleting seq {seq}")
            arcpy.DeleteDatabaseSequence_management(self.workspace, seq)
        for seq in all_seq:
            arcpy.AddMessage(f"Creating seq {seq}")
            arcpy.CreateDatabaseSequence_management(self.workspace, **seq)

    def recreate_un_ar(self, fcs, all_args):
        for fc in fcs:
            att_rules = arcpy.Describe(fc).attributeRules
            ar_names = [ar.name for ar in att_rules]
            if ar_names:
                arcpy.AddMessage(f"Deleting all rules on {fc}:")
                arcpy.AddMessage(f"\t\t{str(ar_names)}")
                arcpy.management.DeleteAttributeRule(fc, ar_names, '')

        for kwargs in all_args:
            arcpy.AddMessage(f"Creating {kwargs['name']} on {kwargs['in_table']}")
            arcpy.AddAttributeRule_management(**kwargs)

    def recreate_ap_seq(self, all_seq, seq_df):
        if not all_seq:
            return
        arcpy.AddMessage(f"Removing sequences with the same name in Asset Package")
        seq_df = seq_df[~seq_df['seq_name'].isin([seq['seq_name'] for seq in all_seq])]
        seq_df = seq_df.append(all_seq, ignore_index=True)
        seq_df.loc[seq_df['current_value'].isnull(), 'current_value'] = 1
        arcpy.TruncateTable_management(os.path.join(self.workspace, 'B_DatabaseSequence'))
        with arcpy.da.InsertCursor(os.path.join(self.workspace, 'B_DatabaseSequence'), list(seq_df)) as cursor:
            df_to_cursor(seq_df, cursor)

    def recreate_ap_ar(self, all_args, rules_df):
        ar_names = [ar['name'] for ar in all_args]
        arcpy.AddMessage(f"Removing AR with the same name in Asset Package")
        rules_df = rules_df[~rules_df['name'].isin(ar_names)]
        rules_df = rules_df.append(all_args, ignore_index=True)
        arcpy.TruncateTable_management(os.path.join(self.workspace, 'B_AttributeRules'))
        rules_df.loc[((rules_df['is_editable'].isnull()) & (rules_df['type'] == 'CALCULATION')), 'is_editable'] = 1
        arcpy.AddMessage("Adding...")
        arcpy.AddMessage(str(rules_df.name.to_list()))
        with arcpy.da.InsertCursor(os.path.join(self.workspace, 'B_AttributeRules'), list(rules_df)) as cursor:
            df_to_cursor(rules_df, cursor)

    def main(self):

        # check if asset package
        if self.workspace.lower().endswith('.gdb') and arcpy.Exists(os.path.join(self.workspace, 'B_AttributeRules')):
            rules_df = cursor_to_df(arcpy.da.SearchCursor(os.path.join(self.workspace, 'B_AttributeRules'), ['*']))
            seq_df = cursor_to_df(arcpy.da.SearchCursor(os.path.join(self.workspace, 'B_DatabaseSequence'), ['*']))
            self.is_un = False

        # build args, list of feature classes, and sequences
        all_args, fcs, all_seq = self.build_all_args()

        # if not asset package, recreate attr
        if self.is_un:
            self.recreate_un_seq(all_seq)
            self.recreate_un_ar(fcs, all_args)

        else:
            self.recreate_ap_ar(all_args, rules_df)
            self.recreate_ap_seq(all_seq, seq_df)


def df_to_cursor(data_frame: pd.DataFrame, cursor, progressor_message: str = None):
    """Inserts rows from data_frame to cursor

    Args:
        data_frame (pandas.DataFrame): A DataFrame. Only the subset of fields used by the cursor will be inserted.
        cursor (arcpy.da.InsertCursor): An opened insert cursor.
        progressor_message (str): If not None, create a step progressor with this message and update progress.

    """

    cursor_fields = [f.lower() for f in cursor.fields]
    data_frame = data_frame.rename(columns={c: c.lower() for c in data_frame.columns})

    # If there are fields in the cursor that aren't present in the DF, they need to be added.
    for field in cursor_fields:
        if field not in data_frame.columns:
            data_frame[field] = None

    # Keep only those fields that are present in the cursor.
    data_frame = data_frame[cursor_fields]

    records = len(data_frame)
    if progressor_message and records > 1000:
        arcpy.SetProgressorLabel(progressor_message)
        arcpy.SetProgressor(type='STEP', message=progressor_message, min_range=0, max_range=records)

        chunk = round(records / 100)
        for i, row in enumerate(data_frame.itertuples(index=False, name=None)):
            if not i % chunk:
                arcpy.SetProgressorPosition(i)
            cursor.insertRow(row)
        arcpy.ResetProgressor()
        return

    for row in data_frame.itertuples(index=False, name=None):
        cursor.insertRow(row)


def cursor_to_df(cursor, header=None, has_blob=False):
    """Converts a cursor object to pandas DataFrame

        Args:
            cursor (``arcpy.da.SearchCursor``): A cursor to iterate over.
            header (list): The list of field names to use as header. Defaults to ``None`` which uses the field names as
                reported by the cursor object.
            has_blob (bool): If the cursor, contains blob fields, set this to True. Will process line by line instead of
                loading directly from generator.

        Returns:
            pandas.DataFrame: DataFrame representation of the table.

        Raises:
            ValueError: If the number of fields does not match the record length.

        Examples:
            >>> cursor = arcpy.da.SearchCursor('data', ['OID@', 'SHAPE@X'])
            >>> cursor_to_df(cursor, ['ID', 'X'])
                   ID     X
                0   1  5000
                1   2  1500

    """
    if header is None:
        header = cursor.fields

    if len(header) != len(cursor.fields):
        raise ValueError('The length of header does not match the cursor.')

    # Blob fields are special because they return memoryviews. They need to be cast to bytes otherwise the memoryviews
    # all reference the most recent row. Because of this, the inner loop has to be a list comprehension.
    if has_blob:
        cursor = ([value.tobytes()
                   if isinstance(value, memoryview)
                   else value
                   for value in row]
                  for row in cursor)

    return pd.DataFrame.from_records(cursor, columns=header)
