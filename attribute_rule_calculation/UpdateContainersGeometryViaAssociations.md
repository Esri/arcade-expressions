
# Update Containers Z value when feature is the lowest feature 

This calculation attribute rule is designed for the feature classes that participate in a Utility Network and for features that are content of a container.  When the features elevation is changed, it will compare the new elevation to the containers and other content in that container.  If the feature is the lowest feature, it will update the containers z to the features value.

## Use cases

Modeling Pipe Connections in Manholed

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  - **Field:** ownedby
  - **Rule Type:** Calculation
  - **Triggering Events:** Update, Insert
  - **Exclude from application evaluation:** True


## Expression Template

```js
// This rule will update an Z of the container if the edited point has a different Z and is the lowest

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
var field_value = $feature.ownedby;

// Get Feature Switch yard, adjust the string literals to match your GDB feature class names
function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];    
    var feature_set = null;
    if (class_name == 'SewerDevice') {
        feature_set = FeatureSetByName($datastore, 'SewerDevice', fields, include_geometry);
    } else if (class_name == 'SewerJunction') {
        feature_set = FeatureSetByName($datastore, 'SewerJunction', fields, include_geometry);
    } else if (class_name == 'SewerAssembly') {
        feature_set = FeatureSetByName($datastore, 'SewerAssembly', fields, include_geometry);
    } else if (class_name == 'SewerLine') {
        feature_set = FeatureSetByName($datastore, 'SewerLine', fields, include_geometry);
    } else if (class_name == 'StructureJunction') {
        feature_set = FeatureSetByName($datastore, 'StructureJunction', fields, include_geometry);
    } else if (class_name == 'StructureLine') {
        feature_set = FeatureSetByName($datastore, 'StructureLine', fields, include_geometry);
    } else if (class_name == 'StructureBoundary') {
        feature_set = FeatureSetByName($datastore, 'StructureBoundary', fields, include_geometry);
    } else {
        feature_set = FeatureSetByName($datastore, 'StructureBoundary', fields, include_geometry);
    }
    return feature_set;
}
// ************* End User Variables Section *************

// Converts dict to required return edits format
function convert_to_edits(record_dict) {
    // Convert the dict to a return edit statement
    var contained_features = [];
    for (var k in record_dict) {
        contained_features[count(contained_features)] = {
            'className': k,
            'updates': record_dict[k]
        }
    }
    return contained_features;
}

// Function to check if a bit is in an int value
function has_bit(num, test_value) {
    // num = number to test if it contains a bit
    // test_value = the bit value to test for
    // determines if num has the test_value bit set
    // Equivalent to num AND test_value == test_value

    // first we need to determine the bit position of test_value
    var bit_pos = -1;
    for (var i = 0; i < 64; i++) {
        // equivalent to test_value >> 1
        var test_value = Floor(test_value / 2);
        bit_pos++;
        if (test_value == 0)
            break;
    }
    // now that we know the bit position, we shift the bits of
    // num until we get to the bit we care about
    for (var i = 1; i <= bit_pos; i++) {
        var num = Floor(num / 2);
    }

    if (num % 2 == 0) {
        return false
    } else {
        return true
    }

}

// Function to pop empty values in a dict
function pop_empty(dict) {
    var new_dict = {}
    for (var k in dict) {
        if (IsNan(dict[k])) {
            //new_dict[k] = null;
            continue;
        }
        if (IsEmpty(dict[k])) {
            //new_dict[k] = null;
            continue;
        }
        new_dict[k] = dict[k];
    }
    return new_dict
}

// Function to get UN associated features
function get_associated_feature_ids(feature, association_type, ignore_ids) {
    // feautre(Feature): A feature object used to lookup assoications
    // association_type(String): Type of association to look up
    //    Values = content, container, structure
    // ignore_ids(List[Global Ids]): A list of global IDs to ignore and not include in the results

    if (IsEmpty(ignore_ids)) {
        ignore_ids = []
    }
    // Query to get all the content associations
    var associations = FeatureSetByAssociation(feature, association_type);
    // If there is no content, exit the function
    if (count(associations) == 0) {
        return null;
    }
    // loop over all associated records to get a list of the associated classes and the IDs of the features
    var associated_ids = {};
    for (var row in associations) {
        // If the Globalid is in the ignore list, skip it
        if (IndexOf(ignore_ids, row.globalId) >= 0) {
            continue;
        }
        if (HasKey(associated_ids, row.className) == false) {
            associated_ids[row.className] = [];
        }
        associated_ids[row.className][Count(associated_ids[row.className])] = row.globalId;
    }
    //return a dict by class name with GlobalIDs of features, if empty, return null
    if (Text(associated_ids) == '{}') {
        return null;
    }
    return associated_ids;
}



// Get features using a dict with keys of classname and values of Global IDs
function get_features(associated_ids, only_geometry, fields) {
    // If not fields, default to only globalid
    if (Text(fields) == '[]') {
        fields = ['globalid']
    }
    // dict to store the features info by class name
    var associated_features = {};
    // loop over classes
    for (var class_name in associated_ids) {
        // Get a feature set of the class
        var feature_set = get_features_switch_yard(class_name, fields, true);
        // Store the GlobalIDs as a variable to use in SQL
        var global_ids = associated_ids[class_name];
        // Filter the class for only the associated features
        var features = Filter(feature_set, "globalid IN @global_ids");
        // Init dict by class name
        if (HasKey(associated_features, class_name) == false) {
            associated_features[class_name] = {}
        }
        // Loop over the features and store them into a dict by class name by Global ID
        for (var feature in features) {

            if (IsEmpty(only_geometry) || only_geometry == false) {
                associated_features[class_name][feature.globalid] = feature;
            } else {
                var geom = Geometry(feature);
                associated_features[class_name][feature.globalid] = geom;
            }
        }

    }
    // Return the features, if the array is empty, return null
    if (Text(associated_features) == '{}') {
        return null;
    }
    return associated_features
}

// Loop over the associated features and get the first point feature with a Z
function get_first_container(features) {

    for (var class_name in features) {
        for (var globalid in associated_features[class_name]) {
            var feature = associated_features[class_name][globalid];

            var geom = Geometry(feature);
            var geom_dict = Dictionary(Text(geom));
            if (TypeOf(geom) == 'Point' && HasKey(geom_dict, 'z')) {
                return [class_name, feature];
            }
        }
    }
    return null;
}

// Loop over the associated features and get the first point feature with a Z
function get_lowest_z(features) {
    var lowest_z = null;
    for (var class_name in features) {
        for (var globalid in features[class_name]) {
            var feature = features[class_name][globalid];
            var geom = Geometry(feature);
            var geom_dict = Dictionary(Text(geom));
            if (TypeOf(geom) == 'Point' && HasKey(geom_dict, 'z')) {
                if (IsEmpty(lowest_z)) {
                    lowest_z = geom.z;
                } else if (geom.z < lowest_z) {
                    lowest_z = geom.z;
                }
            }
        }
    }
    return lowest_z;
}

var association_status = $feature.ASSOCIATIONSTATUS;
// Only features with an association status of content(bit 4) or visible content(bit 16)
// need to be evaluated
if (IsEmpty(association_status) || (has_bit(association_status, 4) || has_bit(association_status, 16)) == false) {
    return field_value;
}
// Get a dict by class name of the containers of this features
var associated_ids = get_associated_feature_ids($feature, "container", null);
if (IsEmpty(associated_ids)) {
    return field_value;
}
// Get a dict by class name of the container features
var associated_features = get_features(associated_ids, false, []);
// Get an array of the first point container with a z value

var res = get_first_container(associated_features);

if (IsEmpty(res)) {
    return field_value;
}

var container_class = res[0];
var container_feature = res[1];

// Store the features Z value
var feature_z = Geometry($feature).z;
var container_z = Geometry(container_feature).z;

// Compare the of the container to the feature, exit if the same
if (Number(container_z) == Number(feature_z)) {
    return field_value;
}

// Get a dict by class name of the content of the container to determine if the new point is the lowest item
var content_ids = get_associated_feature_ids(container_feature, "content", [$feature.globalid]);

// Only if there is other content, check to see if current point is the lowest
if (IsEmpty(content_ids) == false) {
    // Get a dict by class name of the other content features
    var container_content_features = get_features(content_ids, false, []);
    if (IsEmpty(container_content_features) == false) {
        // Get the lowest Z of its siblings
        var lowest_z = get_lowest_z(container_content_features);
        // If the other features are lower than the edited features, return
        if (lowest_z < feature_z) {
            if (lowest_z < container_z) {
                // TODO: If the lowest feature in the container is lower than container, do we adjust?
                return field_value;
            }
            return field_value;
        }
    }
}
// Get the containers geometry and adjust the z
var new_cont_geom = Geometry(container_feature);
new_cont_geom = pop_empty(Dictionary(Text(new_cont_geom)));
new_cont_geom['z'] = feature_z;

// Create a return edits dict
var edits = {};
edits[container_class] = [{
    'globalid': container_feature.globalId,
    'geometry': Geometry(new_cont_geom)
}]
edits = convert_to_edits(edits);
// Return the value of the field this is assigned on and the edit info for the container
return {
    'result': field_value,
    'edit': edits
};
```