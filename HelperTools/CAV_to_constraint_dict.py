# TODO: this has not been updated to handle Any

import arcpy
import pandas as pd
import os
import pprint

fc = r"C:\\temp\\UPDM2019\\UN\\Pipeline_UtilityNetwork.gdb\\UtilityNetwork\\PipelineLine"
field_group_name = 'Limit Material By Asset Type'


def view_cav(table, subtype_field):
    index = ['fieldGroupName', 'subtype', 'isRetired', 'id']
    data = {}
    for cav in arcpy.da.ListContingentValues(table):
        contingent_value = {k: getattr(cav, k, None) for k in index}
        for field in cav.values:
            contingent_value[field.name] = dict(CODED_VALUE=field.code,
                                                RANGE=field.range,
                                                ANY='<ANY>',
                                                NULL='<NULL>')[field.type]
        data.setdefault(cav.fieldGroupName, []).append(contingent_value)
    return [pd.DataFrame(values).set_index(index).rename_axis(index={'subtype': subtype_field}).fillna('<NULL>') for
            values in data.values()]


desc = arcpy.Describe(fc)
pp = pprint.PrettyPrinter(indent=2, width=200, compact=True)
for df in view_cav(fc, desc.subtypeFieldName):
    if field_group_name in df.index:
        subtypes = set()
        valid_combos = {}
        df = df.reset_index().drop(['fieldGroupName', 'id'], axis=1)
        df = df[df['isRetired'] == False].drop(['isRetired'], axis=1)
        for row in df.itertuples(index=False):
            parent_item = valid_combos
            for i in range(0, len(row) - 1):
                if i == len(row) - 2:
                    parent_item.setdefault(str(row[i]), []).append(row[i + 1])
                else:
                    parent_item = parent_item.setdefault(str(row[i]), {})


        subtypes = sorted(valid_combos.keys())
        func = f'''
// Assigned To: {os.path.basename(fc)}
// Type: Constraint
// Name: {field_group_name} for {os.path.basename(fc)}
// Description: Limit values
// Subtypes: All
// Error: 5601
// Error Message: Incompatible types for {', '.join(list(df.columns))}
// Trigger: Insert, Update


// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

var valid_asset_groups = [{','.join(subtypes)}];
if (indexof(valid_asset_groups, $feature.{desc.subtypeFieldName}) == -1) {{
    return true;
}}

var valid_values = {pp.pformat(valid_combos)};
// ************* End Section *****************
var fields = [{','.join([f"'{fld}'" for fld in df.columns])}];
var dict_values = valid_values
var error_msg = {{"errorMessage": "The selected attributes for {', '.join(list(df.columns))} are not valid."}}
for (var i = 0; i < Count(fields) - 2; i++) {{
    var field_value = $feature[fields[i]];
    field_value = iif(IsEmpty(field_value), '<NULL>', Text(field_value));
    
    if (HasKey(dict_values, field_value)) {{
        dict_values = dict_values[field_value]
        if (typeof (dict_values) == 'Array') {{
            field_value = $feature[fields[i]];
            field_value = iif(IsEmpty(field_value), '<NULL>', Text(field_value));
            if (IndexOf(dict_values, field_value) == -1) {{
                return error_msg
            }}
        }}
    }} else {{
        return error_msg
    }}
}}
return true;
'''
        print(func)
        break
