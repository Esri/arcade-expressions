// Assigned To: StructureLine
// Name: Create ducts in duct bank
// Description: Rule generates ducts inside duct banks based on the ductshigh and ductswide fields
// Subtypes: Wire Duct Bank
// Field: Assetid
// Execute: Insert

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation
var valid_asset_types = [81];

var assigned_to_value = $feature.assetid;
var line_class = "StructureLine";
var duct_high = $feature.ductcounthigh;
var duct_wide = $feature.ductcountwide;
// The Asset Group and Asset Type of the duct
var duct_AG = 101;
var duct_AT = 41;

// Level for ducts
var z_duct_level = -10000;


// ************* to Section *****************
function adjust_z(line_dict, z_value) {
    var new_paths = [];
    for (var i in line_dict['paths']) {
        var current_path = line_dict['paths'][i];
        var new_path = [];
        for (var j in current_path) {
            new_path[Count(new_path)] = [current_path[j][0], current_path[j][1], z_value];
        }
        new_paths[count(new_paths)] = new_path
    }
    line_dict['paths'] = new_paths;
    return line_dict
}

// Validation
// Limit the rule to valid subtypes
if (indexof(valid_asset_types, $feature.assettype) == -1) {
    return assigned_to_value;
}
if (IsEmpty(duct_high) || duct_high == 0 || IsEmpty(duct_wide) || duct_wide == 0 ){
    return assigned_to_value;
}
var duct_count = duct_high * duct_wide;
// Require a value for duct count
if (IsEmpty(duct_count) || duct_count == 0) {
    return {'errorMessage': 'A value is required for the content count field'};
}

var attributes = {};
var line_adds = [];

// Copy the line and move the Z
var duct_line = Polyline(adjust_z(Dictionary(Text(Geometry($feature))), z_duct_level));

for (var j = 0; j < duct_count; j++) {
    attributes = {
        'AssetGroup': duct_AG,
        'AssetType': duct_AT,
        'ductid': j + 1//,
        //'IsSpatial': 0

    };
    line_adds[Count(line_adds)] = {
        'attributes': attributes,
        'geometry': duct_line,
        'associationType': 'content'
    };
}
var edit_payload = [{'className': line_class, 'adds': line_adds}];

return {
    "result": assigned_to_value,
    "edit": edit_payload
};