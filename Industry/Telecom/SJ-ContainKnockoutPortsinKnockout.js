// Assigned To: StructureJunction
// Type: Calculation
// Name: Contain Knock out port in knockout
// Description: Contains a knock out port in a knockout using the ContainerGuid field
// Subtypes: Wire Vault
// Field: containerGUID
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

var assigned_to_field = $feature.containerGUID;
var valid_asset_types = [364];
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