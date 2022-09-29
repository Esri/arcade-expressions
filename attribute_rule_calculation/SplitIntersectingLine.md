# Split intersecting line

This calculation attribute rule split a line when a point is placed

## Use cases

Split a water main when a valve is placed

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Update

## Expression Template

This Arcade expression will split a line when a point is placed.  [Example](./SplitIntersectingLine.zip)

```js
// The field to not move to a new field, edit tracking fields need to be remove
// All fields listed here, need to be in upper case, they are forced to upper in the logic below.
var remove_fields_from_new_feature = ['SHAPE_LENGTH', 'GLOBALID', 'OBJECTID'];

// The line class to split
var line_class_name = "Line";
// This is used to get Non Editable fields, do not change the fields from *
var line_fs = FeatureSetByName($datastore, "Line", ['*'], true);
var use_cutter = true;

// When the line is split, a new vertex is added, this could be within a distance of an existing vertex, this tolerance will remove that closest one
var remove_vertex_tolerance = .00002;

// ************* End User Variables Section *************


function get_fields_by_type(feat, convert_string, param, value) {
    var fields = Schema(feat).fields;
    var return_fields = [];
    var func = Decode(Lower(convert_string), "lower", Lower, "upper", Upper, Text)

	for (var f in fields) {
		if (fields[f][param] == value) {
			var fld_name = fields[f].name
			if (!IsEmpty(convert_string)) {
				fld_name = func(fld_name);
			}
			Push(return_fields, fld_name)
		}
	}
	return return_fields
}
function set_date_type(feat, dict){
    // Dates need to be set to date types for some platforms
    var dt_keys = get_fields_by_type(feat, dict, 'type', 'esriFieldTypeDate')
    for (var k in dict) {
        if (IndexOf(dt_keys, Upper(k)) == -1) {
            continue
        }
        dict[k] = Date(dict[k]);
    }
    return dict
}
function dist_to_line(start_coord, end_coord, point_coord) {
    var Dx = end_coord[0] - start_coord[0];
    var Dy = end_coord[1] - start_coord[1];
    return ABS(Dy * point_coord[0] - Dx * point_coord[1] - start_coord[0] * end_coord[1] + end_coord[0] * start_coord[1]) / SQRT(POW(Dx, 2) + POW(Dy, 2));
}

function compare_coordinate(source_geo, coordinate) {
    // TODO, probably move to Equals and compare the geometry
    if (Round(coordinate[0], 2) != Round(source_geo.X, 2) ||
        Round(coordinate[1], 2) != Round(source_geo.Y, 2)) {
        return false
    }
    return true;
    // TODO - Figure out Z
    if (Count(coordinate > 2) && IsEmpty(source_geo.Z) == false) {
        if (Round(coordinate[2], 2) != Round(source_geo.Z, 2)) {
            return false
        }
    }
    return true
}


function pop_keys(dict, keys) {
    var new_dict = {};
    for (var k in dict) {
        if (IndexOf(keys, Upper(k)) != -1) {
            continue
        }
        new_dict[k] = dict[k];
    }
    return new_dict
}


function cut_line_at_point_cutter(line_feature, point_geometry) {
    var search = Extent(Buffer(point_geometry, .1, "meter"));
    var geo = Geometry(line_feature);
    var segment = Clip(geo, search)["paths"][0];

    // Rotate logic - https://stackoverflow.com/questions/45701615/how-can-i-rotate-a-line-segment-around-its-center-by-90-degrees
    // Start and end points of the line
    var x1 = segment[0]['x']
    var y1 = segment[0]['y']
    var x2 = segment[-1]['x']
    var y2 = segment[-1]['y']
    //find the center
    var cx = (x1 + x2) / 2;
    var cy = (y1 + y2) / 2;

    //move the line to center on the origin
    x1 -= cx;
    y1 -= cy;
    x2 -= cx;
    y2 -= cy;

    //rotate both points
    var xtemp = x1;
    var ytemp = y1;
    x1 = -ytemp;
    y1 = xtemp;

    xtemp = x2;
    ytemp = y2;
    x2 = -ytemp;
    y2 = xtemp;

    //move the center point back to where it was
    x1 += cx;
    y1 += cy;
    x2 += cx;
    y2 += cy;

    var cutter = Polyline({
        "paths": [[[x1, y1], [x2, y2]]],
        "spatialReference": {"wkid": geo.spatialReference.wkid}
    });
    var new_lines = Cut(line_feature, cutter);
    var line_a = Dictionary(Text(new_lines[0]))
    var line_b = Dictionary(Text(new_lines[1]))
    line_a['paths'] = remove_vertex(line_a['paths'])
    line_b['paths'] = remove_vertex(line_b['paths'])
    return [Polyline(line_a), Polyline(line_b)]
}

function remove_vertex(path_array) {
    var current_path = path_array[0]
    var vertex_count = Count(current_path)
    if (vertex_count > 2) {
        var dif_x = ABS(current_path[0][0] - current_path[1][0])
        var dif_y = ABS(current_path[0][1] - current_path[1][1])
        if (dif_x <= remove_vertex_tolerance && dif_y <= remove_vertex_tolerance) {
            var new_path = []
            for (var i in current_path) {
                if (i != 1) {
                    Push(new_path, current_path[i]);
                }
            }
            current_path = new_path
        }
    }
    path_array[0] = current_path
    current_path = path_array[-1]
    vertex_count = Count(current_path)
    if (Count(current_path) > 2) {
        var dif_x = ABS(current_path[-1][0] - current_path[-2][0])
        var dif_y = ABS(current_path[-1][1] - current_path[-2][1])

        if (dif_x <= remove_vertex_tolerance && dif_y <= remove_vertex_tolerance) {
            var new_path = []
            for (var i in current_path) {
                if (i != vertex_count - 2) {
                    Push(new_path, current_path[i]);
                }
            }
            current_path = new_path
        }
    }
    path_array[-1] = current_path
    return path_array
}

function cut_line_at_point(line_geometry, point_geometry) {
    var point_coord = null;
    var interpolate_z = false;
    // Check if the line has already been converted to a dict
    var line_shape = null;
    if (TypeOf(line_geometry) == 'Dictionary') {
        line_shape = line_geometry;
    } else {
        line_shape = Dictionary(Text(line_geometry));
    }
    // Get the Z info and determine if Zs should be return/interpolated in lines
    // TODO: Handle M's
    if (Count(line_shape['paths'][0][0]) >= 3 && IsEmpty(point_geometry.Z)) {
        point_coord = [point_geometry.X, point_geometry.Y];
        interpolate_z = true
    } else if (Count(line_shape['paths'][0][0]) >= 3 && IsEmpty(point_geometry.Z) == false) {
        point_coord = [point_geometry.X, point_geometry.Y, point_geometry.Z];
    } else {
        point_coord = [point_geometry.X, point_geometry.Y];
    }

    // If the point is at the start or end, skip splitting line
    if (compare_coordinate(point_geometry, line_shape['paths'][0][0]) || compare_coordinate(point_geometry, line_shape['paths'][-1][-1])) {
        continue;
    }
    var split_found = false;
    var new_shape_1 = [];
    var new_shape_2 = [];
    var split_found = false;

    for (var i in line_shape['paths']) {
        var current_path = line_shape['paths'][i];

        var new_path_1 = [];
        var new_path_2 = [];

        for (var j in current_path) {
            // Split has occurs, just store the rest of the paths and segments in segment 2
            if (split_found == true) {
                Push(new_path_2, current_path[j]);
                continue
            }
            // Add the coordinate to both features if the split is on the from
            // NOTE, as this is on a known vertex, no Z interpolation should be needed
            if (compare_coordinate(point_geometry, current_path[j])) {
                Push(new_path_1, point_coord);
                Push(new_path_2, point_coord);
                split_found = true;
                continue;
            }
            // Save the last coordinate of a path
            if (Count(current_path) == j - 1) {
                Push(new_path_1, current_path[j]);
                continue;
            }
            // If the To is the last coordinate and matches the point, continue
            if (compare_coordinate(point_geometry, current_path[j + 1])) {
                Push(new_path_1, current_path[j]);
                continue;
            }
            // Check to see if point is between vertexs
            var from_coord = current_path[j];
            var to_coord = current_path[j + 1];
            //TODO: Interpolate Z values if present based on percentage split occurs
            //TODO: reevaluate distance to line function, do we need to build in a fuzzy tolerance, could construct
            // a line and use intersect function
            if (dist_to_line(from_coord, to_coord, point_coord) < .01) {
                Push(new_path_1, current_path[j]);
                Push(new_path_1, point_coord);
                // Start the next line
                Push(new_path_2, point_coord);
                split_found = true;
                continue
            }
            // Save the coordinate in first segment and move on to next point
            Push(new_path_1, current_path[j]);

        }
        // Save the paths to the new path collections
        if (Count(new_path_1) > 0) {
            Push(new_shape_1, new_path_1);
        }
        if (Count(new_path_2) > 0) {
            Push(new_shape_2, new_path_2);
        }
    }
    return [new_shape_1, new_shape_2];
}


var intersecting_lines = Intersects(line_fs, $feature);

var point_geometry = Geometry($feature);

var update_features = [];
var new_features = [];

var new_geoms = [];
// Loop through lines to split

for (var line_feature in intersecting_lines) {
	
    var polyline_1 = null;
    var polyline_2 = null;
    if (use_cutter) {
        new_geoms = cut_line_at_point_cutter(line_feature, point_geometry)
        // If a split was not found, do not modify the feature
        if (Count(new_geoms) != 2) {
            continue;
        }
        polyline_1 = new_geoms[0]
        polyline_2 = new_geoms[1]
    } else {
        new_geoms = cut_line_at_point(Geometry(line_feature), point_geometry)
        // If a split was not found, do not modify the feature
        if (Count(new_geoms) != 2) {
            continue;
        }
        var line_spat_ref = Geometry(line_feature).spatialReference.wkid;
        var new_geom_1 = remove_vertex(new_geoms[0])
        var new_geom_2 = remove_vertex(new_geoms[1])
        polyline_1 = Polyline({"paths": new_geom_1, "spatialReference": {"wkid": line_spat_ref}});
        polyline_2 = Polyline({"paths": new_geom_2, "spatialReference": {"wkid": line_spat_ref}});
    }
    var polyline_1_length = Length(polyline_1);
    var polyline_2_length = Length(polyline_2);

    // Convert feature to dictionary to get all its attributes
    var line_att = Dictionary(Text(line_feature))['attributes'];
	var atts_to_remove = get_fields_by_type(line_feature, 'Upper', 'editable', false);
	for (var i in remove_fields_from_new_feature){
		var fld = Upper(remove_fields_from_new_feature[i]);
		if (IndexOf(atts_to_remove, fld) != 1) {
			continue;
		}
		Push(atts_to_remove, fld);
	}
	line_att = set_date_type(line_feature, pop_keys(line_att, atts_to_remove));
    // Check length of new shapes, adjust the current feature to the longest segment
    if (polyline_1_length > polyline_2_length) {
        Push(update_features, {
            'globalID': line_feature.globalID,
            'geometry': polyline_1
        });
        Push(new_features,
            {
                //'globalID': GUID(),
                'geometry': polyline_2,
                'attributes': line_att
            });
    } else {
        Push(update_features, {
            'globalID': line_feature.globalID,
            'geometry': polyline_2
        });
        Push(new_features,
            {
                //'globalID': GUID(),
                'geometry': polyline_1,
                'attributes': line_att
            });
    }
}

// Only include edit info when a split was required
if (Count(update_features) > 0 && Count(new_features)) {
	var results = {};
    results['edit'] = [{
        'className': line_class_name,
        'updates': update_features,
        'adds': new_features
    }]
	return results;
}

return

```
