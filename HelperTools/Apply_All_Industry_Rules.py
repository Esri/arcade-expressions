import arcpy
import os
import pathlib
import pandas as pd
import re

workspace = r"C:\\temp\\GasPipelineEnterpriseDataManagement\\Gas and Pipeline Enterprise Data Management\\Databases\\UPDM_UtilityNetwork.gdb"
#workspace = r"C:\temp\GasPipelineEnterpriseDataManagement\Gas and Pipeline Enterprise Data Management\Databases\UPDM_AssetPackage.gdb"
# workspace = r"C:\temp\UPDM2019\UN\UPDM_UtilityNetwork.gdb"
is_un = True

pat = re.compile("(?:'sequence': )'(.*?)'")


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


if workspace.lower().endswith('.gdb') and arcpy.Exists(os.path.join(workspace, 'B_AttributeRules')):
    rules_df = cursor_to_df(arcpy.da.SearchCursor(os.path.join(workspace, 'B_AttributeRules'), ['*']))
    seq_df = cursor_to_df(arcpy.da.SearchCursor(os.path.join(workspace, 'B_DatabaseSequence'), ['*']))
    is_un = False

industry_folder = pathlib.Path(r"C:\_MyFiles\github\arcade-expressions\Industry\UPDM")
fcs = set()
all_args = []
all_seq = []
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
    'Is Editable': "is_editable"
}
for path in industry_folder.rglob('*.js'):
    f = open(str(path), "r")

    kwargs = {}
    while True:
        text_line = f.readline()
        if not text_line.startswith('//'):
            break
        param, details = text_line.split(':', 1)
        param = param.strip('/ ')
        details = details.strip()
        if param not in comments_to_parameter:
            print(f"{param} not defined in lookup")
            continue
        if param == 'Assigned To':
            if is_un:
                kwargs[comments_to_parameter[param]] = os.path.join(workspace, details)
                fcs.add(os.path.join(workspace, details))
            else:
                kwargs[comments_to_parameter[param]] = details
        elif param == 'Type':
            kwargs[comments_to_parameter[param]] = details.upper()
        elif param == 'Subtypes':
            kwargs[comments_to_parameter[param]] = 'ALL' if is_un else None if details == 'All' else details
        elif param == 'Execute':
            trigger_events = [det.strip().upper() for det in details.split(',')]
            if is_un:
                kwargs[comments_to_parameter[param]] = trigger_events
            else:
                kwargs['triggering_insert'] = 1 if 'INSERT' in trigger_events else 0
                kwargs['triggering_delete'] = 1 if 'DELETE' in trigger_events else 0
                kwargs['triggering_update'] = 1 if 'UPDATE' in trigger_events else 0
        elif param in ('Description', 'Name', 'Error Number', 'Error Message', 'Field'):
            kwargs[comments_to_parameter[param]] = details
    f.seek(0, 0)
    script_expression = f.read()
    kwargs['script_expression'] = script_expression
    if 'NextSequenceValue' in script_expression:
        seq_names = pat.findall(script_expression) or []
        if not seq_names:
            print('***** Could not parse sequences, make sure to the dict format for definition')
        else:
            all_seq.extend([dict(seq_name=seq_name, seq_start_id=1, seq_inc_value=1) for seq_name in seq_names])

    if 'type' not in kwargs:
        print(f'***** Type is missing from {path}')
    all_args.append(kwargs)

if is_un:
    if all_seq:
        sequences = arcpy.da.ListDatabaseSequences(workspace)
        existing_seq = {seq.name for seq in sequences}
        seq_to_remove = set({seq['seq_name'] for seq in all_seq}).intersection(existing_seq)

        for seq in seq_to_remove:
            print(f"Deleting seq {seq}")
            arcpy.DeleteDatabaseSequence_management(workspace, seq)
        for seq in all_seq:
            print(f"Creating seq {seq}")
            arcpy.CreateDatabaseSequence_management(workspace, **seq)
    for fc in fcs:
        att_rules = arcpy.Describe(os.path.join(workspace, fc)).attributeRules
        ar_names = [ar.name for ar in att_rules]
        if ar_names:
            print(f"Deleting all rules on {fc}")
            arcpy.management.DeleteAttributeRule(fc, ar_names, '')

    for kwargs in all_args:
        print(f"Creating {kwargs['name']} on {kwargs['in_table']}")
        arcpy.AddAttributeRule_management(**kwargs)

else:
    ar_names = [ar['name'] for ar in all_args]
    print(f"Removing AR with the same name in Asset Package")
    rules_df = rules_df[~rules_df['name'].isin(ar_names)]
    rules_df = rules_df.append(all_args, ignore_index=True)
    arcpy.TruncateTable_management(os.path.join(workspace, 'B_AttributeRules'))
    rules_df.loc[((rules_df['is_editable'].isnull()) & (rules_df['type'] == 'CALCULATION')), 'is_editable'] = 1
    with arcpy.da.InsertCursor(os.path.join(workspace, 'B_AttributeRules'), list(rules_df)) as cursor:
        df_to_cursor(rules_df, cursor)

    if all_seq:
        print(f"Removing sequences with the same name in Asset Package")
        seq_df = seq_df[~seq_df['seq_name'].isin([seq['seq_name'] for seq in all_seq])]
        seq_df = seq_df.append(all_seq, ignore_index=True)
        seq_df.loc[seq_df['current_value'].isnull(), 'current_value'] = 1
        arcpy.TruncateTable_management(os.path.join(workspace, 'B_DatabaseSequence'))
        with arcpy.da.InsertCursor(os.path.join(workspace, 'B_DatabaseSequence'), list(seq_df)) as cursor:
            df_to_cursor(seq_df, cursor)
