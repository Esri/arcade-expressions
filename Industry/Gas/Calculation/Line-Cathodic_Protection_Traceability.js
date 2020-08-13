// Assigned To: PipelineLine
// Type: Calculation
// Name: Line - Cathodic Protection Traceability
// Description: Cathodic protection traceability for pipeline lines. Set traceability flag for lines assets
// Subtypes: All
// Field: cptraceability
// Trigger: Insert, Update
// Exclude From Client: False
// Disable: False
// Is Editable: False

// Related Rules: Some rules are rely on additional rules for execution.  If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in:  This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - Device - Cathodic Protection Traceability
//    - Junction - Cathodic Protection Traceability
//    - Line - Cathodic Protection Traceability

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// Field in the data model used to store and manage the CP information
// ** Implementation Note: This value does not need to change if using the industry data model
var assigned_to_field = $feature.cptraceability;
var cp_override = $feature.cpoverride;
var cp_bondedinsulated = $feature.bondedinsulated;

// Field in the data model used to store and manage the material details
// ** Implementation Note: This value does not need to change if using the industry data model
var cp_material = $feature.assettype;

// The list of material types that are conductive from the assettype field and the asset type domains
// ** Implementation Note: These do not need to be adjusted unless the value of the asset type attribute domains were changed.
var conductive_materials = [1, 2, 3, 5, 6, 11, 12];

// The list of material types that are not conductive from the assettype field and the asset type domains
// ** Implementation Note: These do not need to be adjusted unless the value of the asset type attribute domains were changed.
var non_conductive_materials = [4, 7, 8, 9, 10];

// Limit the rule to valid asset groups/subtypes
// ** Implementation Note: Instead of recreating this rule for each subtype, this rules uses a list of subtypes and exits if not valid
//    If you have added Asset Groups, they will need to be added to this list.
var valid_asset_groups = [1, 2, 3, 4, 5, 6, 7, 15, 50, 51, 52];

// List of asset groups that are always included in a CP trace.
// ** Implementation Note: If you have extended the CP model for additional asset groups, those asset groups should be added here
var asset_groups_always_traceability = [50, 51, 52];

// List of asset groups that are always not include in a CP trace and are CP barriers.
// ** Implementation Note: If you have extended the pipe model for additional asset groups that never conduct cp current, those asset groups should be added here
var asset_groups_never_traceability = [];

// Values to determine traceability
// ** Implementation Note: These do not need to be adjusted unless the value of the CP_Traceability attribute domain were changed.
var traceable = 1; // Also used for Bonded
var not_traceable = 2; // Also used for Insulated

// ************* End User Variables Section *************

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