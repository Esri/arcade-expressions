// Assigned To: StructureLine
// Name: Create ducts in duct bank
// Description: Rule generates ducts inside duct banks based on the ductshigh and ductswide fields
// Subtypes: Wire Duct Bank
// Field: Assetid
// Execute: Insert

// TODO:
// Get end points, like splce, but check to ensure the duct count is greater or equal the duct bank duct count
// Create Knock out port, inside the knockouts
//   This will require a rule on knocks ports to be contained in the knockout
//   Set containerguid
// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation
var valid_asset_types = [81];

var assigned_to_value = $feature.assetid;
var line_class = "StructureLine";
var point_class = "StructureJunction";
var duct_count = $feature.maximumcapacity;
// The Asset Group and Asset Type of the duct
var duct_AG = 101;
var duct_AT = 41;
var knock_out_sql = "AssetGroup = 110 and AssetType = 363";
var knock_out_duct_wide_field = 'ductcountwide';
var knock_out_duct_high_field = 'ductcounthigh';
var point_spacing = .5;
var offset_distance = .1;
var z_level = -10000;
var new_knock_out_port_feature_AG = 110;
var new_knock_out_port_feature_AT = 364;

function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;
    if (class_name == "StructureJunction") {
        feature_set = FeatureSetByName($datastore, "StructureJunction", fields, include_geometry);
    } else if (class_name == 'Associations') {
        feature_set = FeatureSetByName($datastore, 'UN_5_Associations', fields, false);
    } else {
        feature_set = FeatureSetByName($datastore, "StructureJunction", fields, include_geometry);
    }
    return feature_set;
}

// ************* End Section *****************
function pop_empty(dict) {
    var new_dict = {};
    for (var k in dict) {
        if (IsNan(dict[k])) {
            continue;
        }
        if (IsEmpty(dict[k])) {
            continue;
        }
        new_dict[k] = dict[k];
    }
    return new_dict
}

function adjust_z(line_dict, z_value) {
    var new_paths = [];
    for (var i in line_dict['paths']) {
        var current_path = line_dict['paths'][i];
        var new_path = [];
        for (var j in current_path) {
            new_path[Count(new_path)] = [current_path[j][0], current_path[j][1], z_value];
        }
        new_paths[count(new_paths)] = new_path
    }
    line_dict['paths'] = new_paths;
    return line_dict
}

function point_to_array(point_geo) {
    if (IsEmpty(point_geo)) {
        return null
    }
    if (typeof (point_geo) == 'Array') {
        return point_geo;
    }
    if (HasKey(Dictionary(Text(point_geo)), 'x') == false) {
        return null
    }
    return [point_geo.x, point_geo.y, point_geo.z, 0]
}

function get_snapped_point(point_geo) {
    var fs = get_features_switch_yard("StructureJunction", ["globalid", "assetgroup", 'assettype', knock_out_duct_high_field, knock_out_duct_wide_field], false);
    var snapped_feats = Intersects(fs, Point(point_geo));
    var snapped_feat = First(Filter(snapped_feats, knock_out_sql));
    if (!IsEmpty(snapped_feat)) {
        return snapped_feat;
    }
    return null;
}

function is_even(value) {
    return (Number(value) % 2) == 0;
}

function angle_line_at_point(line_geo, point_on_line) {
    var search = Extent(Buffer(point_on_line, .01, "meter"));
    var segment = Clip(line_geo, search)["paths"][0];

    // Get angle of line using the start and end vertex
    return Angle(segment[0], segment[-1])
}

function offset_line(point_geo, point_count, point_spacing, offset_distance, line_rotation) {

    var _point_count = point_count;
    if (point_count == 1) {
        _point_count = 3

    }

    // Store the geometry of the point.  Offset the y and Z to get a vertical line that represents the upper coordinate
    var point_y = point_geo.Y;
    point_y = point_y - (floor(_point_count / 2) * point_spacing) + iif(is_even(point_count), point_spacing / 2, point_spacing / 4);
    var point_z = point_geo.Z;
    point_z = point_z - (floor(_point_count / 2) * point_spacing)  + iif(is_even(point_count), point_spacing / 2, point_spacing / 4);
    var point_x = point_geo.X;

    // Loop over the point count and add a vertex using the spacing
    var vertices = [];
    for (var i = 0; i < _point_count; i++) {
        vertices[i] = [point_x, point_y, point_z];
        point_y = point_y + point_spacing;
        point_z = point_z + point_spacing;
    }
    // Create a new line, rotate it based on user field and offset to spread it from the placed point
    var new_line = Polyline({"paths": [vertices], "spatialReference": {"wkid": point_geo.spatialReference.wkid}});
    new_line = rotate(new_line, 90 - line_rotation);
    if (offset_distance != 0) {
        new_line = offset(new_line, offset_distance);
    }
    // Get the first path on the new line
    return new_line['paths'][0];
}

// Validation
// Limit the rule to valid subtypes
if (indexof(valid_asset_types, $feature.assettype) == -1) {
    return assigned_to_value;
}
// Require a value for duct count
if (IsEmpty(duct_count) || duct_count == 0) {
    return {'errorMessage': 'A value is required for the content count field'};
}

// Get the start and end vertex of the line
var assigned_line_geo = Geometry($feature);
var vertices = assigned_line_geo['paths'][0];
var from_point = vertices[0];
var to_point = vertices[-1];

// Get the snapped feature.
var from_snapped_feat = get_snapped_point(Point(from_point));
if (IsEmpty(from_snapped_feat)) {
    return {'errorMessage': 'A duct bank must start at a knock out'};
}
var from_duct_count = DefaultValue(from_snapped_feat[knock_out_duct_wide_field], 0) * DefaultValue(from_snapped_feat[knock_out_duct_high_field], 0);
if (from_duct_count < duct_count) {
    return {'errorMessage': 'A duct bank has more ducts than the knock out at the start of the line can support'};
}
var to_snapped_feat = get_snapped_point(Point(to_point));
if (IsEmpty(to_snapped_feat)) {
    return {'errorMessage': 'A duct bank must end at a knock out'};
}
var to_duct_count = DefaultValue(to_snapped_feat[knock_out_duct_wide_field], 0) * DefaultValue(to_snapped_feat[knock_out_duct_high_field], 0);
if (to_duct_count < duct_count) {
    return {'errorMessage': 'A duct bank has more ducts than the knock out at the end of the line can support'};
}

// Generate offset lines to move strands to when no port is found
var start_angle = angle_line_at_point(assigned_line_geo, from_point);
start_angle = (450 - start_angle) % 360;
//start_angle = start_angle + 90;
var end_angle = angle_line_at_point(assigned_line_geo, to_point);
end_angle = (450 - end_angle) % 360;
//end_angle = end_angle + 90;

var contained_line_from_point = Dictionary(Text(from_point));
contained_line_from_point['z'] = z_level;
contained_line_from_point = pop_empty(contained_line_from_point);
var contained_line_to_point = Dictionary(Text(to_point));
contained_line_to_point['z'] = z_level;
contained_line_to_point = pop_empty(contained_line_to_point);

var from_offset_line = offset_line(Point(contained_line_from_point), duct_count, point_spacing, offset_distance, start_angle);
var to_offset_line = offset_line(Point(contained_line_to_point), duct_count, point_spacing, offset_distance, end_angle);


var line_attributes = {};
var line_adds = [];
var junction_adds = [];

// Copy the line and move the Z
var line_json = Text(assigned_line_geo);

for (var j = 0; j < duct_count; j++) {
    var content_shape = Dictionary(line_json);
    content_shape = adjust_z(content_shape, z_level);
    var new_from_point = point_to_array(from_offset_line[j]);
    content_shape['paths'][0][0] = new_from_point;
    var new_to_point = point_to_array(to_offset_line[j]);
    content_shape['paths'][0][-1] = new_to_point;
    line_attributes = {
        'AssetGroup': duct_AG,
        'AssetType': duct_AT,
        'ductid': j + 1

    };
    line_adds[Count(line_adds)] = {
        'attributes': line_attributes,
        'geometry': Polyline(content_shape),
        'associationType': 'content'
    };
    var from_junction_attributes = {
        'AssetGroup': new_knock_out_port_feature_AG,
        'AssetType': new_knock_out_port_feature_AT,
        'assetid': j + 1,
        'containerGUID': from_snapped_feat.globalid
    };
    var to_junction_attributes = {
        'AssetGroup': new_knock_out_port_feature_AG,
        'AssetType': new_knock_out_port_feature_AT,
        'assetid': j + 1,
        'containerGUID': to_snapped_feat.globalid
    };
    junction_adds[Count(junction_adds)] = {
        'attributes': from_junction_attributes,
        'geometry': from_offset_line[j]
    };
    junction_adds[Count(junction_adds)] = {
        'attributes': to_junction_attributes,
        'geometry': to_offset_line[j]
    };
}
var edit_payload = [{'className': line_class, 'adds': line_adds},
    {'className': point_class, 'adds': junction_adds}];

return {
    "result": assigned_to_value,
    "edit": edit_payload
};