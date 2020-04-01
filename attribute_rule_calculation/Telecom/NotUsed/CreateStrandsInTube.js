// This rule will generate contained spatial/non spatial features
// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation
var valid_asset_types = [3];

var identifier = $feature.Identifier;
var line_class = "CommunicationsLine";
var device_class = "CommunicationsDevice";
var strand_count = $feature.ContentCount;

// The device that will be created in a splice when an existing splice location is not found, this is a Port: Splice
var new_splice_feature_AG = 8;
var new_splice_feature_AT = 143;
// This sql represents the port devices that the strand will snap to the equipment type that the cable snaps to
// The strand looks inside the snapped to assembly, to find devices of this type
var sql_snap_types = {
    'splitter': 'AssetGroup = 8 AND (AssetType = 142 OR AssetType = 141)', // Port: Splitter Out
    'splice': 'AssetGroup = ' + new_splice_feature_AG + ' AND AssetType = ' + new_splice_feature_AT, // Port: Splice
    'pass-through': 'AssetGroup = 8 AND AssetType = 144' // Port: Strand Termination
};

// The Asset Group and Asset Type of the fiber strand
var strands_AG = 8;
var strands_AT = 163;
var strand_sql = 'AssetGroup = ' + strands_AG + ' AND  AssetType = ' + strands_AT;


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
    } else {
        feature_set = FeatureSetByName($datastore, "CommunicationsDevice", fields, include_geometry);
    }
    return feature_set;
}

// ************* to Section *****************

function is_even(value) {
    return (Number(value) % 2) == 0;
}

function intersects_at_end_points(fs, point_geo) {
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

function generate_offset_lines(number_vertex, vertex_spacing, z_offset) {
    var line_geo = Geometry($feature);
    var sr = line_geo.spatialReference;
    var offset_lines = [];
    var offset_value = iif(is_even(number_vertex), (number_vertex / 2) * vertex_spacing, (number_vertex / 2) * vertex_spacing)
    for (var j = 0; j < number_vertex; j++) {
        if (offset_value > -.1 && offset_value < .1) {
            offset_value = offset_value - vertex_spacing;
        }
        offset_lines[j] = offset(line_geo, offset_value);
        offset_value = offset_value - vertex_spacing;
        // Skip original line location

    }

    var from_vertices = [];
    var to_vertices = [];
    var vertices;
    var from_point;
    var to_point;

    for (var i in offset_lines) {
        vertices = offset_lines[i]['paths'][0];
        from_point = vertices[0];
        to_point = vertices[-1];
        from_vertices[i] = Point({
            'x': from_point['x'],
            'y': from_point['y'],
            'z': from_point['z'] * (z_offset * i),
            "spatialReference": sr
        })
        to_vertices[i] = Point({
            'x': to_point['x'],
            'y': to_point['y'],
            'z': to_point['z'] * (z_offset * i),
            "spatialReference": sr
        })
    }
    return [from_vertices, to_vertices];
}

function get_line_ends(container_guid, container_type) {
    var open_port_mapping = {'openport': []};
    if (!IsEmpty(container_guid)) {
        var port_features = null;
        var new_geo = null;
        var assoc_fs = get_features_switch_yard('Associations', ['TOGLOBALID'], false);
        var filtered_fs = Filter(assoc_fs, "fromglobalid = @container_guid and ASSOCIATIONTYPE = 2");
        var contained_ids = [];
        for (var feat in filtered_fs) {
            contained_ids[count(contained_ids)] = feat['TOGLOBALID']
        }
        if (Count(contained_ids) > 0) {
            var fs = get_features_switch_yard(device_class, ['Globalid', 'TubeA', 'StrandA', 'TubeB', 'StrandB'], true);
            var line_fs = Filter(get_features_switch_yard(line_class, ['GlobalID'], true), strand_sql);
            port_features = Filter(fs, "globalid IN @contained_ids and " + sql_snap_types[container_type]);
            if (container_type == 'splice') {
                for (var port_feat in port_features) {
                    var port_geo = Geometry(port_feat);
                    var edge_at_ends_cnt = intersects_at_end_points(line_fs, port_geo)

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
                    if (intersects_at_end_points(line_fs, port_geo) == 0) {
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
                    if (intersects_at_end_points(line_fs, port_geo) == 0) {
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
    var keys = []
    for (var k in dict) {
        var res = number(k)
        if (!IsNan(res)) {
            keys[count(keys)] = res
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

function splice_end_point(port_features, prep_line_offset, vertex_index, container_guid) {
    var end_point = null;
    var new_feature = null;
    var update_feature = null;
    var matching_strand_available = false;
    var open_port = null;
    // Find an open available port
    var strand_id = Text(vertex_index + 1);

    // Search for a matching tube/strand
    if (haskey(port_features, Text(identifier))) {
        var avail_tube = port_features[Text(identifier)]
        if (haskey(avail_tube, strand_id) == true) {
            var ports_in_tubes = avail_tube[strand_id]
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
        for (var tube_idx = count(tube_keys) - 1; tube_idx >= 0; tube_idx--) {
            var avail_tube = port_features[Text(tube_keys[tube_idx])]
            var port_keys = keys_to_list(avail_tube);
            for (var port_idx = count(port_keys) - 1; port_idx >= 0; port_idx--) {
                var ports_in_tubes = avail_tube[Text(port_keys[port_idx])]
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
            'TubeB': identifier,
            'StrandB': vertex_index + 1
        };
        update_feature = {
            'globalid': open_port['globalid'],
            'attributes': update_feature_attributes
        };
        end_point = open_port['geometry'];
    } else {
        var new_feature_attributes = {
            'AssetGroup': new_splice_feature_AG,
            'AssetType': new_splice_feature_AT,
            'TubeA': identifier,
            'StrandA': vertex_index + 1,
            'ContainerGUID': container_guid,
            'IsSpatial': 0,
        };

        new_feature = {
            'geometry': prep_line_offset[vertex_index],
            'attributes': new_feature_attributes
        };
        end_point = prep_line_offset[vertex_index];
    }
    return [end_point, new_feature, update_feature]
}

// Validation

// Limit the rule to valid subtypes
if (indexof(valid_asset_types, $feature.assettype) == -1) {
    return identifier;
}

// Require a value for strand count
if (IsEmpty(strand_count) || strand_count == 0) {
    return {'errorMessage': 'A value is required for the content count field'};
}

// // Fiber count must be event
// if (is_even(strand_count) == false) {
//     return {'errorMessage': 'Fiber count must be even'};
// }

// Get the from and to features the strands need to be adjusted too
var from_port_features = get_line_ends($feature.FromGUID, $feature.fromsnap);
var to_port_features = get_line_ends($feature.ToGUID, $feature.tosnap);

// Generate offset lines to move strands to when no port is found
var results = generate_offset_lines(iif(strand_count < 3, 3, strand_count), .1, identifier);
var from_offset_line = results[0]
var to_offset_line = results[1]

var attributes = {};
var line_adds = [];
var junction_adds = [];
var junction_updates = [];
var cnt_from_open_ports = Count(from_port_features['openport']);
var cnt_to_open_ports = Count(to_port_features['openport']);
for (var j = 0; j < strand_count; j++) {
    attributes = {
        'AssetGroup': strands_AG,
        'AssetType': strands_AT,
        'Identifier': j + 1,
        'IsSpatial': 0,
        'fromsnap': $feature.fromsnap,
        'FromGUID': $feature.FromGUID,
        'tosnap': $feature.tosnap,
        'ToGUID': $feature.ToGUID
    };
    var line_shape = Dictionary(Text(Geometry($feature)));
    if ($feature.fromsnap == 'splice') {
        var splice_from_info = splice_end_point(from_port_features, from_offset_line, j, $feature.FromGUID);

        if (!IsEmpty(splice_from_info[0])) {
            line_shape['paths'][0][0] = point_to_array(splice_from_info[0]);
        } else {
            line_shape['paths'][0][0] = point_to_array(from_offset_line[j]);
        }
        if (!IsEmpty(splice_from_info[1])) {
            junction_adds[Count(junction_adds)] = splice_from_info[1];
        }
        if (!IsEmpty(splice_from_info[2])) {
            junction_updates[Count(junction_updates)] = splice_from_info[2];
        }

    } else if ($feature.fromsnap == 'splitter') {
        if (cnt_from_open_ports > 0) {
            line_shape['paths'][0][0] = point_to_array(from_port_features['openport'][0]['geometry']);
        } else {
            line_shape['paths'][0][0] = point_to_array(from_offset_line[j]);
        }
    } else if ($feature.fromsnap == 'pass-through') {
        if (cnt_from_open_ports > j) {
            line_shape['paths'][0][0] = point_to_array(from_port_features['openport'][j]['geometry']);
        } else {
            line_shape['paths'][0][0] = point_to_array(from_offset_line[j]);
        }
    } else {
        line_shape['paths'][0][0] = point_to_array(from_offset_line[j]);
    }

    if ($feature.tosnap == 'splice') {
        var splice_to_info = splice_end_point(to_port_features, to_offset_line, j, $feature.ToGUID);
        if (!IsEmpty(splice_to_info[0])) {
            line_shape['paths'][0][-1] = point_to_array(splice_to_info[0]);
        } else {
            line_shape['paths'][0][-1] = point_to_array(to_offset_line[j]);
        }
        if (!IsEmpty(splice_to_info[1])) {
            junction_adds[Count(junction_adds)] = splice_to_info[1];
        }
        if (!IsEmpty(splice_to_info[2])) {
            junction_updates[Count(junction_updates)] = splice_to_info[2];
        }
    } else if ($feature.tosnap == 'splitter') {
        if (cnt_to_open_ports > 0) {
            line_shape['paths'][0][-1] = point_to_array(to_port_features['openport'][0]['geometry']);
        } else {
            line_shape['paths'][0][-1] = point_to_array(to_offset_line[j]);
        }
    } else if ($feature.tosnap == 'pass-through') {
        if (cnt_to_open_ports > j) {
            line_shape['paths'][0][-1] = point_to_array(to_port_features['openport'][j]['geometry']);
        } else {
            line_shape['paths'][0][-1] = point_to_array(to_offset_line[j]);
        }
    } else {
        line_shape['paths'][0][-1] = point_to_array(to_offset_line[j]);
    }

    line_adds[Count(line_adds)] = {
        'attributes': attributes,
        'geometry': Polyline(line_shape),//Polyline({'paths': line_shape['paths'], 'spatialReference': line_shape['spatialReference']}),
        'associationType': 'content'
    };
}
var edit_payload = [{'className': line_class, 'adds': line_adds}];
if (Count(junction_adds) > 0) {
    edit_payload[Count(edit_payload)] = {'className': device_class, 'adds': junction_adds}
}
if (Count(junction_updates) > 0) {
    edit_payload[Count(edit_payload)] = {'className': device_class, 'updates': junction_updates}
}
return {
    "result": identifier,
    "edit": edit_payload
};