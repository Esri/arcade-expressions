// Assigned To: CommunicationsDevice
// Name: Contain Splice Ports in Splice Enclosure
// Description: Contain Splice Ports in Splice Enclosure using the ContainerGuid field
// Subtypes: Port
// Field: Asset ID field
// Execute: Insert
// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

var assigned_to_field = $feature.assetid;
var valid_asset_types = [143];
var use_device_as_container = false;
var device_class = "CommunicationsDevice";
var container_class;
if (use_device_as_container == true) {
    container_class = device_class;
} else {
    container_class = "CommunicationsAssembly";
}

// ************* End Section *****************

var container_guid = $feature.containerGUID;
var asset_type = $feature.assettype;
if (IsEmpty(container_guid) || indexof(valid_asset_types, asset_type) == -1) {
    return assigned_to_field;
}

var edit_payload = [{
    'className': container_class,
    'updates': [{
        'globalID': $feature.containerGUID,
        'associationType': 'container'
    }]
}];

return {"result": assigned_to_field, "edit": edit_payload};
