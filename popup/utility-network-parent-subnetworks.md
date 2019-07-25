
# Get the current and parent subnetworks in a pope

This example shows how to add a new attribute to quickly identify all parent subnetworks

## Use cases

For an electric network, the field and office staff need to know which networks are feeding a customer

## Workflow

Select a layer in ArcGIS Pro, Right click and select Configure Pop-up.  Add a new expression and copy and paste the expression found in the expression template below to the Arcade editor.  Adjust the layer id to match that of your device layer

## Expression Template

Create an expression to identify parent networks

```js
function get_parents(current_subnetwork) {
    // Filter the subnetwork table to get the controllers for the subnetwork the feature is on
    var results = Filter(subnetwork_table, 'subnetworkname = @current_subnetwork AND isdirty = 0');
    var global_ids = [];
    var i = 0;
    // Create a list of the controllers global IDs for the features subnetwork
    for (var result in results) {
        global_ids[i++] = result.featureglobalid;
    }
    if (Count(global_ids) == 0){
        return
    }
    // Filter the device class to get the subnetwork names from the controller feature
    var devices = Filter(device_table, "globalid IN @global_ids");
    var device_subnetworks = [];
    var i = 0;
    for (var device in devices) {
        var device_sub = Split(device.subnetworkname, '::');
        for (var j in device_sub) {
            if (device_sub[j] != current_subnetwork) {
                device_subnetworks[i++] = device_sub[j];
            }
        }
    }
    // Get a unique set of subnetworks
    device_subnetworks = Distinct(device_subnetworks);
    // Exit if there are no parent networks
    if (Count(device_subnetworks) == 0) {
        return
    }
    // Loop through all parents, and store into global variable
    // using recursion, call get parents for each parent
    for (var parent_sub_idx in device_subnetworks) {
        var sub_net = device_subnetworks[parent_sub_idx];
        parent_networks[Count(parent_networks)] = sub_net;
        get_parents(sub_net)
    }
    return
}

//  Create links to the required layers
// The subnetwork table is always 500002, alt you could use Subnetworks
var subnetwork_table = FeatureSetByName($datastore, '500002', ['subnetworkname', 'featureglobalid', 'isdirty'], false);
if (IsEmpty(subnetwork_table) == true)
{
    return "Subnetwork table not found"
}
// The device class is the only class that can be controllers, use its map name or layer ID
// In the example the ElectricDevice is layer ID 100
var device_table = FeatureSetByName($datastore, '100', ['subnetworkname', 'globalid'], false);
if (IsEmpty(device_table) == true)
{
    return "Device table not found"
}
// Get the current subnetwork that features is on
var parent_networks = [$feature.subnetworkname];
// Call Get Parents to get parent Subnetworks
get_parents($feature.subnetworkname);
// Concat the networks, using the :: syntax
return Concatenate(parent_networks, '::')

```

## Example output

[![utility-network-parent-subnetworks](./images/utility-network-parent-subnetworks.jpg)]
