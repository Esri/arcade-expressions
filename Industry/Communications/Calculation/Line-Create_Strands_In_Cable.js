// Assigned To: CommunicationsLine
// Type: Calculation
// Name: Line - Create Strands in Cable
// Description: Generates strands inside a cable based on the strand count field
// Subtypes: All
// Field: assetid
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - Line - Strandsavailable From Strandcount: This rule updates the Strandsavailable field of the Cable to match the number of Strands created.

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
// ** Implementation Note: The field this rule is assigned to does not matter as it does not affect the assigned to field
var assigned_to_field = $feature.assetid;

// Limit the rule to valid asset groups/subtypes
// ** Implementation Note: Instead of recreating this rule for each subtype, this rules uses a list of subtypes and exits if not valid
//    If you have added Asset Groups, they will need to be added to this list.
var valid_asset_groups = [1, 3, 4, 5, 6, 7, 9];

// Limit the rule to valid asset types
// ** Implementation Note: Instead of recreating this rule for each asset type, this rules uses a list of domains and exits if not valid
//    If you have added Asset Types, they will need to be added to this list.
var valid_asset_types = [3];

// The class names of the Strands and the Devices
// ** Implementation Note: These are just the class name and should not be fully qualified.
var line_class = "CommunicationsLine";
var device_class = "CommunicationsDevice";

// The fields for Strand Count, Tube Count, and Network Level
// ** Implementation Note: Adjust these values only if the field names differ
var strand_count = $feature.StrandCount;
var tube_count = $feature.TubeCount;
var network_level = $feature.networklevel;

// Strand status default value for all Strands created
// ** Implementation Note: This sets the Strand Status value to "Available" on all child Strands created by this rule.
var strand_status_avail = 1;

var point_spacing = .5;
var offset_distance = .1;

// The z value of unsnapped strands
var z_level = -1000;

// The Asset Group and Asset Type of the fiber strand
// ** Implementation Note: Adjust this only if the asset group and/or asset type of Strands differs
var strands_AG = 8;
var strands_AT = 163;
var strand_sql = 'AssetGroup = ' + strands_AG + ' AND  AssetType = ' + strands_AT;

// The Asset Group and Asset Type of splice feature
// ** Implementation Note: Adjust this only if the asset group and/or asset type of splice differs
var new_splice_feature_AG = 12;
var new_splice_feature_AT = 143;

//Device,Asset Group=3,Asset Type=1 acts as a splitter
//Device,Asset Group=(1,2,3,5,6,7),Asset Type=3 acts as a splice
//Device,Asset Group=(1,2,5,6,7),Asset Type=1 acts as a pass-through
var cable_snap_types = {
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

var strand_snap_types = {
    'splitter': 'AssetGroup = 13 AND (AssetType = 165 OR AssetType = 166)', // Splitter: Fiber Out
    'splice': 'AssetGroup = ' + new_splice_feature_AG + ' AND AssetType = ' + new_splice_feature_AT, // Port: Splice
    'pass-through': 'AssetGroup = 8 AND AssetType = 143' // Port: Strand Termination
};

// The FeatureSetByName function requires a string literal for the class name.  These are just the class names and should not be fully qualified
// ** Implementation Note: Adjust these to match the name of the domain.  The domain name will only change if you adjusted this in the
//    A_DomainNetwork table and renamed the domain classes in the asset package prior to applying it.
function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;
    if (class_name == "CommunicationsDevice") {
        feature_set = FeatureSetByName($datastore, "CommunicationsDevice", fields, include_geometry);
    } else if (class_name == "CommunicationsLine") {
        feature_set = FeatureSetByName($datastore, "CommunicationsLine", fields, include_geometry);
    } else if (class_name == "CommunicationsAssembly") {
        feature_set = FeatureSetByName($datastore, "CommunicationsAssembly", fields, include_geometry);
    } else if (class_name == 'Associations') {
        feature_set = FeatureSetByName($datastore, 'UN_5_Associations', fields, false);
    }else {
        feature_set = FeatureSetByName($datastore, "CommunicationsDevice", fields, include_geometry);
    }
    return feature_set;
}

// ************* End User Variables Section *************

// *************       Functions            *************

function angle_line_at_point(line_geo, point_on_line) {
    var search = Extent(Buffer(point_on_line, .01, "meter"));
    var segment = Clip(line_geo, search)["paths"][0];

    // Get angle of line using the start and end vertex
    return Angle(segment[0], segment[-1])
}

function offset_line(point_geo, point_count, point_spacing, offset_distance, line_rotation) {

    var _point_count = point_count
    if (point_count == 1) {
        _point_count = 3

    }

    // Store the geometry of the point.  Offset the y and Z to get a vertical line that represents the upper coordinate
    var point_y = point_geo.Y;
    point_y = point_y - (floor(_point_count / 2) * point_spacing);
    var point_z = point_geo.Z;
    point_z = point_z - (floor(_point_count / 2) * point_spacing);
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
    new_line = rotate(new_line, 90 - line_rotation)
    if (offset_distance != 0) {
        new_line = offset(new_line, offset_distance);
    }
    // Get the first path on the new line
    return new_line['paths'][0];
}

function adjust_z(line_dict, z_value) {
    var new_paths = [];
    for (var i in line_dict['paths']) {
        var current_path = line_dict['paths'][i];
        var new_path = [];
        for (var j in current_path) {
            new_path[Count(new_path)] = [current_path[j][0], current_path[j][1], z_value];
        }
        new_paths[Count(new_paths)] = new_path
    }
    line_dict['paths'] = new_paths;
    return line_dict
}

function is_even(value) {
    return (Number(value) % 2) == 0;
}

function get_snapped_container_info(point_geo) {
    var container_GUID = null;
    var snap_type = null;
    var device_fs = get_features_switch_yard("CommunicationsDevice", ["globalid", "assetgroup", 'assettype'], false)
    var snapped_feats = Intersects(device_fs, Point(point_geo));
    for (var st in cable_snap_types) {
        var snapped_feat = First(Filter(snapped_feats, cable_snap_types[st][0]));
        if (!IsEmpty(snapped_feat)) {
            container_row = First(FeatureSetByAssociation(snapped_feat, 'container'));
            if (!IsEmpty(container_row)) {
                var fs = get_features_switch_yard(container_row['className'], ['globalid'], false);
                var global_id = container_row['globalid'];
                var container_row = First(Filter(fs, "globalid = @global_id and " + cable_snap_types[st][1]));
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

function intersects_at_to_points(fs, point_geo) {
    var snapped_edges = 0;
    var intersection = Intersects(fs, point_geo);
    if (Count(intersection) > 0) {
        // Check if feature is at end/start
        for (var line_feat in intersection) {
            if (point_on_start_end(point_geo, Geometry(line_feat))) {
                snapped_edges += 1;
            }
        }

    }
    return snapped_edges
}

function get_line_ends(container_guid, container_type) {
    var open_port_mapping = {'openport': []};
    if (!IsEmpty(container_guid)) {
        var port_features = null;
        var new_geo = null;
        // Using the associations table to get child global ids. Cannot use FeatureSetByAssociation because we only have the guid
        var assoc_fs = get_features_switch_yard('Associations', ['TOGLOBALID'], false);
        var filtered_fs = Filter(assoc_fs, "fromglobalid = @container_guid and ASSOCIATIONTYPE = 2");
        var contained_ids = [];
        for (var feat in filtered_fs) {
            contained_ids[Count(contained_ids)] = feat['TOGLOBALID']
        }
        if (Count(contained_ids) > 0) {
            var fs = get_features_switch_yard(device_class, ['Globalid', 'TubeA', 'StrandA', 'TubeB', 'StrandB'], true);
            var line_fs = Filter(get_features_switch_yard(line_class, ['GlobalID'], true), strand_sql);
            port_features = Filter(fs, "globalid IN @contained_ids and " + strand_snap_types[container_type]);
            if (container_type == 'splice') {
                for (var port_feat in port_features) {
                    var port_geo = Geometry(port_feat);
                    var edge_at_ends_cnt = intersects_at_to_points(line_fs, port_geo);

                    if (edge_at_ends_cnt == 0) {
                        open_port_mapping['openport'][Count(open_port_mapping['openport'])] = {
                            'geometry': port_geo,    //[new_geo.x, new_geo.y, new_geo.z, null];
                            'globalid': port_feat.globalid,
                            'available': true
                        };
                    } else {
                        // Init the port mapping by the existing strand info from the Tube A and Strand A field
                        var tube_txt = Text(port_feat['TubeA'])
                        var strand_txt = Text(port_feat['StrandA'])
                        if (HasKey(open_port_mapping, tube_txt) == false) {
                            open_port_mapping[tube_txt] = {};
                        }
                        if (HasKey(open_port_mapping[tube_txt], strand_txt) == false) {
                            open_port_mapping[tube_txt][strand_txt] = [];
                        }
                        // In the odd chance there is duplicate tube/strand combos, handle as an array. with a flag if available
                        var cur_idx = Count(open_port_mapping[tube_txt][strand_txt]);
                        open_port_mapping[tube_txt][strand_txt][cur_idx] = {
                            'geometry': Geometry(port_feat),
                            'globalid': port_feat.globalid,
                            'available': edge_at_ends_cnt == 1
                        }
                    }
                }
            } else if (container_type == 'splitter') {
                // If the cable is snapped to a splitter, look for the next open port and return its geometry, all strands get snapped to the the same location
                var scale_to_all_strands = null;
                // Loop through all valid ports in the container
                for (var port_feat in port_features) {
                    // Intersect the existing strands to find a port without a strand connected to it
                    var port_geo = Geometry(port_feat);
                    if (intersects_at_to_points(line_fs, port_geo) == 0) {
                        scale_to_all_strands = {
                            'geometry': port_geo,    //[new_geo.x, new_geo.y, new_geo.z, null];
                            'globalid': port_feat.globalid,
                            'available': true
                        }
                        break;
                    }
                }
                if (!IsEmpty(scale_to_all_strands)) {
                    open_port_mapping['openport'] = [scale_to_all_strands];
                }
            } else if (container_type == 'pass-through') {
                // If the cable is snapped to a cable termination, look for the next open port and return its geometry, each strand will be snapped to the next open port
                for (var port_feat in port_features) {
                    // Intersect the existing strands to find a port without a strand connected to it
                    var port_geo = Geometry(port_feat);
                    if (intersects_at_to_points(line_fs, port_geo) == 0) {
                        open_port_mapping['openport'][Count(open_port_mapping['openport'])] = {
                            'geometry': port_geo,    //[new_geo.x, new_geo.y, new_geo.z, null];
                            'globalid': port_feat.globalid,
                            'available': true
                        };
                    }
                }

            }
        }
    }
    return open_port_mapping

}

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

function points_snapped(point_a, point_b) {
    // Cant explain it, but need these checks to get past validation
    if (IsEmpty(point_a) || IsEmpty(point_b)) {
        return false
    }
    if (HasKey(Dictionary(Text(point_b)), 'x') == false || HasKey(Dictionary(Text(point_a)), 'x') == false) {
        return false
    }
    return (Round(point_a.x, 6) == Round(point_b.x, 6) &&
        Round(point_a.y, 6) == Round(point_b.y, 6) &&
        Round(point_a.z, 6) == Round(point_b.z, 6))

}

function keys_to_list(dict) {
    if (IsEmpty(dict)) {
        return []
    }
    var keys = [];
    for (var k in dict) {
        var res = number(k);
        if (!IsNan(res)) {
            keys[Count(keys)] = res
        }
    }
    return sort(keys)

}

function point_on_start_end(point_geo, line_geo) {
    //if (Within(new_geo, Geometry(line_feat))) {
    //     line_on_end = true;
    //     break;
    // }
    var vertices = line_geo['paths'][0];
    var from_point = vertices[0];
    var to_point = vertices[-1];
    // Compare the start and end points
    if (points_snapped(point_geo, to_point)) {
        return true
    } else if (points_snapped(point_geo, from_point)) {
        return true
    }
    return false

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

function splice_to_point(port_features, prep_line_offset, strand_id, tube_id, strand_per_tube, container_guid) {
    var to_point = null;
    var new_feature = null;
    var update_feature = null;
    var matching_strand_available = false;
    var open_port = null;
    // Find an open available port

    // Search for a matching tube/strand
    if (haskey(port_features, Text(tube_id))) {
        var avail_tube = port_features[Text(tube_id)]
        if (haskey(avail_tube, Text(strand_id)) == true) {
            var ports_in_tubes = avail_tube[Text(strand_id)]
            for (var open_port_idx in ports_in_tubes) {
                if (ports_in_tubes[open_port_idx]['available'] == true) {
                    open_port = ports_in_tubes[open_port_idx]
                    open_port['available'] = false;
                    break;
                }
            }
        }
    }

    // If a splice port with matchsing strand info on A side is not availale, find an open splice, starting at the end
    if (IsEmpty(open_port)) {
        var tube_keys = keys_to_list(port_features);
        for (var tube_idx = Count(tube_keys) - 1; tube_idx >= 0; tube_idx--) {
            var avail_tube = port_features[Text(tube_keys[tube_idx])];
            var port_keys = keys_to_list(avail_tube);
            for (var port_idx = Count(port_keys) - 1; port_idx >= 0; port_idx--) {
                var ports_in_tubes = avail_tube[Text(port_keys[port_idx])];
                for (var open_port_idx in ports_in_tubes) {

                    if (ports_in_tubes[open_port_idx]['available'] == true) {
                        open_port = ports_in_tubes[open_port_idx]
                        ports_in_tubes[open_port_idx]['available'] = false;
                        break;
                    }
                }
                if (!IsEmpty(open_port)) {
                    break;
                }
            }
            if (!IsEmpty(open_port)) {
                break;
            }
        }
    }
    if (!IsEmpty(open_port)) {
        var update_feature_attributes = {
            'TubeB': tube_id,
            'StrandB': strand_id
        };
        update_feature = {
            'globalid': open_port['globalid'],
            'attributes': update_feature_attributes
        };
        to_point = open_port['geometry'];
    } else {
        var new_feature_attributes = {
            'AssetGroup': new_splice_feature_AG,
            'AssetType': new_splice_feature_AT,
            'TubeA': tube_id,
            'StrandA': strand_id,
            'ContainerGUID': container_guid,
            'IsSpatial': 0,
        };

        new_feature = {
            'geometry': prep_line_offset[strand_id + ((tube_id - 1) * strand_per_tube) - 1],
            'attributes': new_feature_attributes
        };
        to_point = prep_line_offset[strand_id + ((tube_id - 1) * strand_per_tube) - 1];
    }
    return [to_point, new_feature, update_feature]
}

// ************* End Functions Section ******************

// Validation

// Limit the rule to valid asset groups
if (IndexOf(valid_asset_groups, $feature.assetgroup) == -1) {
    return assigned_to_field;
}
// Limit the rule to valid asset types
if (IndexOf(valid_asset_types, $feature.assettype) == -1) {
    return assigned_to_field;
}

// Require a value for fiber count
if (IsEmpty(strand_count) || strand_count == 0) {
    return {'errorMessage': 'A value is required for the strand count field'};
}
// Fiber count must be even if not 1 strand
if (strand_count > 1 && is_even(strand_count) == false) {
    return {'errorMessage': 'Fiber count must be even if not one strand'};
}
// Get the tube count based on the cable design and strand count
if (IsEmpty(tube_count)) {
    return {'errorMessage': 'Number of tubes is required'};
}
// Ensure the strand distribution is even
var strand_per_tube = iif(strand_count == 1, 1, strand_count / tube_count);
if (strand_per_tube > 1 && strand_per_tube % 1 != 0) {
    return {
        'errorMessage': 'Fiber per tube distribution is not uniform: ' +
            'Fiber Count:' + strand_count + TextFormatting.NewLine +
            'Tube Count:' + tube_count + TextFormatting.NewLine +
            'Strands Per Tube:' + strand_per_tube
    };
}

// Get the start and end vertex of the line
var assigned_line_geo = Geometry($feature);
var vertices = assigned_line_geo['paths'][0];
var from_point = vertices[0];
var to_point = vertices[-1];

// Get the snapped container.  This could be the assembly containing the device
var snapped_container_info = get_snapped_container_info(Point(from_point));
var from_container_GUID = snapped_container_info[0];
var from_container_snap_type = snapped_container_info[1];
snapped_container_info = get_snapped_container_info(Point(to_point));
var to_container_GUID = snapped_container_info[0];
var to_container_snap_type = snapped_container_info[1];

// Get the from and to features the strands need to be adjusted to
var from_port_features = get_line_ends(from_container_GUID, from_container_snap_type);
var to_port_features = get_line_ends(to_container_GUID, to_container_snap_type);

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

var from_offset_line = offset_line(Point(contained_line_from_point), strand_count, point_spacing, offset_distance, start_angle);
var to_offset_line = offset_line(Point(contained_line_to_point), strand_count, point_spacing, offset_distance, end_angle);

var attributes = {};
var line_adds = [];
var junction_adds = [];
var junction_updates = [];
var cnt_from_open_ports = Count(from_port_features['openport']);
var cnt_to_open_ports = Count(to_port_features['openport']);
var cur_from_open_ports_idx = 0;
var cur_to_open_ports_idx = 0;
// Convert the shape to a dict for manipulation
var line_json = Text(assigned_line_geo);
for (var tube_index = 1; tube_index <= tube_count; tube_index++) {
    for (var strand_index = 1; strand_index <= strand_per_tube; strand_index++) {
        var strand_shape = Dictionary(line_json);
        strand_shape = adjust_z(strand_shape, z_level);

        if (from_container_snap_type == 'splice') {
            var splice_from_info = splice_to_point(from_port_features, from_offset_line, strand_index, tube_index, strand_per_tube, from_container_GUID);
            if (!IsEmpty(splice_from_info[0])) {
                strand_shape['paths'][0][0] = point_to_array(splice_from_info[0]);
            } else {
                strand_shape['paths'][0][0] = point_to_array(from_offset_line[strand_index + ((tube_index - 1) * strand_per_tube) - 1]);
            }
            if (!IsEmpty(splice_from_info[1])) {
                junction_adds[Count(junction_adds)] = splice_from_info[1];
            }
            if (!IsEmpty(splice_from_info[2])) {
                junction_updates[Count(junction_updates)] = splice_from_info[2];
            }

        } else if (from_container_snap_type == 'splitter') {
            if (cnt_from_open_ports > 0) {
                strand_shape['paths'][0][0] = point_to_array(from_port_features['openport'][0]['geometry']);
            } else {
                //strand_shape['paths'][0][0] = point_to_array(from_offset_line[strand_index + ((tube_index - 1) * strand_per_tube) - 1]);
            }
        } else if (from_container_snap_type == 'pass-through') {
            if (cur_from_open_ports_idx < cnt_from_open_ports) {
                strand_shape['paths'][0][0] = point_to_array(from_port_features['openport'][cur_from_open_ports_idx]['geometry']);
                cur_from_open_ports_idx += 1

            } else {
                //strand_shape['paths'][0][0] = point_to_array(from_offset_line[strand_index + ((tube_index - 1) * strand_per_tube) - 1]);
            }
        } else {
            // Dont move strand when not snapped to device
            // strand_shape['paths'][0][0] = point_to_array(from_offset_line[strand_index * tube_index - 1]);
        }

        if (to_container_snap_type == 'splice') {
            var splice_to_info = splice_to_point(to_port_features, to_offset_line, strand_index, tube_index, strand_per_tube, to_container_GUID);
            if (!IsEmpty(splice_to_info[0])) {
                strand_shape['paths'][0][-1] = point_to_array(splice_to_info[0]);
            } else {
                strand_shape['paths'][0][-1] = point_to_array(to_offset_line[strand_index + ((tube_index - 1) * strand_per_tube) - 1]);
            }
            if (!IsEmpty(splice_to_info[1])) {
                junction_adds[Count(junction_adds)] = splice_to_info[1];
            }
            if (!IsEmpty(splice_to_info[2])) {
                junction_updates[Count(junction_updates)] = splice_to_info[2];
            }
        } else if (to_container_snap_type == 'splitter') {
            if (cnt_to_open_ports > 0) {
                strand_shape['paths'][0][-1] = point_to_array(to_port_features['openport'][0]['geometry']);
            } else {
                //strand_shape['paths'][0][-1] = point_to_array(to_offset_line[strand_index + ((tube_index - 1) * strand_per_tube) - 1]);
            }
        } else if (to_container_snap_type == 'pass-through') {
            if (cur_to_open_ports_idx < cnt_to_open_ports) {
                strand_shape['paths'][0][-1] = point_to_array(to_port_features['openport'][cur_to_open_ports_idx]['geometry']);
                cur_to_open_ports_idx += 1
            } else {
                //strand_shape['paths'][0][-1] = point_to_array(to_offset_line[strand_index + ((tube_index - 1) * strand_per_tube) - 1]);
            }
        } else {
            // Dont move strand when not snapped to device
            // strand_shape['paths'][0][-1] = point_to_array(to_offset_line[strand_index * tube_index - 1]);
        }

        attributes = {
            'AssetGroup': strands_AG,
            'AssetType': strands_AT,
            'StrandID': strand_index,
            'TubeID': tube_index,
            'IsSpatial': 0,
            'NetworkLevel': network_level,
            'StrandStatus': strand_status_avail
        };
        line_adds[Count(line_adds)] = {
            'attributes': attributes,
            'geometry': Polyline(strand_shape),
            'associationType': 'content'
        };
    }
}
var edit_payload = [{
    'className': line_class,
    'adds': line_adds
}];

if (Count(junction_adds) > 0) {
    edit_payload[Count(edit_payload)] = {'className': device_class, 'adds': junction_adds}
}
if (Count(junction_updates) > 0) {
    edit_payload[Count(edit_payload)] = {'className': device_class, 'updates': junction_updates}
}
return {
    "result": assigned_to_field,
    "edit": edit_payload
};
