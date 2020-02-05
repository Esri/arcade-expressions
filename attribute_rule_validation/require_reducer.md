# Require reducer on diamater change

This validation attribute rule evaluates connected lines and if the diamter is different, require a reducer fitting.

## Use cases

A water main with diamater of 6" connected to a water main with a diameter of 4"

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Validation
  - **Triggering Events:** 

## Expression Template

```js
// This rule will evaluates connected lines and if the diamter is different, require a reducer fitting.

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
var diameter_field = 'diameter';
var source_diameter = $feature.diameter;
var reducer_codes = [49, 50, 51];
var line_feature_set = FeatureSetByName($datastore, 'WaterLine', ['globalID', diameter_field], false);
var junction_feature_set = FeatureSetByName($datastore, 'WaterJunction', ['globalID', 'assettype'], false);
var line_requires_reducer_msg = "Lines requires reducer";
var line_does_not_need_reducer_msg = "Lines connects to another line via a reducer but diameter does not change";

// ************* End Section *****************
// Function to pop empty values in a dict
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
function check_snapped_features(geom, source_diameter) {
    // Get intersecting lines
    var intersection_lines = Intersects(line_feature_set, geom);
    if (Count(intersection_lines) == 0) {
        return null
    }
    // Get the fittings, if there is no fitting, there still may be a diameter error
    var fitting_is_reducer = false;
    var intersection_fitting = Intersects(junction_feature_set, geom);
    if (Count(intersection_fitting) == 1) {
        if (IndexOf(reducer_codes, First(intersection_fitting)['assettype']) != -1) {
            fitting_is_reducer = true;
        }
    } else {
        // What to do if more than one fitting?
    }
    for (var intersected_line in intersection_lines) {
        if (intersected_line[diameter_field] != source_diameter && fitting_is_reducer == false) {
            return line_requires_reducer_msg;
        } else if (intersected_line[diameter_field] == source_diameter && fitting_is_reducer == true) {
            return line_does_not_need_reducer_msg;
        }
    }
    return null
}

// get the paths of the line
var geo = Geometry($feature);
var paths = geo['paths'];

var first_point = Point(pop_empty(paths[0][0]));
var last_point = Point(pop_empty(paths[-1][-1]));


var result = check_snapped_features(first_point, source_diameter);
if (IsEmpty(result) == false) {
    return {
        "errorMessage": result
    };
}
var result = check_snapped_features(last_point, source_diameter);
if (IsEmpty(result) == false) {
    return {
        "errorMessage": result
    };
}
return true;

```