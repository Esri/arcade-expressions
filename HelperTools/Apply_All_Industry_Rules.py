import arcpy
import os
import pathlib

workspace = "C:\\temp\\UPDM2019\\UN\\Pipeline_UtilityNetwork.gdb\\UtilityNetwork"

industry_folder = pathlib.Path(r"C:\_MyFiles\github\arcade-expressions\Industry\UPDM")
fcs = set()
all_args = []
comments_to_parameter = {
    'Assigned To': "in_table",
    'Name': "name",
    'Type': 'type',
    'Description': "description",
    'Subtypes': "subtype",
    'Field': "field",
    'Execute': "triggering_events",
    'Exclude From Client': "exclude_from_client_evaluation",
    'Error Number': "error_number",
    'Error Message': "error_message",
    'Is Editable': "is_editable"
}
for path in industry_folder.rglob('*.js'):
    f = open(path, "r")
    # AddAttributeRule(in_table, name, type, script_expression, {is_editable}, {triggering_events}, {error_number},
    #                 {error_message}, {description}, {subtype}, {field}, {exclude_from_client_evaluation}, {batch},
    #                 {severity}, {tags})
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
            kwargs[comments_to_parameter[param]] = os.path.join(workspace, details)
            fcs.add(os.path.join(workspace, details))
        elif param == 'Type':
            kwargs[comments_to_parameter[param]] = details.upper()
        elif param == 'Subtypes':
            kwargs[comments_to_parameter[param]] = 'ALL' if details == 'All' else details
        elif param == 'Execute':
            kwargs[comments_to_parameter[param]] = [det.strip().upper() for det in details.split(',')]
        elif param in ('Description', 'Name', 'Error Number', 'Error Message', 'Field'):
            kwargs[comments_to_parameter[param]] = details
    f.seek(0, 0)
    kwargs['script_expression'] = f.read()
    if 'type' not in kwargs:
        print(f'Type is missing from {path}')
    all_args.append(kwargs)

for fc in fcs:
    att_rules = arcpy.Describe(os.path.join(workspace, fc)).attributeRules
    ar_names = [ar.name for ar in att_rules]
    if ar_names:
        print(f"Deleting all rules on {fc}")
        arcpy.management.DeleteAttributeRule(fc, ar_names, '')
for kwargs in all_args:
    print(f"Creating {kwargs['name']} on {kwargs['in_table']}")
    arcpy.AddAttributeRule_management(**kwargs)
