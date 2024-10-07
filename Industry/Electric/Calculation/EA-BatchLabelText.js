// Assigned To: ElectricAssembly
// Type: Calculation
// Name: Batch Label Text-EA
// Description: Update label text on Assembly based on fields of content.
// Subtypes: All
// Field: labeltext
// Batch: True
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules are rely on additional rules for execution.  If this rule works in conjunction with another, they are listed below:
//   - ED-Require Calculation

// Duplicated In: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//   - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
Expects($feature,'assetgroup');
// Limit the rule to valid asset groups/subtypes
// ** Implementation Note: Instead of recreating this rule for each subtype, this rules uses a list of subtypes and exits if not valid
//    If you have added Asset Groups, they will need to be added to this list(s).
var asset_group = $feature.assetgroup;

// List of fields from content features that are used to generate label text for $feature.
// ** Implementation Note: Add new lists here if you wish to generate label text using certain fields. Each list must be assigned
//    to a certain Asset Group in the "get_ag_settings" function.
var list_of_fields1 = ["phasesnormal", "NormalOperatingStatus"];
var list_of_fields2 = ["phasesnormal", "ratedpower"];

// Settings for content. Device sql expression.
// ** Implementation Note: Only content features that match sql statement will be used to update $feature attributes. Add new sql
//    expressions here if you wish to generate label text using specific types of content features. Each expression must be assigned
//    to a certain Asset Group in the "get_ag_settings" function.
var device_sql1 = "AssetGroup in (10, 29, 37)"; // High Voltage Switch, Medium Voltage Fuse, Medium Voltage Switch
var device_sql2 = "AssetGroup in (35, 38)"; // Medium Voltage Regulator, Medium Voltage Transformer
var device_sql3 = "AssetGroup in (10, 29, 37, 23, 14)"; //Low Voltage Fuse, Low Voltage Switch
var device_sql4 = "AssetGroup = 24"; //Low Voltage Transformer

// Translate Asset Group of feature to specific settings for the label text generation
function get_ag_settings(asset_group) {
    return Decode(Text(asset_group),
        "4", [list_of_fields1, device_sql1],  // High Voltage Switch Bank
        "14", [list_of_fields1, device_sql1], // Medium Voltage Fuse Bank
        "18", [list_of_fields1, device_sql1], // Medium Voltage Switch Bank
        "9", [list_of_fields1, device_sql3], // Low Voltage Fuse Bank
        "11", [list_of_fields1, device_sql3], // Low Voltage Switch Bank
        "16", [list_of_fields2, device_sql2], // Medium Voltage Regulator Bank
        "19", [list_of_fields2, device_sql2], // Medium Voltage Transformer Bank
        "8", [list_of_fields2, device_sql4], // Low Voltage Transformer Bank
        null);
}

// Used to check different empty null states, override of core IsEmpty
function IsEmptyButBetter(data) {
    if (IsEmpty(data)) return true;
    for (var x in data) return false;
    return true;
}

var settings = get_ag_settings(asset_group);

// Limit the rule to valid asset groups
if (IsEmptyButBetter(settings)) {
    return null;
}
var list_of_fields = settings[0];
var device_sql = settings[1];

// The class name of the content Devices
// ** Implementation Note: This is just the class name and should not be fully qualified. Adjust this only if class name differs.
var contained_class = "ElectricDevice";
var content_fs = FeatureSetByName($datastore, "ElectricDevice", list_of_fields, false);

// ************* End User Variables Section *************

// *************       Functions            *************
function get_content_ids(feature) {
    // Query to get all the content associations
    var associations = FeatureSetByAssociation(feature, "content");
    // Due to a bug in MGDB, where class name is fully qualified, filter is not used, but can be once resolved
    // var filtered = Filter(associations, "className = @contained_class");
    // loop over all associated records to get a list of IDs
    var associated_ids = [];
    for (var row in associations) {
        if (Lower(Split(row.classname,'.')[-1]) != Lower(contained_class)){
            continue;
        }
        push(associated_ids, row.globalId);
    }
    return associated_ids;
}

function build_label_dict(devices) {
    var labels = {};
    for (var device in devices) {
        for (var idx in list_of_fields) {
            var fld_name = list_of_fields[idx];
            if (!HasKey(labels, fld_name)){
                 labels[fld_name] = [];
            }
            // No need to check if field has domain since DomainName will return field value by default
            push(labels[fld_name], DomainName(device, fld_name, device[fld_name]));
        }
    }
    return labels;
}

// ************* End Functions Section ******************


// get ids of content strands
var content_ids = get_content_ids($feature);
if (Count(content_ids) == 0) return null;

// filter content
var content_devices = Filter(content_fs, "globalid in @content_ids and " + device_sql);

// build label text value
var label_dict = build_label_dict(content_devices);
if (IsEmptyButBetter(label_dict)){
    return null;
}
return Text(label_dict);