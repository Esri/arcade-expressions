// Assigned To: PipelineJunction
// Type: Calculation
// Name: Cathodic Protection Traceability for Pipeline Junctions
// Description: Set traceability flag for junction assets
// Subtypes: All
// Field: cptraceability
// Trigger: Insert, Update

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

// Limit the rule to valid asset groups and asset types

var assigned_to_field = $feature.cptraceability;
var cp_override = $feature.cpoverride;
var cp_bondedinsulated = $feature.bondedinsulated;
var cp_material = $feature.assettype;

var valid_asset_groups = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 30, 50, 51];
var asset_groups_always_traceability = [50];
var asset_groups_never_traceability = [51];
var traceable = 1; // Also used for Bonded
var not_traceable = 2; // Also used for Insulated
// The material field and list of material types and that are conductive
var conductive_materials = [1, 41, 81, 161, 201, 241, 242, 321, 341, 481];
var non_conductive_materials = [2, 42, 82, 202, 243, 244, 401, 441, 482, 941];

// ************* End Section *****************

if (IsEmpty(assigned_to_field) == false && assigned_to_field != '') {
    return assigned_to_field
}
if (TypeOf(valid_asset_groups) != 'Array' || IndexOf(valid_asset_groups, $feature.assetgroup) == -1) {
    return assigned_to_field;
}

// If an override is specified, use that value regardless of other attributes
if (cp_override > 0) {
    return cp_override;
}

// If a device is always traceability or not, regardless of material, return the proper status
if (TypeOf(asset_groups_always_traceability) == 'Array' && IndexOf(asset_groups_always_traceability, $feature.assetgroup) > -1) {
    return traceable;
}
if (TypeOf(asset_groups_never_traceability) == 'Array' && IndexOf(asset_groups_never_traceability, $feature.assetgroup) > -1) {
    return not_traceable;
}

// If a value is set on the bonded, insulated field, return that value
if (!IsEmpty(cp_bondedinsulated) && cp_bondedinsulated > 0) {
    return cp_bondedinsulated;
}
// Check if the material is conductive
if (TypeOf(conductive_materials) == 'Array' && IndexOf(conductive_materials, cp_material) > -1) {
    return traceable;
}
if (TypeOf(non_conductive_materials) == 'Array' && IndexOf(non_conductive_materials, cp_material) > -1) {
    return not_traceable;
}

//Return the value in the field when no other condition is met
return assigned_to_field;