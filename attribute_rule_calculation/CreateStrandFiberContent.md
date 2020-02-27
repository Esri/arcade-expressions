# Create content in a line

This calculation attribute rule create content in a line and optionally end points

## Use cases

To add fiber tubes in a cable or strands and fiber ends in a tube

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert
  - **Exclude from application evaluation:** True


## Expression Template

This Arcade expression creates content in a line and optionally end points [Example](./CreateStrandFiberContent.zip)

```js
// This rule will generate contained spatial/non spatial features

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation
var identifier = $feature.Identifier;
var device_class = 'CommunicationsDevice';
var line_class = 'CommunicationsLine';
var rule_type = "create_tubes"; //create_tubes or create_strands

var create_end_junctions;
var contained_features_AG;
var contained_features_AT;
// If Create End Junctions is true, define the class and AG/AT of those below
var end_feature_AG;
var end_feature_AT;
var use_device_as_container = false;
var container_fs = null;
var container_sql = null;
var valid_asset_types = [];
if (rule_type == 'create_tubes') {
    valid_asset_types = [44];
    contained_features_AG = 2;
    contained_features_AT = 21;
    create_end_junctions = false;
} else {
    valid_asset_types = [21];
    create_end_junctions = true;
    contained_features_AG = 9;
    contained_features_AT = 163;
    end_feature_AG = 8;
    end_feature_AT = 66;
    if (use_device_as_container) {
        container_fs = FeatureSetByName($datastore, "CommunicationsDevice", ["globalid", "assetgroup", 'assettype'], false);
        // Equipment:Patch Panel and Splice:Fiber
        container_sql = '(AssetGroup = 7 and AssetType = 129) or (AssetGroup = 10 and AssetType = 33)';
    } else {
        container_fs = FeatureSetByName($datastore, "CommunicationsAssembly", ["globalid", "assetgroup", 'assettype'], false);
        container_sql = '(AssetGroup = 1 and AssetType = 1)';
    }
}


// ************* End Section *****************

// ************ Not used at this time**************
function create_perp_line_old(location, line_geo, dist, length_line) {
    //Get the fist point of the line
    var line_vertices = line_geo['paths'][0];
    var line_start_point = line_vertices[0];

    //Buffer the point and clip the line
    var search = Extent(Buffer(location, dist));
    var segment = Clip(line_geo, search);
    var segment_vertices = segment['paths'][0];
    var segment_start_point = segment_vertices[0];

    //Offset the clipped segment positive and negative
    var offset_a = offset(segment, length_line);
    var offset_b = offset(segment, -length_line);

    var offset_a_vertices = offset_a['paths'][0];
    var offset_b_vertices = offset_b['paths'][0];
    var polyline_json;
    if (Round(segment_start_point['x'], 2) == Round(line_start_point['x'], 2) &&
        Round(segment_start_point['y'], 2) == Round(line_start_point['y'], 2)) {
        polyline_json = {
            "paths": [[offset_a_vertices[-1], offset_b_vertices[-1]]],
            "spatialReference": line_geo.spatialReference
        };
    } else {
        polyline_json = {
            "paths": [[offset_a_vertices[0], offset_b_vertices[0]]],
            "spatialReference": line_geo.spatialReference
        };
    }
    return Polyline(polyline_json);
}

function offset_point(pnt, i, sr, delta) {
    var angle = 0.1 * i;
    var new_x = pnt['x'] + (angle) * Cos(angle);
    var new_y = pnt['y'] + (angle) * Sin(angle);
    return Point({'x': new_x, 'y': new_y, 'z': i, "spatialReference": sr});
    //var theta = i / 20 * PI;
    //var delta =  delta * theta;
    // var new_point = {
    //     "x": pnt['x'] + delta * Cos(theta),
    //     "y": pnt['y'] + delta * Sin(theta),
    //     "z": pnt['z'] + i,
    //     "spatialReference": sr
    // };
    return Point(new_point)
}

function moved_point_on_line(location, line_geo, dist) {
    var search = Extent(Buffer(location, dist));
    var segment = Clip(line_geo, search)["paths"][0];
    var vertices = line_geo['paths'][0];
    var start_point = vertices[0];
    if (Round(segment[0]['x'], 2) == Round(start_point['x'], 2) &&
        Round(segment[0]['y'], 2) == Round(start_point['y'], 2)) {
        return segment[-1]
    }
    return segment[0]
}

// ************* End Section *****************

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

function create_perp_line(location, line_geo, dist, length_line) {
    //Get the fist point of the line
    var line_vertices = line_geo['paths'][0];
    var line_start_point = line_vertices[0];

    //Buffer the point and clip the line
    var search = Extent(Buffer(location, length_line));
    var segment = Clip(line_geo, search);
    var segment_vertices = segment['paths'][0];
    var segment_start_point = segment_vertices[0];
    segment = Rotate(segment, 90);
    var offset_dist = iif(length_line / 2 > dist, length_line / 2 - dist, -(dist - length_line / 2));

    if (Round(segment_start_point['x'], 2) == Round(line_start_point['x'], 2) &&
        Round(segment_start_point['y'], 2) == Round(line_start_point['y'], 2)) {
        segment = offset(segment, -offset_dist);
    } else {
        segment = offset(segment, offset_dist);

    }
    return segment;
}

function is_even(value) {
    return (Number(value) % 2) == 0;
}

function get_tube_count(fiber_count, design) {
    // Return the tube count based on strands
    if (fiber_count <= 5) {
        return 1;
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
    } else if (fiber_count <= 360 && design == 1) {
        return 30;
    } else if (fiber_count <= 432 && design == 1) {
        return 36;
    } else if (fiber_count <= 372 && design == 2) {
        return 30;
    } else if (fiber_count <= 456 && design == 2) {
        return 36;
    }
    return null;
}

if (indexof(valid_asset_types, $feature.assettype) == -1) {
    return identifier;

}
if (IsEmpty(identifier) && rule_type == "create_strands") {
    return {'errorMessage': 'Identifier is required'};
}

var num_childs = null;
var content_val_to_set = null;
if (rule_type == "create_tubes") {

    var fiber_count = $feature.ContentCount;
    var cable_design = $feature.CableDesign;

    if (is_even(fiber_count) == false) {
        return {'errorMessage': 'Fiber count must be even'};
    }

    num_childs = get_tube_count(fiber_count, cable_design);

    if (IsEmpty(num_childs)) {
        return {'errorMessage': 'Tube count not be calculated based on the design and fiber count'};
    }
    content_val_to_set = fiber_count / num_childs;
    if (content_val_to_set % 1 != 0) {
        return {
            'errorMessage': 'Fiber per tube distribution is not uniform: ' +
                'Fiber Count:' + fiber_count + TextFormatting.NewLine +
                'Tube Count:' + num_childs + TextFormatting.NewLine +
                'Strands Per Tube:' + content_val_to_set
        };
    }
} else if (rule_type == "create_strands") {
    num_childs = $feature.ContentCount;
}
// Get the start and end vertex of the line
var geo = Geometry($feature);
var vertices = geo['paths'][0];
var sr = geo.spatialReference;
var start_point = vertices[0];
var end_point = vertices[-1];


var start_container_guid = null;
var end_container_guid = null;
if (IsEmpty(container_fs) == false) {
    var container_feat = First(Filter(Intersects(container_fs, Point(start_point)), container_sql));
    if (container_feat != null && IsEmpty(container_feat) == false) {
        start_container_guid = container_feat.globalid
    }
    container_feat = First(Filter(Intersects(container_fs, Point(end_point)), container_sql));
    if (container_feat != null && IsEmpty(container_feat) == false) {
        end_container_guid = container_feat.globalid
    }
}
if (create_end_junctions) {
    var end_line = create_perp_line(end_point, geo, identifier * .1, 2 + identifier * .1);
    end_line = adjust_z(end_line, identifier);
    end_line = densify(end_line, (length(end_line) / num_childs))['paths'][0];
    var vertex_cnt = count(end_line);

    var new_end = [];
    for (var v = 0; v < count(end_line); v++) {
        if (v == 0 || v == vertex_cnt - 1 || v % (vertex_cnt / num_childs) < 1) {
            new_end[Count(new_end)] = end_line[v]
        }
    }
    end_line = new_end;
    var start_line = create_perp_line(start_point, geo, identifier * .1, 2 + identifier * .1);
    start_line = adjust_z(start_line, identifier);
    start_line = densify(start_line, (length(start_line) / num_childs))['paths'][0];
    var vertex_cnt = count(start_line);

    var new_start = [];
    for (var v = 0; v < count(start_line); v++) {
        if (v == 0 || v == vertex_cnt - 1 || v % (vertex_cnt / num_childs) < 1) {
            new_start[Count(new_start)] = start_line[v]
        }
    }
    start_line = new_start;
}
var attributes = {};
var line_adds = [];
var junction_adds = [];

for (var j = 0; j < num_childs; j++) {

    attributes = {
        'AssetGroup': contained_features_AG,
        'AssetType': contained_features_AT,
        'Identifier': j + 1,
        'IsSpatial': 0,
    };
    if (IsEmpty(content_val_to_set) == false) {
        attributes['ContentCount'] = content_val_to_set
    }

    var line_shape = Dictionary(Text(Geometry($feature)));

    if (create_end_junctions) {
        var start_attributes = {
            'AssetGroup': end_feature_AG,
            'AssetType': end_feature_AT,
            'Tube': identifier,
            'Strand': j + 1,
            'ContainerGUID': start_container_guid,
            'IsSpatial': 0,
        };

        junction_adds[Count(junction_adds)] = {
            'attributes': start_attributes,
            'geometry': start_line[j]
        };
        var end_attributes = {
            'AssetGroup': end_feature_AG,
            'AssetType': end_feature_AT,
            'Tube': identifier,
            'Strand': j + 1,
            'ContainerGUID': end_container_guid,
            'IsSpatial': 0,
        };

        junction_adds[Count(junction_adds)] = {
            'attributes': end_attributes,
            'geometry': end_line[j]
        };
        line_shape['paths'][0][0] = start_line[j];
        line_shape['paths'][0][-1] = end_line[j];

    }

    line_adds[Count(line_adds)] = {
        'attributes': attributes,
        'geometry': Polyline(line_shape),
        'associationType': 'content'
    };
}
var edit_payload = [{'className': line_class, 'adds': line_adds}];
if (Count(junction_adds) > 0) {
    edit_payload[Count(edit_payload)] = {'className': device_class, 'adds': junction_adds}
}
return {
    "result": identifier,
    "edit": edit_payload
};

```
