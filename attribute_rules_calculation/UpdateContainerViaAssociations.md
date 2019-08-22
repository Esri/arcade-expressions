# Update Associated Features

This calculation attribute rule is designed for the feature classes that participate in a Utility Network and for features that are content of a container.  When an attribute is changed in the content, that value is pushed to the container.

## Use cases

When a KVA of a electric device is updated, that information is updated on the assembly.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Update, Insert
  - **Exclude from application evaluation:** True


## Expression Template

This Arcade expression will update parent related feature.  The feature is related through the association table.  This FGDB example represents containment associations in the Utility Network.  To use in the Utility network, the rule will have to be adjust to use the Association table in the service.  Remove the 0: 'ParentFeatures' from the ID lookup.  For this example, this rule is defined on a table on the DETAILS field.  This value is copied to the parent/containers LABELTEXT field. An example with using this rule is included in the [Example](./UpdateContainerViaAssociations.zip).  To demostrate, open the related rows table and change the Details field value in a row.  Review the parent features labeltext field to see the value updated.

```js
// This rule will update an attribute in the the container of the feature

// Function to check if a bit is in an int value
function has_bit(bit_value, test_value) {
    // determines if num has the test_value bit set
    // Equivalent to num AND test_value == test_value

    // first we need to determine the bit position of test_value
    var bit_pos = -1;
    for (var i = 0; i < 64; i++) {
        // equivalent to test_value >> 1
        var test_value = Floor(test_value / 2);
        bit_pos++
        if (test_value == 0)
            break;
    }

    // now that we know the bit position, we shift the bits of
    // num until we get to the bit we care about
    for (var i = 1; i <= bit_pos; i++) {
        var num = Floor(bit_value / 2);
    }

    if (bit_value % 2 == 0) {
        return 0
    } else {
        return 1
    }
}

// These are examples of the source ID for UN layers, they need to be adjusted to match your GDB
var id_lookup = {
    '0': 'ParentFeatures',
    '3': 'StructureJunction',
    '4': 'StructureLine',
    '5': 'StructureBoundary',
    '6': 'PipelineDevice',
    '7': 'PipelineLine',
    '8': 'PipelineAssembly',
    '9': 'PipelineJunction'
};
if (IsEmpty($feature.DETAILS)) {
    return $feature.DETAILS;
}
var association_status = $feature.ASSOCIATIONSTATUS;
// Only features with an association status of content(bit 4) need to be evaluated
if (IsEmpty(association_status) || has_bit(4, association_status)) {
    return $feature.DETAILS;
}

var global_id = $feature.GLOBALID;
// force to upper as the sql is case sensitive
global_id = Upper(global_id);

// Using the GDB name, get the association table
var associate_class = FeatureSetByName($datastore, "association", ['fromnetworksourceid', 'toglobalid',
    'fromglobalid', 'associationtype'], false);

// Association Types values
// 1 = Junction Junction Connectivity
// 2 = Containment
// 3 = Structural Attachment

// Filter the association table for only containers that contain this featur
var assoc_records = Filter(associate_class, "toglobalid = @global_id and associationtype = 2");
// Return if no record is found
if (IsEmpty(assoc_records) || Count(assoc_records) == 0) {
    return global_id;
    return $feature.DETAILS;
}
// Get the first container
var assoc_record = First(assoc_records);
var content_class_name = id_lookup[text(assoc_record.fromnetworksourceid)];

var container_feature = {
    'globalid': assoc_record.FromGlobalID,
    'attributes': {"LABELTEXT": $feature.DETAILS}
};

// Return the value of the field this is assigned on and the edit info for the container
return {
    'result': $feature.DETAILS,
    'edit': [
        {
            'className': content_class_name,
            'updates': [container_feature]
        }
    ]
};
```
