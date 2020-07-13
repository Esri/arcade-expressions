
# Update Container and Structures associated features location

This calculation attribute rule is designed for the feature classes that participate in a Utility Network and for containers and structures.  When they are moved, the associated content will moved with it.
## Use cases

A pole is moved and the transformer and transformer bank is moved

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  - **Field:** ownedby
  - **Rule Type:** Calculation
  - **Triggering Events:** Update
  - **Exclude from application evaluation:** True


## Expression Template

```js
// This rule will update the location of the features in a container or structure is moved

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
var field_value = $feature.assetid;

var snap_classes = ['ElectricDistributionLine'];

// Get Feature Switch yard, adjust the string literals to match your GDB feature class names
function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;
    if (class_name == 'ElectricDistributionDevice') {
        feature_set = FeatureSetByName($datastore, 'ElectricDistributionDevice', fields, include_geometry);
    } else if (class_name == 'ElectricDistributionJunction') {
        feature_set = FeatureSetByName($datastore, 'ElectricDistributionJunction', fields, include_geometry);
    } else if (class_name == 'ElectricDistributionAssembly') {
        feature_set = FeatureSetByName($datastore, 'ElectricDistributionAssembly', fields, include_geometry);
    } else if (class_name == 'ElectricDistributionLine') {
        feature_set = FeatureSetByName($datastore, 'ElectricDistributionLine', fields, include_geometry);
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
    var new_dict = {};
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
    // association_type(String): Type of assoication to look up
    //    Values = content, container, structure,attached
    // ignore_ids(List[Global Ids]): A list of global IDs to ignore and not include in the results
    var associated_ids = {};
    if (IsEmpty(ignore_ids)) {
        ignore_ids = []
    }
    // Query to get all the content associations
    var associations = FeatureSetByAssociation(feature, association_type);

    // If there is no content, exit the function
    if (Count(associations) == 0) {
        return associated_ids;
    }
    // loop over all associated records to get a list of the associated classes and the IDs of the features
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
    return associated_ids;
}

function shift_associated_features(associated_ids, dX, dY, dZ) {
    var shift_edits = {};
    for (var class_name in associated_ids) {
        var feature_set = get_features_switch_yard(class_name, ['globalID'], true);
        var global_ids = associated_ids[class_name];
        var features = Filter(feature_set, "globalid IN @global_ids");
        var updates = [];
        for (var feature in features) {
            // Convert the shape to a dictionary so it is mutable.
            var orig_geometry = Geometry(feature);
            var shape = Dictionary(Text(orig_geometry));
            if (TypeOf(orig_geometry) == 'Point') {
                shape['x'] += dX;
                shape['y'] += dY;
                if (IsNan(shape['z']) == false) {
                    shape['z'] += dZ;
                }
                shape = pop_empty(shape);
            } else if (TypeOf(orig_geometry) == 'Polyline') {

                var new_geometry = [];
                for (var i in shape['paths']) {
                    new_geometry[i] = [];
                    var path = shape['paths'][i];
                    for (var j in path) {
                        var coordinate = path[j];
                        coordinate[0] += dX;
                        coordinate[1] += dY;
                        if (IsNan(coordinate[2]) == false) {
                            coordinate[2] += dZ;
                        }
                        new_geometry[i][j] = coordinate;

                    }
                }
                shape['paths'] = new_geometry;
            } else if (TypeOf(orig_geometry) == 'Polygon') {
                var new_geometry = [];
                for (var i in shape['rings']) {
                    new_geometry[i] = [];
                    var ring = shape['rings'][i];
                    for (var j in ring) {
                        var coordinate = ring[j];
                        coordinate[0] += dX;
                        coordinate[1] += dY;
                        if (IsNan(coordinate[2]) == false) {
                            coordinate[2] += dZ;
                        }
                        new_geometry[i][j] = coordinate;

                    }
                }
                shape['rings'] = new_geometry;
            }
            updates[Count(updates)] = {
                'globalID': feature.globalID,
                'geometry': Geometry(shape)
            };
        }
        shift_edits[class_name] = updates;
    }
    return shift_edits;
}

function shift_snapped_features(geom, dX, dY, dZ, associated_edits) {
    var lines_already_moved = []
    for (var i in snap_classes) {
        var snap_class = snap_classes[i]
        if (HasKey(associated_edits, snap_class)) {
            for (var i in associated_edits[snap_class]) {
                lines_already_moved[Count(lines_already_moved)] = associated_edits[snap_class][i]['globalid']
            }
        }
    }

    var snapped_edits = {};
    var updates = []
    for (var l in snap_classes) {
        var class_name = snap_classes[l]
        var feature_set = get_features_switch_yard(class_name, ['globalID'], true);

        var intersection = Intersects(feature_set, geom);
        if (Count(intersection) == 0) {
            continue
        }
        for (var intersected_line in intersection) {
            var moved = false;
            // If the line has already been moved via association or other intersection, bypass
            if (IndexOf(lines_already_moved, intersected_line['globalID']) >= 0) {
                continue;
            }
            var shape = Dictionary(Text(Geometry(intersected_line)));
            var new_geometry = [];
            for (var i in shape['paths']) {
                new_geometry[i] = [];
                var path = shape['paths'][i];
                for (var j in path) {
                    var coordinate = path[j];
                    // TODO, probably move to Equals and compare the geometry
                    if (Round(coordinate[0], 2) == Round(geom['x'], 2) &&
                        Round(coordinate[1], 2) == Round(geom['y'], 2) &&
                        Round(coordinate[2], 2) == Round(geom['z'], 2)) {
                        coordinate[0] += dX;
                        coordinate[1] += dY;
                        if (IsNan(coordinate[2]) == false) {
                            coordinate[2] += dZ;
                        }
                        moved = true;
                    }
                    new_geometry[i][j] = coordinate;
                }
                shape['paths'] = new_geometry;
            }
            if (moved == false) {
                continue;
            }
            lines_already_moved[Count(lines_already_moved)] = intersected_line['globalID'];
            updates[Count(updates)] = {
                'globalID': intersected_line['globalID'],
                'geometry': Geometry(shape)
            };

        }
        if (count(updates) > 0) {
            snapped_edits[class_name] = updates;
        }
    }
    return snapped_edits;
}

// Converts dict to required return edits format
function convert_to_edits(record_dict) {
    // Convert the dict to a return edit statement
    var edit_playload = [];
    for (var k in record_dict) {
        edit_playload[count(edit_playload)] = {
            'className': k,
            'updates': record_dict[k]
        }
    }
    return edit_playload;
}

function merge_dicts(dicts) {
    var merge_results = {}
    for (var l in dicts) {
        var dict = dicts[l];
        for (var class_name in dict) {
            if (HasKey(merge_results, class_name) == false) {
                merge_results[class_name] = [];
            }
            for (var i in dict[class_name]) {
                merge_results[class_name][Count(merge_results[class_name])] = dict[class_name][i];
            }

        }
    }
    return merge_results;
}

// If the feature geometry has not changed, we can exit early
var current_shape = Geometry($feature);
var original_shape = Geometry($originalFeature);
if (current_shape == original_shape) {
    return field_value;
}

// Get the geometry offset from current and previous.
var dX = current_shape.X - original_shape.X;
var dY = current_shape.Y - original_shape.Y;
var dZ = current_shape.Z - original_shape.Z;
// Store the features global ID as a variable
var globalid = $feature.GLOBALID;

var association_status = $feature.ASSOCIATIONSTATUS;
var association_type = null;
if (has_bit(association_status, 1)) {
    association_type = 'content';
} else if (has_bit(association_status, 2)) {
    association_type = 'attached';
}
var shift_edits = {};
// If the feature is a container or a structure, first evaluate moving its associated features
if (IsEmpty(association_type) == false) {
    var associated_ids = get_associated_feature_ids($feature, association_type, null)
    // Loop over all features and adjust them based on the change in X,Y,Z
    shift_edits = shift_associated_features(associated_ids, dX, dY, dZ);
}
// Move snapped lines not associated
var snapped_edits = shift_snapped_features(original_shape, dX, dY, dZ, shift_edits)
var merge_results = merge_dicts([shift_edits, snapped_edits])
var edit_payload = convert_to_edits(merge_results)

return {"result": field_value, "edit": edit_payload};


```

### Below is the version using the association table and recursively finds all contained/attached features
```js
// This rule will update the location of the features in a container or structure is moved

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

var moved_connected = false;
// The field the rule is assigned to
var field_value = $feature.assetid;

var snap_classes = ['ElectricDistributionLine'];

function association_feature_set(association_fields) {
    // Using the GDB name(un_DSID_associations), Service ID(500001), or Service Layer Name(Associations), get the association table
    return FeatureSetByName($datastore, "un_5_associations", association_fields, false);
}

// Get Feature Switch yard, adjust the string literals to match your GDB feature class names
function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;
    if (class_name == 'ElectricDistributionDevice') {
        feature_set = FeatureSetByName($datastore, 'ElectricDistributionDevice', fields, include_geometry);
    } else if (class_name == 'ElectricDistributionJunction') {
        feature_set = FeatureSetByName($datastore, 'ElectricDistributionJunction', fields, include_geometry);
    } else if (class_name == 'ElectricDistributionAssembly') {
        feature_set = FeatureSetByName($datastore, 'ElectricDistributionAssembly', fields, include_geometry);
    } else if (class_name == 'ElectricDistributionLine') {
        feature_set = FeatureSetByName($datastore, 'ElectricDistributionLine', fields, include_geometry);
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
function class_id_to_name(id) {
    if (id == 3 || id == '3') {
        return 'StructureJunction';
    } else if (id == 4 || id == '4') {
        return 'StructureLine';
    } else if (id == 5 || id == '5') {
        return 'StructureBoundary';
    } else if (id == 6 || id == '6') {
        return 'ElectricDistributionDevice';
    } else if (id == 7 || id == '7') {
        return 'ElectricDistributionLine';
    } else if (id == 8 || id == '8') {
        return 'ElectricDistributionAssembly';
    } else if (id == 9 || id == '9') {
        return 'ElectricDistributionJunction';
    } else {
        return id;
    }
}
// ************* End User Variables Section *************

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
    var new_dict = {};
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
    // association_type(String): Type of assoication to look up
    //    Values = content, container, structure,attached
    // ignore_ids(List[Global Ids]): A list of global IDs to ignore and not include in the results
    var associated_ids = {};
    if (IsEmpty(ignore_ids)) {
        ignore_ids = []
    }
    // Query to get all the content associations
    var associations = FeatureSetByAssociation(feature, association_type);

    // If there is no content, exit the function
    if (Count(associations) == 0) {
        return associated_ids;
    }
    // loop over all associated records to get a list of the associated classes and the IDs of the features
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
    return associated_ids;
}

function shift_associated_features(associated_ids, dX, dY, dZ) {
    var shift_edits = {};
    for (var class_name in associated_ids) {
        var feature_set = get_features_switch_yard(class_name, ['globalID'], true);
        var global_ids = associated_ids[class_name];
        var features = Filter(feature_set, "globalid IN @global_ids");
        var updates = [];
        for (var feature in features) {
            // Convert the shape to a dictionary so it is mutable.
            var orig_geometry = Geometry(feature);
            var shape = Dictionary(Text(orig_geometry));
            if (TypeOf(orig_geometry) == 'Point') {
                shape['x'] += dX;
                shape['y'] += dY;
                if (IsNan(shape['z']) == false) {
                    shape['z'] += dZ;
                }
                shape = pop_empty(shape);
            } else if (TypeOf(orig_geometry) == 'Polyline') {

                var new_geometry = [];
                for (var i in shape['paths']) {
                    new_geometry[i] = [];
                    var path = shape['paths'][i];
                    for (var j in path) {
                        var coordinate = path[j];
                        coordinate[0] += dX;
                        coordinate[1] += dY;
                        if (IsNan(coordinate[2]) == false) {
                            coordinate[2] += dZ;
                        }
                        new_geometry[i][j] = coordinate;

                    }
                }
                shape['paths'] = new_geometry;
            } else if (TypeOf(orig_geometry) == 'Polygon') {
                var new_geometry = [];
                for (var i in shape['rings']) {
                    new_geometry[i] = [];
                    var ring = shape['rings'][i];
                    for (var j in ring) {
                        var coordinate = ring[j];
                        coordinate[0] += dX;
                        coordinate[1] += dY;
                        if (IsNan(coordinate[2]) == false) {
                            coordinate[2] += dZ;
                        }
                        new_geometry[i][j] = coordinate;

                    }
                }
                shape['rings'] = new_geometry;
            }
            updates[Count(updates)] = {
                'globalID': feature.globalID,
                'geometry': Geometry(shape)
            };
        }
        shift_edits[class_name] = updates;
    }
    return shift_edits;
}

function get_all_associations(global_ids, feature_set, assoc_rows) {
    // Get the features that are content or attached
    var assoc_records = Filter(feature_set, "fromglobalid in @global_ids AND associationtype in (2,3)");
    // Return if no record is found
    if (IsEmpty(assoc_records) || Count(assoc_records) == 0) {
        return assoc_rows;
    }
    var assoc_global_ids = [];
    for (var row in assoc_records) {
        var class_name = class_id_to_name(row.tonetworksourceid);
        if (HasKey(assoc_rows, class_name) == false) {
            assoc_rows[class_name] = [];
        }

        assoc_rows[class_name][Count(assoc_rows[class_name])] = row.toglobalid;
        assoc_global_ids[Count(assoc_global_ids)] = row.toglobalid;
    }
    return get_all_associations(assoc_global_ids, feature_set, assoc_rows)
}

function shift_snapped_features(geom, dX, dY, dZ, associated_edits) {
    var lines_already_moved = []
    for (var i in snap_classes) {
        var snap_class = snap_classes[i]
        if (HasKey(associated_edits, snap_class)) {
            for (var i in associated_edits[snap_class]) {
                lines_already_moved[Count(lines_already_moved)] = associated_edits[snap_class][i]['globalid']
            }
        }
    }

    var snapped_edits = {};
    var updates = []
    for (var l in snap_classes) {
        var class_name = snap_classes[l]
        var feature_set = get_features_switch_yard(class_name, ['globalID'], true);

        var intersection = Intersects(feature_set, geom);
        if (Count(intersection) == 0) {
            continue
        }
        for (var intersected_line in intersection) {
            var moved = false;
            // If the line has already been moved via association or other intersection, bypass
            if (IndexOf(lines_already_moved, intersected_line['globalID']) >= 0) {
                continue;
            }
            var shape = Dictionary(Text(Geometry(intersected_line)));
            var new_geometry = [];
            for (var i in shape['paths']) {
                new_geometry[i] = [];
                var path = shape['paths'][i];
                for (var j in path) {
                    var coordinate = path[j];
                    // TODO, probably move to Equals and compare the geometry
                    if (Round(coordinate[0], 2) == Round(geom['x'], 2) &&
                        Round(coordinate[1], 2) == Round(geom['y'], 2) &&
                        Round(coordinate[2], 2) == Round(geom['z'], 2)) {
                        coordinate[0] += dX;
                        coordinate[1] += dY;
                        if (IsNan(coordinate[2]) == false) {
                            coordinate[2] += dZ;
                        }
                        moved = true;
                    }
                    new_geometry[i][j] = coordinate;
                }
                shape['paths'] = new_geometry;
            }
            if (moved == false) {
                continue;
            }
            lines_already_moved[Count(lines_already_moved)] = intersected_line['globalID'];
            updates[Count(updates)] = {
                'globalID': intersected_line['globalID'],
                'geometry': Geometry(shape)
            };

        }
        if (count(updates) > 0) {
            snapped_edits[class_name] = updates;
        }
    }
    return snapped_edits;
}

// Converts dict to required return edits format
function convert_to_edits(record_dict) {
    // Convert the dict to a return edit statement
    var edit_playload = [];
    for (var k in record_dict) {
        edit_playload[count(edit_playload)] = {
            'className': k,
            'updates': record_dict[k]
        }
    }
    return edit_playload;
}

function merge_dicts(dicts) {
    var merge_results = {}
    for (var l in dicts) {
        var dict = dicts[l];
        for (var class_name in dict) {
            if (HasKey(merge_results, class_name) == false) {
                merge_results[class_name] = [];
            }
            for (var i in dict[class_name]) {
                merge_results[class_name][Count(merge_results[class_name])] = dict[class_name][i];
            }

        }
    }
    return merge_results;
}

// If the feature geometry has not changed, we can exit early
var current_shape = Geometry($feature);
var original_shape = Geometry($originalFeature);
if (current_shape == original_shape) {
    return field_value;
}

// Get the geometry offset from current and previous.
var dX = current_shape.X - original_shape.X;
var dY = current_shape.Y - original_shape.Y;
var dZ = current_shape.Z - original_shape.Z;
// Store the features global ID as a variable
var globalid = $feature.GLOBALID;

var association_status = $feature.ASSOCIATIONSTATUS;
var association_type = null;
if (has_bit(association_status, 1)) {
    association_type = 'content';
} else if (has_bit(association_status, 2)) {
    association_type = 'attached';
}
var shift_edits = {};
// If the feature is a container or a structure, first evaluate moving its associated features
var assoc_rows = {};
if (IsEmpty(association_type) == false) {
    // Get all the features that are attached or content, this is recursive
    var assoc_fields = ['tonetworksourceid', 'toglobalid'];
    var assoc_feature_set = association_feature_set(assoc_fields);
    var associated_ids = get_all_associations([globalid], assoc_feature_set, assoc_rows);
    // Loop over all features and adjust them based on the change in X,Y,Z
    shift_edits = shift_associated_features(associated_ids, dX, dY, dZ);
}
// Move snapped lines not associated
var snapped_edits = {};
if (moved_connected == true){
    snapped_edits = shift_snapped_features(original_shape, dX, dY, dZ, shift_edits);
}
var merge_results = merge_dicts([shift_edits, snapped_edits]);
if (Text(merge_results) == '{}') {
    return field_value;
}
var edit_payload = convert_to_edits(merge_results);

return {"result": field_value, "edit": edit_payload};

```