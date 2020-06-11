// Assigned To: Any UN Class
// Name: Auto Contain <Class>
// Description: Uses the rule table to contain feature in a container within a search distance
// Subtypes: All
// Field: ASSOCIATIONSTATUS
// Execute: Insert, Update

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
var assigned_to_field = $feature.somefield;
var association_status = $feature.associationstatus;
var search_distance = 200; //DefaultValue($feature.searchdistance, 75);
var search_unit = 9002;

function class_id_to_name(id) {
    if (id == 3 || id == '3') {
        return 'StructureJunction';
    } else if (id == 4 || id == '4') {
        return 'StructureLine';
    } else if (id == 5 || id == '5') {
        return 'StructureBoundary';
    } else if (id == 6 || id == '6') {
        return 'PipelineDevice';
    } else if (id == 7 || id == '7') {
        return 'PipelineLine';
    } else if (id == 8 || id == '8') {
        return 'PipelineAssembly';
    } else if (id == 9 || id == '9') {
        return 'PipelineJunction';
    } else {
        return Text(id);
    }
}

function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;
    if (class_name == 'PipelineDevice') {
        feature_set = FeatureSetByName($datastore, 'PipelineDevice', fields, include_geometry);
    } else if (class_name == 'PipelineJunction') {
        feature_set = FeatureSetByName($datastore, 'PipelineJunction', fields, include_geometry);
    } else if (class_name == 'PipelineAssembly') {
        feature_set = FeatureSetByName($datastore, 'PipelineAssembly', fields, include_geometry);
    } else if (class_name == 'PipelineLine') {
        feature_set = FeatureSetByName($datastore, 'PipelineLine', fields, include_geometry);
    } else if (class_name == 'StructureJunction') {
        feature_set = FeatureSetByName($datastore, 'StructureJunction', fields, include_geometry);
    } else if (class_name == 'StructureLine') {
        feature_set = FeatureSetByName($datastore, 'StructureLine', fields, include_geometry);
    } else if (class_name == 'StructureBoundary') {
        feature_set = FeatureSetByName($datastore, 'StructureBoundary', fields, include_geometry);
    } else if (class_name == 'Rules') {
        feature_set = FeatureSetByName($datastore, 'UN_5_Rules', fields, false);
    } else {
        feature_set = FeatureSetByName($datastore, 'StructureBoundary', fields, include_geometry);
    }
    return feature_set;
}

function is_edit_from_subnetwork() {
    if ($feature.systemsubnetworkname != $originalfeature.systemsubnetworkname) {
        return true;
    }
    if ($feature.pressuresubnetworkname != $originalfeature.pressuresubnetworkname) {
        return true;
    }
    if ($feature.isolationsubnetworkname != $originalfeature.isolationsubnetworkname) {
        return true;
    }
    if ($feature.cpsubnetworkname != $originalfeature.cpsubnetworkname) {
        return true;
    }
    return false;
}
// ************* End User Variables Section ************

// *************       Functions            *************
function geometry_change() {
    if (IsEmpty($originalfeature)) {
        return true;
    }
    if (IsEmpty(Geometry($originalfeature))) {
        return true;
    }
    return !Equals(Geometry($feature), Geometry($originalfeature));
}

function is_insert() {
    return IsEmpty(Geometry($originalfeature))
}
function sortCandidates(a, b) {
    if (a['distance'] < b['distance'])
        return -1;
    if (a['distance'] > b['distance'])
        return 1;
    return 0;
}

function build_containers_info() {
    var rule_fields = ['OBJECTID', 'RULETYPE', 'FROMNETWORKSOURCEID', 'FROMASSETGROUP', 'FROMASSETTYPE', 'FROMTERMINALID', 'TONETWORKSOURCEID', 'TOASSETGROUP', 'TOASSETTYPE', 'TOTERMINALID', 'VIANETWORKSOURCEID', 'VIAASSETGROUP', 'VIAASSETTYPE', 'VIATERMINALID', 'CREATIONDATE', 'GLOBALID']
    var rules_fs = get_features_switch_yard('Rules', rule_fields, false);

    var containment_sql = 'RULETYPE = 2'
    var feature_sql = 'TOASSETGROUP = ' + $feature.assetgroup + ' and TOASSETTYPE = ' + $feature.assettype;
    var containers_rows = Filter(rules_fs, containment_sql + ' and ' + feature_sql);
    var container_row_count = Count(containers_rows)

    if (container_row_count == 0) {
        return null;
    }

    var container_class_types = {};
    for (var container_row in containers_rows) {
        var class_name = class_id_to_name(container_row['FROMNETWORKSOURCEID']);
        if (class_name == Text(container_row['FROMNETWORKSOURCEID'])) {
            return {'errorMessage': 'Unable to translate Class ID to Class, attribute rules needs updating'};
        }
        if (HasKey(container_class_types, class_name) == false) {
            container_class_types[class_name] = {};
        }
        var asset_group = Text(container_row['FROMASSETGROUP'])
        if (HasKey(container_class_types[class_name], asset_group) == false) {
            container_class_types[class_name][asset_group] = [];
        }
        var asset_type = Text(container_row['FROMASSETTYPE'])
        if (IndexOf(container_class_types[class_name][asset_group], asset_type) == -1) {
            var at_cnt = Count(container_class_types[class_name][asset_group])
            container_class_types[class_name][asset_group][at_cnt] = asset_type;
        }
    }
    return container_class_types
}

function build_sql(container_info, feat_global_id) {
    var sql_class = [];
    var i = 0;
    for (var cls in container_info) {

        var sub_where = [];
        var k = 0;
        for (var ag in container_info[cls]) {
            sub_where[k++] = "(AssetGroup = " + ag + " AND AssetType IN (" + Concatenate(container_info[cls][ag], ',') + '))'
        }
        sql_class[i++] = [cls, '(' + Concatenate(sub_where, ' OR ') + ") and GLOBALID <> '" + feat_global_id + "'"];
    }
    return sql_class
}

function generate_candidates(feature, sql_by_class, search_shape) {
    var container_candidate = [];
    var k = 0;
    for (var i = 0; i < Count(sql_by_class); i++) {
        var class_name = sql_by_class[i][0];
        var where = sql_by_class[i][1];
        var fs = get_features_switch_yard(class_name, ['GLOBALID'], false);
        var container_features = Filter(Intersects(fs, search_shape), where);

        var cont_feat_count = Count(container_features);
        if (cont_feat_count > 0) {
            for (var feat in container_features) {
                container_candidate[k++] = {
                    'class_name': class_name,
                    'globalid': feat.globalid,
                    'distance': Distance(feature, feat, 9002)
                }
            }
        }
    }
    return container_candidate;
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

// ************* End Functions Section *****************

// in FGDB, update subnetwork triggers an update operations, exit
if (is_edit_from_subnetwork()) {
    return assigned_to_field;
}
// If the geometry did not change on an update, return
if (!is_insert() && !geometry_change()){
    return assigned_to_field;
}
// If the feature is already content, return
if (has_bit(association_status, 4) || has_bit(association_status, 16)) {
    return assigned_to_field;
}
var container_info = build_containers_info();
if (IsEmpty(container_info)) {
    return assigned_to_field;
}
if (TypeOf(container_info) == 'Dictionary') {
    if (HasKey(container_info, 'ErrorMessage')) {
        return container_info;
    }
}
var sql_by_class = build_sql(container_info, $feature.globalid);
var search_shape = Buffer(Geometry($feature), search_distance, search_unit);
var candidates = generate_candidates($feature, sql_by_class, search_shape)
if (Count(candidates) == 0) {
    return assigned_to_field;
}
var sorted_candidates = Sort(candidates, sortCandidates);
var edit_payload = [{
    'className': sorted_candidates[0]['class_name'],
    'updates': [{
        'globalID': sorted_candidates[0]['globalid'],
        'associationType': 'container'
    }]
}];

return {"result": assigned_to_field, "edit": edit_payload};