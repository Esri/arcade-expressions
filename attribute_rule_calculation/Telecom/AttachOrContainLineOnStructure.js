// This rule will contain the added feature in a container

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

var assigned_to_field = $feature.assetid;
var valid_asset_groups = [1, 2, 3, 5, 6, 7];
var valid_asset_types = [1];
var container_class = 'StructureJunction';

// ************* End Section *****************

if (count(valid_asset_groups) > 0 && indexof(valid_asset_groups, $feature.assetgroup) == -1) {
    return assigned_to_field;
}
if (count(valid_asset_types) > 0 && indexof(valid_asset_types, $feature.assettype) == -1) {
    return assigned_to_field;
}

var container_guid = $feature.containerGUID;
var associationType = $feature.containerType;
var edit_payload = [{
    'className': container_class,
    'updates': [{
        'globalID': $feature.containerGUID,
        'associationType': associationType
    }]
}];

return {"result": assigned_to_field, "edit": edit_payload};