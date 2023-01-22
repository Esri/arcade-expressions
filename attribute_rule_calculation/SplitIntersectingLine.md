# Split intersecting line

This calculation attribute rule split a line when a point is placed

## Use cases

Split a line when a point is placed.  There is special logic for the Utility Network and requires two rules.  One on the line and one on the point.
Clients like ArcGIS Pro insert a vertex on a line when a point is snapped to it.  This causes an apply edits to the line and point.  The point AR
is fired first, which reshapes and adds the new line.  Then the apply edits to add the new vertex is applied, which is the original line
geometry plus the new vertex.  So the code below is set up for the UN, where if the point is on a vertex, it splits the line, but if 
the point is not on the vertex, it does nothing as the AR on the line detects if the line has a new vertex inserted and if that vertex 
is on point feature with that passes the exit early logic. 


## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.

Device
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert, maybe update

Line
  - **Rule Type:** Calculation
  - **Triggering Events:** Update

## Expression Template

This Arcade expression will split a line when a point is placed.  [Example](./SplitIntersectingLine.zip)

## Device
```js
// NOTE: This is not tested on multipart lines
// NOTE: The intersect seems to be failing on large lines in GCS, we could evaluating buffering the point for a better intersect

Expects($feature, 'SplitInt', 'SplitText');
// Exit Early Code
// If you want to exit and not split a interesting line based on a point value, fill out a dict
// with field name as the key and the values as an array to exit early
// Make sure to list these fields in the Expects
var exit_early_values = Dictionary('SplitInt', [200],'SplitText', ['DontSplitTheLine']);

// The field to not move to a new field, edit tracking fields need to be remove
// All fields listed here, need to be in upper case, they are forced to upper in the logic below.
var remove_fields_from_new_feature = ['SHAPE_LENGTH', 'GLOBALID', 'OBJECTID'];

// The line class to split
var line_class_name = "line";
// This is used to get Non Editable fields, do not change the fields from *
var line_fs = FeatureSetByName($datastore, "line", ['*'], true);

// Set this when using decimal degrees, it adjust the tolerances
var decimal_degrees = false;

// How man decimals to round coordinates to check if identical
// GCS should use a large value, such as 9
// PCS should use a value such as 4
var compare_coordinate_round_value = 2;

// When walking the line to split, a line is created between pairs of vertex
// this value is the distance ito determine if the created point is on that line
// GCS should use a small value, such as 0.0001
// PCS should use a larger value, such as 0.1
var point_on_line_tol = 0.1;

// For some scales, and large GCS lines, intersect does not return intersecting lines
// Setting this value uses a polygon buffer of the point for the intersect
// PCS should use a value such as 0.02
// GCS should use a value such as 0.00000002
var buffer_pnt_distance = 0;

if (decimal_degrees) {

    compare_coordinate_round_value = 9;
    point_on_line_tol = 0.00001;
    if (buffer_pnt_distance != 0) {
        buffer_pnt_distance = 0.00000002;
    }
}

// option to skip logic to remove duplicate vertex at the start and end of line, this may be caused by splitting on
// a vertex
var remove_dup_vertex = true;

// When the point and line are un controlled, we cannot split a line when the point is midspan(not at a vertex)
var is_un_controlled = true;

// ************* End User Variables Section *************


function get_fields_by_type(feat, convert_string, param, value) {
    var fields = Schema(feat).fields;
    var return_fields = [];
    var func = Decode(Lower(convert_string), "lower", Lower, "upper", Upper, Text);

    for (var f in fields) {
        if (fields[f][param] == value) {
            var fld_name = fields[f].name;
            if (!IsEmpty(convert_string)) {
                fld_name = func(fld_name);
            }
            Push(return_fields, fld_name);
        }
    }
    return return_fields;
}

function set_date_type(feat, dict) {
    // Dates need to be set to date types for some platforms
    var dt_keys = get_fields_by_type(feat, 'upper', 'type', 'esriFieldTypeDate');
    for (var k in dict) {
        if (IndexOf(dt_keys, Upper(k)) == -1) {
            continue;
        }
        dict[k] = Date(dict[k]);
    }
    return dict;
}

function pDistance(x, y, x1, y1, x2, y2) {
  // adopted from https://stackoverflow.com/a/6853926
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  var is_vertex = false;
  if (compare_coordinate(x, y, x1, y1)) {
       is_vertex = true;
  }
  if (compare_coordinate(x, y, x2, y2)) {
       is_vertex = true;
  }

  if (param < 0) {
   // is_vertex = true;
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
 //  is_vertex = true;
    xx = x2;
    yy = y2;
  }
  else {
  //  is_vertex = false;
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return [Sqrt(dx * dx + dy * dy), [xx, yy], is_vertex];
}

function compare_coordinate(x, y, x1, y1) {

    // TODO, probably move to Equals and compare the geometry
    if ((Round(x1, compare_coordinate_round_value) != Round(x, compare_coordinate_round_value)) ||
        (Round(y1, compare_coordinate_round_value) != Round(y, compare_coordinate_round_value)) ){
        return false;
    }
    return true;
    // TODO - Figure out Z
    if (Count(coordinate > 2) && IsEmpty(source_geo.Z) == false) {
        if (Round(coordinate[2], 2) != Round(source_geo.Z, 2)) {
            return false;
        }
    }
    return true;
}


function pop_keys(dict, keys) {
    var new_dict = {};
    for (var k in dict) {
        if (IndexOf(keys, Upper(k)) != -1) {
            continue;
        }
        new_dict[k] = dict[k];
    }
    return new_dict;
}

function remove_vertex(path_array) {
    if (!remove_dup_vertex){
        return path_array;
    }
    var new_path = [];
    var current_path = path_array[0];
    var vertex_count = Count(current_path);
    if (vertex_count > 2) {
        if (compare_coordinate(current_path[0][0],current_path[0][1],current_path[1][0],current_path[1][1])) {
            for (var i in current_path) {
                if (i != 1) {
                    Push(new_path, current_path[i]);
                }
            }
            current_path = new_path;
        }
    }
    new_path = [];
    path_array[0] = current_path;
    current_path = path_array[-1];
    vertex_count = Count(current_path);
    if (Count(current_path) > 2) {
        if (compare_coordinate(current_path[-1][0],current_path[-1][1],current_path[-2][0],current_path[-2][1])) {
            for (var i in current_path) {
                if (i != vertex_count - 2) {
                    Push(new_path, current_path[i]);
                }
            }
            current_path = new_path;
        }
    }
    path_array[-1] = current_path;
    return path_array;
}

function cut_line_at_point(line_geometry, point_geometry, exit_when_not_at_vertex) {
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
        interpolate_z = true;
    } else if (Count(line_shape['paths'][0][0]) >= 3 && IsEmpty(point_geometry.Z) == false) {
        point_coord = [point_geometry.X, point_geometry.Y, point_geometry.Z];
    } else {
        point_coord = [point_geometry.X, point_geometry.Y];
    }

    // If the point is at the start or end, skip splitting line
    if (compare_coordinate(point_coord[0],point_coord[1], line_shape['paths'][0][0][0], line_shape['paths'][0][0][1]) ||
        compare_coordinate(point_coord[0],point_coord[1], line_shape['paths'][-1][-1][0],line_shape['paths'][-1][1])) {
        return [];
    }

    var min_distance = point_on_line_tol * 2;
    var segment_id = [];
    var line_path = line_shape['paths'];

    for (var i in line_path) {
        var current_path = line_path[i];
        // Loop over vertex, exit when at last vertex
        for (var j = 0 ; j < Count(current_path) - 1 ; j++) {
            var from_coord = current_path[j];
            var to_coord = current_path[j + 1];
            var shortest = pDistance(point_coord[0], point_coord[1], from_coord[0], from_coord[1], to_coord[0],to_coord[1]);
            var distance =  shortest[0];
	        var coordinates = shortest[1];
	        var isVertex =  shortest[2];
            //push(segment_id, [i, j, coordinates, isVertex,distance*100000])
            if (distance <= min_distance) {
                segment_id = [i, j, coordinates, isVertex];
                min_distance = distance;
            }
        }
    }
    if (IsEmptyButBetter(segment_id))
    {
        return [];
    }
    // Since we not on a vertex, pro for UN classes, needs to insert one, so we cannot split the line
    if (exit_when_not_at_vertex && segment_id[-1] == false){
         return [];
    }
    var new_path_1 = Slice(line_path,0,segment_id[0]+1);
    var new_path_2 = Slice(line_path,segment_id[0]);

    var new_seg_1= slice(new_path_1[-1],0, segment_id[1]+1);
    Push(new_seg_1, segment_id[2]);
    new_path_1[-1] = new_seg_1;

    var new_seg_2= slice(new_path_2[0],segment_id[1] + 1);
    Insert(new_seg_2,0, point_coord);
    new_path_2[0] = new_seg_2;
    return [new_path_1, new_path_2];

}

// Used to check different empty null states, override of core IsEmpty
function IsEmptyButBetter(data) {
    if (IsEmpty(data)) return true;
    for (var x in data) return false;
    return true;
}

function check_exit_early(feat) {
    if (IsEmptyButBetter(exit_early_values)) {
        return false;
    }
    for (var k in exit_early_values) {
        if (Includes(exit_early_values[k], feat[k])) {
            return true;
        }
    }
    return false;
}

if (check_exit_early($feature)) {
    return;
}
var intersecting_lines;
if (buffer_pnt_distance == null || buffer_pnt_distance <= 0) {
    intersecting_lines = Intersects($feature, line_fs);
} else {
    intersecting_lines = Intersects(Buffer($feature, buffer_pnt_distance), line_fs);
}

var in_point_geometry = Geometry($feature);

var update_features = [];
var new_features = [];

var new_geoms = [];
// Loop through lines to split
for (var line_feature in intersecting_lines) {

    var polyline_1 = null;
    var polyline_2 = null;

    new_geoms = cut_line_at_point(Geometry(line_feature), in_point_geometry, is_un_controlled);
    // If a split was not found, do not modify the feature
    if (Count(new_geoms) != 2) {
        continue;
    }
    var new_geom_1 = new_geoms[0];
    var new_geom_2 = new_geoms[1];
    if (Count(new_geom_2) == 0 || Count(new_geom_1) == 0) {
        continue;
    }
    var line_spat_ref = Geometry(line_feature).spatialReference.wkid;

    var new_geom_1 = remove_vertex(new_geom_1);
    var new_geom_2 = remove_vertex(new_geom_2);
    polyline_1 = Polyline({
        "paths": new_geom_1,
        "spatialReference": {
            "wkid": line_spat_ref
        }
    });
    polyline_2 = Polyline({
        "paths": new_geom_2,
        "spatialReference": {
            "wkid": line_spat_ref
        }
    });

    var polyline_1_length = Length(polyline_1);
    var polyline_2_length = Length(polyline_2);

    // Convert feature to dictionary to get all its attributes
    var line_att = Dictionary(Text(line_feature))['attributes'];
    var atts_to_remove = get_fields_by_type(line_feature, 'upper', 'editable', false);
    for (var i in remove_fields_from_new_feature) {
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
        Push(new_features, {
            //'globalID': GUID(),
            'geometry': polyline_2,
            'attributes': line_att
        });
    } else {
        Push(update_features, {
            'globalID': line_feature.globalID,
            'geometry': polyline_2
        });
        Push(new_features, {
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

return;
```

## Line
```js
// NOTE: This is not tested on multipart lines
// NOTE: The intersect seems to be failing on large lines in GCS, we could evaluating buffering the point for a better intersect

// Exit Early Code
// If you want to exit and not split a interesting line based on a point value, fill out a dict
// with field name as the key and the values as an array to exit early
// Make sure to list these fields in the Expects
var exit_early_values = Dictionary('SplitInt', [200],'SplitText', ['DontSplitTheLine']);

// The field to not move to a new field, edit tracking fields need to be remove
// All fields listed here, need to be in upper case, they are forced to upper in the logic below.
var remove_fields_from_new_feature = ['SHAPE_LENGTH', 'GLOBALID', 'OBJECTID'];

// The point on the vertex
var point_class_name = "point";
var line_class_name = "line";
// This is used to get Non Editable fields, do not change the fields from *
var point_fs = FeatureSetByName($datastore, "point", ['*'], true);

// Set this when using decimal degrees, it adjust the tolerances
var decimal_degrees = false;

// How man decimals to round coordinates to check if identical
// GCS should use a large value, such as 9
// PCS should use a value such as 4
var compare_coordinate_round_value = 2;

// When walking the line to split, a line is created between pairs of vertex
// this value is the distance ito determine if the created point is on that line
// GCS should use a small value, such as 0.0001
// PCS should use a larger value, such as 0.1
var point_on_line_tol = 0.1;

// For some scales, and large GCS lines, intersect does not return intersecting lines
// Setting this value uses a polygon buffer of the point for the intersect
// PCS should use a value such as 0.02
// GCS should use a value such as 0.00000002
var buffer_pnt_distance = .02;

if (decimal_degrees) {

    compare_coordinate_round_value = 9;
    point_on_line_tol = 0.00001;
    if (buffer_pnt_distance != 0) {
        buffer_pnt_distance = 0.00000002;
    }
}

// option to skip logic to remove duplicate vertex at the start and end of line, this may be caused by splitting on
// a vertex
var remove_dup_vertex = true;

// ************* End User Variables Section *************


function get_fields_by_type(feat, convert_string, param, value) {
    var fields = Schema(feat).fields;
    var return_fields = [];
    var func = Decode(Lower(convert_string), "lower", Lower, "upper", Upper, Text);

    for (var f in fields) {
        if (fields[f][param] == value) {
            var fld_name = fields[f].name;
            if (!IsEmpty(convert_string)) {
                fld_name = func(fld_name);
            }
            Push(return_fields, fld_name);
        }
    }
    return return_fields;
}

function set_date_type(feat, dict) {
    // Dates need to be set to date types for some platforms
    var dt_keys = get_fields_by_type(feat, dict, 'type', 'esriFieldTypeDate');
    for (var k in dict) {
        if (IndexOf(dt_keys, Upper(k)) == -1) {
            continue;
        }
        dict[k] = Date(dict[k]);
    }
    return dict;
}

function pDistance(x, y, x1, y1, x2, y2) {
  // adopted from https://stackoverflow.com/a/6853926
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;
  var is_vertex = true;
  // Do we want to use tolerenaces
  // if (compare_coordinate(x, y, x1, y1)) {
  //     is_vertex = true;
  // }
  // if (compare_coordinate(x, y, x2, y2)) {
  //     is_vertex = true;
  // }

  if (param < 0) {
    is_vertex = true;
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
   is_vertex = true;
    xx = x2;
    yy = y2;
  }
  else {
    is_vertex = false;
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return [Sqrt(dx * dx + dy * dy), [xx, yy], is_vertex];
}

function compare_coordinate(x, y, x1, y1) {

    // TODO, probably move to Equals and compare the geometry
    if ((Round(x1, compare_coordinate_round_value) != Round(x, compare_coordinate_round_value)) ||
        (Round(y1, compare_coordinate_round_value) != Round(y, compare_coordinate_round_value)) ){
        return false;
    }
    return true;
    // TODO - Figure out Z
    if (Count(coordinate > 2) && IsEmpty(source_geo.Z) == false) {
        if (Round(coordinate[2], 2) != Round(source_geo.Z, 2)) {
            return false;
        }
    }
    return true;
}

function pop_keys(dict, keys) {
    var new_dict = {};
    for (var k in dict) {
        if (IndexOf(keys, Upper(k)) != -1) {
            continue;
        }
        new_dict[k] = dict[k];
    }
    return new_dict;
}

function remove_vertex(path_array) {
    if (!remove_dup_vertex){
        return path_array;
    }
    var new_path = [];
    var current_path = path_array[0];
    var vertex_count = Count(current_path);
    if (vertex_count > 2) {
        if (compare_coordinate(current_path[0][0],current_path[0][1],current_path[1][0],current_path[1][1])) {
            for (var i in current_path) {
                if (i != 1) {
                    Push(new_path, current_path[i]);
                }
            }
            current_path = new_path;
        }
    }
    new_path = [];
    path_array[0] = current_path;
    current_path = path_array[-1];
    vertex_count = Count(current_path);
    if (Count(current_path) > 2) {
        if (compare_coordinate(current_path[-1][0],current_path[-1][1],current_path[-2][0],current_path[-2][1])) {
            for (var i in current_path) {
                if (i != vertex_count - 2) {
                    Push(new_path, current_path[i]);
                }
            }
            current_path = new_path;
        }
    }
    path_array[-1] = current_path;
    return path_array;
}

function cut_line_at_point(line_geometry, point_geometry, exit_when_not_at_vertex) {
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
        interpolate_z = true;
    } else if (Count(line_shape['paths'][0][0]) >= 3 && IsEmpty(point_geometry.Z) == false) {
        point_coord = [point_geometry.X, point_geometry.Y, point_geometry.Z];
    } else {
        point_coord = [point_geometry.X, point_geometry.Y];
    }

    // If the point is at the start or end, skip splitting line
    if (compare_coordinate(point_coord[0],point_coord[1], line_shape['paths'][0][0][0], line_shape['paths'][0][0][1]) ||
        compare_coordinate(point_coord[0],point_coord[1], line_shape['paths'][-1][-1][0],line_shape['paths'][-1][1])) {
        return [];
    }

    var min_distance = point_on_line_tol * 2;
    var segment_id = [];
    var line_path = line_shape['paths'];

    for (var i in line_path) {
        var current_path = line_path[i];
        // Loop over vertex, exit when at last vertex
        for (var j = 0 ; j < Count(current_path) - 1 ; j++) {
            var from_coord = current_path[j];
            var to_coord = current_path[j + 1];
            var shortest = pDistance(point_coord[0], point_coord[1], from_coord[0], from_coord[1], to_coord[0],to_coord[1]);
            var distance =  shortest[0];
	        var coordinates = shortest[1];
	        var isVertex =  shortest[2];
            //push(segment_id, [i, j, coordinates, isVertex,distance*100000])
            if (distance <= min_distance) {
                segment_id = [i, j, coordinates, isVertex];
                min_distance = distance;
            }
        }
    }
    if (IsEmptyButBetter(segment_id))
    {
        return [];
    }
    // Since we not on a vertex, pro for UN classes, needs to insert one, so we cannot split the line
    if (exit_when_not_at_vertex && segment_id[-1] == false){
         return [];
    }
    var new_path_1 = Slice(line_path,0,segment_id[0]+1);
    var new_path_2 = Slice(line_path,segment_id[0]);

    var new_seg_1= slice(new_path_1[-1],0, segment_id[1]+1);
    Push(new_seg_1, segment_id[2]);
    new_path_1[-1] = new_seg_1;

    var new_seg_2= slice(new_path_2[0],segment_id[1] + 1);
    Insert(new_seg_2,0, point_coord);
    new_path_2[0] = new_seg_2;
    return [new_path_1, new_path_2];

}

// Used to check different empty null states, override of core IsEmpty
function IsEmptyButBetter(data) {
    if (IsEmpty(data)) return true;
    for (var x in data) return false;
    return true;
}

function check_exit_early(feat) {
    if (IsEmptyButBetter(exit_early_values)) {
        return false;
    }
    for (var k in exit_early_values) {
        if (Includes(exit_early_values[k], feat[k])) {
            return true;
        }
    }
    return false;
}

function get_first_new_vertex(new_geom, orig_geom) {

    var new_vertex = null;
    // Length of paths must be the same
    if (Count(orig_geom.paths) != Count(new_geom.paths)) {
        return null;
    }
    for (var i in new_geom.paths) {
        var path_len_orig = Count(orig_geom.paths[i]);
        var path_len_new = Count(new_geom.paths[i]);
        // There must only be 1 new vertex
        if (path_len_new - path_len_orig != 1) {
            continue;
        }
        // Loop over the vertex, store the first one that is not the same
        // If there are more than one, not the same, exit
        for (var j = 0, k = 0; j < path_len_new -1; j++) {

            if (!Equals(new_geom.paths[i][j], orig_geom.paths[i][k])) {
                // Store the new vertex, decrement the counter on original. so the rest of the vertex
                // are compared at the correct index
                if (new_vertex == null) {
                    new_vertex = new_geom.paths[i][j];
                    k--;
                } else {
                    // more than one is different, exit early
                    return null;
                }
            }
            k++;
        }

    }
    return new_vertex;
}

var current_geom = Geometry($feature);
var orig_geom = Geometry($originalFeature);
if (orig_gemo == null){
    return;
}
if (Equals(orig_geom, current_geom))
{
    return
}
var snap_vertex = get_first_new_vertex(current_geom,orig_geom);
if (snap_vertex == null){
    return;
}
var intersecting_pnt;
if (buffer_pnt_distance == null || buffer_pnt_distance <= 0) {
    intersecting_pnt = Intersects(snap_vertex, point_fs);
} else {
    intersecting_pnt = Intersects(Buffer(snap_vertex, buffer_pnt_distance), point_fs);
}
var snapped_point = First(intersecting_pnt);
if (snapped_point == null) {
    return;
}
if (check_exit_early(snapped_point)) {
    return;
}
var polyline_1 = null;
var polyline_2 = null;

// We know it is un controlled, we are not going to care about if it is un controlled
var new_geoms = cut_line_at_point(Geometry($feature), snap_vertex, false);
// If a split was not found, do not modify the feature
if (Count(new_geoms) != 2) {
    return;
}
var new_geom_1 = new_geoms[0];
var new_geom_2 = new_geoms[1];
if (Count(new_geom_2) == 0 || Count(new_geom_1) == 0) {
    return;
}
var spat_ref = Geometry($feature).spatialReference.wkid;

var new_geom_1 = remove_vertex(new_geom_1);
var new_geom_2 = remove_vertex(new_geom_2);
polyline_1 = Polyline({
    "paths": new_geom_1,
    "spatialReference": {
        "wkid": spat_ref
    }
});
polyline_2 = Polyline({
    "paths": new_geom_2,
    "spatialReference": {
        "wkid": spat_ref
    }
});

var polyline_1_length = Length(polyline_1);
var polyline_2_length = Length(polyline_2);

// Convert feature to dictionary to get all its attributes
var line_att = Dictionary(Text($feature))['attributes'];
var atts_to_remove = get_fields_by_type($feature, 'upper', 'editable', false);
for (var i in remove_fields_from_new_feature) {
    var fld = Upper(remove_fields_from_new_feature[i]);
    if (IndexOf(atts_to_remove, fld) != 1) {
        continue;
    }
    Push(atts_to_remove, fld);
}
line_att = set_date_type($feature, pop_keys(line_att, atts_to_remove));
// Check length of new shapes, adjust the current feature to the longest segment
var update_features = null;
var new_features = null;
if (polyline_1_length > polyline_2_length) {
    update_features = {
        'globalID': $feature.globalID,
        'geometry': polyline_1
    };
    new_features = {
        //'globalID': GUID(),
        'geometry': polyline_2,
        'attributes': line_att
    };
} else {
    update_features =  {
        'globalID': $feature.globalID,
        'geometry': polyline_2
    };
    new_features = {
        //'globalID': GUID(),
        'geometry': polyline_1,
        'attributes': line_att
    };
}


// Only include edit info when a split was required
if (update_features != null && new_features != null) {
    var results = {'Result': update_features}
    results['edit'] = [{
        'className': line_class_name,
        'adds': [new_features]
    }]
    return results;
}

return;
```
