// Assigned To: PipelineLine
// Type: Calculation
// Name: Calculate Material from Asset Type for Pipeline Line
// Description: Converts the Asset Type codes to Material codes.
// Subtypes: All
// Field: material
// Execute: Insert, Update

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

// Limit the rule to valid asset groups and asset types

var assigned_to_field = $feature.material;
var asset_type = $feature.assettype;

var valid_asset_groups = [1, 2, 3, 4, 5, 6, 7, 15];

var at_to_mat = {
    '2': 'O',
    '11': '0',
    '12': 'R',
    '6': 'S',
    '4': 'X'
};
// ************* End Section *****************

if (HasKey(at_to_mat, Text(asset_type)) == false) {
    return assigned_to_field;
}
// Only when the field is null or set to unknown, set the value
if (IsEmpty(assigned_to_field)) {
    return at_to_mat[Text(asset_type)];
}
return assigned_to_field;