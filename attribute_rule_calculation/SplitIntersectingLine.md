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
// Split the intersecting line

// NOTES
//   Need to handle Zs and Ms better.
//   As this is not calling a GDB split, Domain Split policy will not be honored, this would have to add to this logic
//   The logic for a point on a line but not at vertex might need rework
//   Would like to convert some blocks to functions for cleaner code
//   Setting the keys/fields to remove from the new feature is critical, not setting this list, the server may reject the edit if the insert is sending read only fields
// END NOTES

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// List of fields to remove from new feature, existing features change only requires global id
// If this is being used on a Utility Network layer, make sure to remove all the Subnetwork fields and other read only fields, here is a complete example from the water data model
//  var remove_fields_from_new_feature = ['OBJECTID','ASSOCIATIONSTATUS','ISCONNECTED','CREATIONDATE','CREATOR','LASTUPDATE','UPDATEDBY','GLOBALID','SUBNETWORKNAME','SUPPORTEDSUBNETWORKNAME','SHAPE_LENGTH','ST_LENGTH(SHAPE)','MEASUREDLENGTH','CPTRACEABILITY',"ADDDETAILS","ASSETID","BONDEDINSULATED","CPOVERRIDE","CPSUBNETWORKNAME","DESIGNTYPE","DIAMETER","DMASUBNETWORKNAME","FROMDEVICETERMINAL","INSERVICEDATE","INSTALLDATE","ISOLATIONSUBNETWORKNAME","LIFECYCLESTATUS","MAINTBY","MATERIAL","NOTES","OWNEDBY","PRESSURESUBNETWORKNAME","RETIREDDATE","SHAPE__LENGTH","SPATIALCONFIDENCE","SPATIALSOURCE","SUPPORTINGSUBNETWORKNAME","SYSTEMSUBNETWORKNAME","TODEVICETERMINAL"];

var remove_fields_from_new_feature = ['SHAPE_LENGTH', 'GLOBALID', 'OBJECTID'];

// The field the rule is assigned to
var field_value = $feature.ValueCopied;
// The line class to split
var line_class_name = "Line";
var line_fs = FeatureSetByName($datastore, "Line", ['*'], true);
var use_cutter = true;

// Set this to the assigned to class, this is required to get the non editable fields from Schema
var assigned_to_class = FeatureSetByName($datastore, 'Point', ['*'], false)

// ************* End User Variables Section *************

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

function get_non_edit_fields(convert_string) {
    // convert_string options are Upper, Lower or Null
    var sc = Schema(assigned_to_class)
    var non_edit_fields = [];
    var func = Decode(Lower(convert_string), "lower", Lower, "upper", Upper, Text)

    for (var i in sc.fields) {
        if (sc.fields[i]['editable'] == false) {
            var fld_name = sc.fields[i]['name']
            if (!IsEmpty(convert_string)) {
                fld_name = func(fld_name);
            }
            non_edit_fields[Count(non_edit_fields)] = fld_name
        }
    }
    return non_edit_fields
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
    return Cut(line_feature, cutter);
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
                new_path_2[Count(new_path_2)] = current_path[j];
                continue
            }
            // Add the coordinate to both features if the split is on the from
            // NOTE, as this is on a known vertex, no Z interpolation should be needed
            if (compare_coordinate(point_geometry, current_path[j])) {
                new_path_1[Count(new_path_1)] = point_coord;
                new_path_2[Count(new_path_2)] = point_coord;
                split_found = true;
                continue;
            }
            // Save the last coordinate of a path
            if (Count(current_path) == j - 1) {
                new_path_1[Count(new_path_1)] = current_path[j];
                continue;
            }
            // If the To is the last coordinate and matches the point, continue
            if (compare_coordinate(point_geometry, current_path[j + 1])) {
                new_path_1[Count(new_path_1)] = current_path[j];
                continue;
            }
            // Check to see if point is between vertexs
            var from_coord = current_path[j];
            var to_coord = current_path[j + 1];
            //TODO: Interpolate Z values if present based on percentage split occurs
            //TODO: reevaluate distance to line function, do we need to build in a fuzzy tolerance, could construct
            // a line and use intersect function
            if (dist_to_line(from_coord, to_coord, point_coord) < .01) {
                new_path_1[Count(new_path_1)] = current_path[j];
                new_path_1[Count(new_path_1)] = point_coord;
                // Start the next line
                new_path_2[Count(new_path_2)] = point_coord;
                split_found = true;
                continue
            }
            // Save the coordinate in first segment and move on to next point
            new_path_1[Count(new_path_1)] = current_path[j];

        }
        // Save the paths to the new path collections
        if (Count(new_path_1) > 0) {
            new_shape_1[Count(new_shape_1)] = new_path_1;
        }
        if (Count(new_path_2) > 0) {
            new_shape_2[Count(new_shape_2)] = new_path_2;
        }
    }
    return [new_shape_1, new_shape_2];
}

// merge the non editable fields in the pop key list
var non_edit_fields = get_non_edit_fields('Upper');
for (var i in non_edit_fields) {
    if (indexof(remove_fields_from_new_feature, non_edit_fields[i]) < 0) {
        remove_fields_from_new_feature[Count(remove_fields_from_new_feature)] = non_edit_fields[i]
    }
}
var intersecting_lines = Intersects(line_fs, $feature);
// If no features were found, return the original value
if (IsEmpty(intersecting_lines) || Count(intersecting_lines) == 0) {
    return field_value;
}
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
        polyline_1 = Polyline({"paths": new_geoms[0], "spatialReference": {"wkid": line_spat_ref}});
        polyline_2 = Polyline({"paths": new_geoms[1], "spatialReference": {"wkid": line_spat_ref}});
    }
    var polyline_1_length = Length(polyline_1);
    var polyline_2_length = Length(polyline_2);

    // Convert feature to dictionary to get all its attributes
    var line_att = Dictionary(Text(line_feature))['attributes'];

    // Check length of new shapes, adjust the current feature to the longest segment
    if (polyline_1_length > polyline_2_length) {
        update_features[Count(update_features)] = {
            'globalID': line_feature.globalID,
            'geometry': polyline_1
        };
        new_features[Count(new_features)] =
            {
                'globalID': GUID(),
                'geometry': polyline_2,
                'attributes': pop_keys(line_att, remove_fields_from_new_feature)
            };
    } else {
        update_features[Count(update_features)] = {
            'globalID': line_feature.globalID,
            'geometry': polyline_2
        };
        new_features[Count(new_features)] =
            {
                'globalID': GUID(),
                'geometry': polyline_1,
                'attributes': pop_keys(line_att, remove_fields_from_new_feature)
            };
    }
}
var results = {'result': field_value};
// Only include edit info when a split was required
if (Count(update_features) > 0 && Count(new_features)) {
    results['edit'] = [{
        'className': line_class_name,
        'updates': update_features,
        'adds': new_features
    }]

}
return results;
```
