# Require reducer on diamater change

This validation attribute rule evaluates connected lines and if the diamter is different, require a reducer fitting.

## Use cases

A water main with diamater of 6" connected to a water main with a diameter of 4"

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  - **Rule Name** Validate Reducer
  - **Rule Type:** Validation
  - **Error Number:** 
  - **Error Message:** Pipe Diameter Validation
  - **Severity:** 4
## Expression Template

```js
// This rule will evaluates connected lines and if the diameter is different, require a reducer fitting.

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
var diameter_field = 'diameter';
var source_diameter = $feature.diameter;
var source_globalid = $feature.GlobalID;
// These fittings must change diameter
var reducer_codes = [49];
// These fittings require at least one change in diameter
var reducer_tees = [50, 51];
var line_feature_set = FeatureSetByName($datastore, 'WaterLine', ['globalID', diameter_field], false);
var junction_feature_set = FeatureSetByName($datastore, 'WaterJunction', ['globalID', 'assettype'], false);
var device_feature_set = FeatureSetByName($datastore, 'WaterDevice', ['globalID', 'assettype'], false);
var line_requires_reducer_msg = "Lines requires reducer - Fitting ID: ";
var line_does_not_need_reducer_msg = "Lines connects to another line via a reducer fitting but diameter does not change - Fitting ID: ";
var reducer_only_connects_to_two_lines = "A reducer must connect to two lines - Fitting ID: ";

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

function check_snapped_features(geom, source_diameter, source_globalid) {
    // Get intersecting lines
    var intersection_lines = Intersects(line_feature_set, geom);
    if (Count(intersection_lines) == 0) {
        return null
    }
    // Any device is a valid diameter change
    var intersection_device = Intersects(device_feature_set, geom);
    if (Count(intersection_device) >= 1) {
        return null;
    }
    // Get the fittings, if there is no fitting, there still may be a diameter error
    var fitting_type = "not_reducing";
    var intersection_fitting = Intersects(junction_feature_set, geom);
    if (IsEmpty(intersection_fitting) || Count(intersection_fitting) == 0) {
        return null
    }
    // TODO: What to do if more than one fitting?
    var fitting = First(intersection_fitting);
    if (IndexOf(reducer_codes, fitting['assettype']) != -1) {
        fitting_type = 'reducer';
    } else if (IndexOf(reducer_tees, fitting['assettype']) != -1) {
        fitting_type = 'reducing_tee';
    }

    var diameters = [];
    // Get an array of all diamaters
    for (var intersected_line in intersection_lines) {
        if (intersected_line['globalid'] == source_globalid) {
            continue;
        }
        diameters[Count(diameters)] = intersected_line[diameter_field]
    }
    var unq_diameters = Distinct(diameters);
    // If the fitting is not a reducing fitting, ensure only items of the same diameter are connected
    if (fitting_type == "not_reducing") {
        if (Count(diameters) == 0) {
            return
        } else if (Count(unq_diameters) == 1 && IndexOf(unq_diameters, source_diameter) == -1) {
            return line_requires_reducer_msg + fitting.globalid;
        } else if (Count(unq_diameters) > 1) {
            return line_requires_reducer_msg + fitting.globalid;
        }
    }
    // If the fitting is a reducing fitting, ensure only different diameters and 2 pipes
    if (fitting_type == "reducer") {
        if (Count(diameters) == 0) {
            return reducer_only_connects_to_two_lines + fitting.globalid;
        } else if (Count(diameters) != 1) {
            return reducer_only_connects_to_two_lines + fitting.globalid;
        } else if (IndexOf(diameters, source_diameter) != -1) {
            return line_does_not_need_reducer_msg + fitting.globalid;
        }
    }
    // If the fitting is a reducing tee, we do not care about the number of pipes, as it could be midspan
    if (fitting_type == "reducing_tee") {
        // If there is only one other diameter, ensure it is not the same as the source pipe
        if (Count(diameters) == 0) {
            return reducer_only_connects_to_two_lines + fitting.globalid;
        } else if (Count(unq_diameters) == 1 && unq_diameters[0] == source_diameter) {
            return line_does_not_need_reducer_msg + fitting.globalid;
        }
    }
    return null
}

// get the paths of the line

var geo = Geometry($feature);
var paths = geo['paths'];

var first_point = Point(pop_empty(paths[0][0]));
var last_point = Point(pop_empty(paths[-1][-1]));


var results = [];
var result = check_snapped_features(first_point, source_diameter, source_globalid);
if (IsEmpty(result) == false) {
    results[Count(results)] = result
}
result = check_snapped_features(last_point, source_diameter, source_globalid);
if (IsEmpty(result) == false) {
    results[Count(results)] = result

}
if (Count(results) > 0) {
    return {
        "errorMessage": Concatenate(results, '\n')
    };
}
return true;

```