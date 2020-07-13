// Assigned To: StructureJunction
// Type: Calculation
// Name: StructureJunction - Contain Knockout Ports In Knockout
// Description: Contains a knockout port in a knockout using the ContainerGuid field
// Subtypes: Wire Vault
// Field: containerGUID
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
// ** Implementation Note: Adjust only if Container ID field name differs. This rule will exit if this field is empty or null.
//    If containerguid has valid guid, this rule will add feature as content to guid feature
var assigned_to_field = $feature.containerGUID;

// Limit the rule to specific asset type.
// ** Implementation Note: This rule uses a list of asset types and exits if not valid. Add to list to limit rule to specific asset types.
var valid_asset_types = [364];

// The class name of the container feature
// ** Implementation Note: This is just the class name and should not be fully qualified. Adjust this only if class name differs.
var container_class  = "StructureJunction";

// ************* End User Variables Section *************'

var asset_type = $feature.assettype;
if (IsEmpty(assigned_to_field) || IndexOf(valid_asset_types, asset_type) == -1) {
    return assigned_to_field;
}

var edit_payload = [{
    'className': container_class,
    'updates': [{
        'globalID': assigned_to_field,
        'associationType': 'container'
    }]
}];

return {"result": null, "edit": edit_payload};