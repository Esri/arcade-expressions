// This rule will generate contained spatial/non spatial features

// **************************************
// This section has the functions and variables that need to be adjusted based on your implementation
var identifier = $feature.Identifier;
// Instead of assigning the rule at the subtype, it is assigned to all subtypes and returns if not valid

// Limit the rule to valid subtypes
var valid_asset_groups = [1, 3, 4, 5, 6, 7, 9];
if (indexof(valid_asset_groups, $feature.assetgroup) == -1) {
    return identifier;
}

var valid_asset_types = [3];
var line_class = "CommunicationsLine";
var fiber_count = $feature.ContentCount;
var tube_count = $feature.TubeCount;

// The Asset Group and Type of the tubes in a cable
var new_tube_features_AG = 2;
var new_tube_features_AT = 3;

var device_fs = FeatureSetByName($datastore, "CommunicationsDevice", ["globalid", "assetgroup", 'assettype'], false);

//Device,Asset Group=3,Asset Type=1 acts as a splitter
//Device,Asset Group=(1,2,3,5,6,7),Asset Type=3 acts as a splice
//Device,Asset Group=(1,2,5,6,7),Asset Type=1 acts as a pass-through
var sql_snap_types = {
    'splitter': [
        '(AssetGroup in (1,2,3,5,6,7,10) and AssetType in (4,6))',
        '(AssetGroup in (1,2,3,5,6,7,10) and AssetType in (4,6))'],
    'splice': [
        '(AssetGroup in (1,2,3,5,6,7,10) and AssetType in (3,5))',
        '(AssetGroup in (1,2,3,5,6,7,10) and AssetType in (3,5))'],
    'pass-through': [
        '(AssetGroup in (1,2,3,5,6,7,10) and AssetType in (1))',
        '(AssetGroup in (1,2,3,5,6,7,10) and AssetType in (1))']
};

function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;

    if (class_name == "CommunicationsDevice") {
        feature_set = FeatureSetByName($datastore, "CommunicationsDevice", fields, include_geometry);
    } else if (class_name == "CommunicationsAssembly") {
        feature_set = FeatureSetByName($datastore, "CommunicationsAssembly", fields, include_geometry);
    } else {
        feature_set = FeatureSetByName($datastore, "CommunicationsDevice", fields, include_geometry);
    }
    return feature_set;
}

// ************* End User Variables Section *************

function adjust_z(line_geo, z_value) {
    var line_shape = Dictionary(Text(line_geo));
    var new_paths = [];
    for (var i in line_shape['paths']) {
        var current_path = line_shape['paths'][i];
        var new_path = [];
        for (var j in current_path) {
            new_path[Count(new_path)] = [current_path[j][0], current_path[j][1], z_value];
        }
        new_paths[count(new_paths)] = new_path
    }
    line_shape['paths'] = new_paths;
    return Polyline(line_shape)
}

function is_even(value) {
    return (Number(value) % 2) == 0;
}

function get_tube_count() {

    // Return the tube count based on strands
    if (fiber_count <= 12) {
        return 1;
    } else if (fiber_count <= 18) {
        return 3;
    } else if (fiber_count <= 24) {
        return 2;
    } else if (fiber_count <= 36) {
        return 3;
    } else if (fiber_count <= 48) {
        return 4;
    } else if (fiber_count <= 60) {
        return 5;
    } else if (fiber_count <= 72) {
        return 6;
    } else if (fiber_count <= 96) {
        return 8;
    } else if (fiber_count <= 120) {
        return 10;
    } else if (fiber_count <= 144) {
        return 12;
    } else if (fiber_count <= 216) {
        return 18;
    } else if (fiber_count <= 264) {
        return 22;
    } else if (fiber_count <= 288) {
        return 24;
    } else if (fiber_count <= 360 && cable_design == 1) {
        return 30;
    } else if (fiber_count <= 432 && cable_design == 1) {
        return 36;
    } else if (fiber_count <= 372 && cable_design == 2) {
        return 30;
    } else if (fiber_count <= 456 && cable_design == 2) {
        return 36;
    }
    return null;
}

function get_snapped_container_info(point_geo) {
    var container_GUID = null;
    var snap_type = null;

    var snapped_feats = Intersects(device_fs, Point(point_geo));
    for (var st in sql_snap_types) {
        var snapped_feat = First(Filter(snapped_feats, sql_snap_types[st][0]));
        if (!IsEmpty(snapped_feat)) {
            container_row = First(FeatureSetByAssociation(snapped_feat, 'container'));
            if (!IsEmpty(container_row)) {
                var fs = get_features_switch_yard(container_row['className'], ['globalid'], false);
                var global_id = container_row['globalid'];
                var container_row = First(Filter(fs, "globalid = @global_id and " + sql_snap_types[st][1]));
                if (!IsEmpty(container_row)) {
                    container_GUID = global_id;
                    snap_type = st;
                    break;
                }
            }
        }
    }
    return [container_GUID, snap_type]
}

// Validation

// Limit the rule to valid subtypes
if (indexof(valid_asset_types, $feature.assettype) == -1) {
    return identifier;
}

// Require a value for fiber count
if (IsEmpty(fiber_count) || fiber_count == 0) {
    return {'errorMessage': 'A value is required for the content count field'};
}
// Fiber count must be even if not 1 strand
if (fiber_count > 1 && is_even(fiber_count) == false) {
    return {'errorMessage': 'Fiber count must be even'};
}
// Get the tube count based on the cable design and strand count
// tube_count = get_tube_count();
if (IsEmpty(tube_count)) {
    return {'errorMessage': 'Tube count not be calculated based on the design and fiber count'};
}
// Ensure the strand distribution is even
var strand_per_tube = iif(fiber_count == 1, 1, fiber_count / tube_count);
if (strand_per_tube > 1 && strand_per_tube % 1 != 0) {
    return {
        'errorMessage': 'Fiber per tube distribution is not uniform: ' +
            'Fiber Count:' + fiber_count + TextFormatting.NewLine +
            'Tube Count:' + tube_count + TextFormatting.NewLine +
            'Strands Per Tube:' + strand_per_tube
    };
}

// Get the start and end vertex of the line
var geo = Geometry($feature);
var vertices = geo['paths'][0];
var start_point = vertices[0];
var end_point = vertices[-1];

// Get the snapped container.  This could be the assembly containing the device
var snapped_container_info = get_snapped_container_info(Point(start_point));
var start_container_GUID = snapped_container_info[0];
var start_container_snap_type = snapped_container_info[1];
snapped_container_info = get_snapped_container_info(Point(end_point));
var end_container_GUID = snapped_container_info[0];
var end_container_snap_type = snapped_container_info[1];

var attributes = {};
var line_adds = [];
for (var j = 0; j < tube_count; j++) {
    attributes = {
        'AssetGroup': new_tube_features_AG,
        'AssetType': new_tube_features_AT,
        'Identifier': j + 1,
        'IsSpatial': 0,
        'fromsnap': start_container_snap_type,
        'FromGUID': start_container_GUID,
        'tosnap': end_container_snap_type,
        'ToGUID': end_container_GUID,
    };

    attributes['ContentCount'] = strand_per_tube;
    // Convert the shape to a dict for manipulation
    var line_shape = Dictionary(Text(Geometry($feature)));
    var tube_spacing = .5;
    // Create an offset value so the tubes are offset on both sides of the cables
    var offset_value = iif(is_even(j), Ceil((j + 1) / 2) * tube_spacing, -(Ceil((j + 1) / 2) * tube_spacing));
    line_adds[Count(line_adds)] = {
        'attributes': attributes,
        'geometry': offset(adjust_z(Polyline(line_shape), j + 10), offset_value),
        'associationType': 'content'
    };
}
var edit_payload = [{'className': line_class, 'adds': line_adds}];

return {
    "result": identifier,
    "edit": edit_payload
};