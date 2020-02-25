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
// This rule will generate contained spatial/non spatail features

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation
var identifier = $feature.Identifier;
var rule_type = "tube"; //cable or tube
var create_end_junctions = true;

var line_fs = FeatureSetByName($datastore, "Lines", ["GlobalID"], false);
var contained_features_AG = 4;
var contained_features_AT = 4;

// If Create End Junctions is true, define the class and AG/AT of those below
var device_fs = FeatureSetByName($datastore, "Junctions", ["GlobalID"], false);
var end_feature_AG = 1;
var end_feature_AT = 1;


// ************* End Section *****************
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

var num_childs = null;
var content_val_to_set = null;
if (rule_type == "cable") {

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
} else if (rule_type == "tube") {
    num_childs = $feature.ContentCount;
}
// Get the start and end vertex of the line
var vertices = Geometry($feature)['paths'][0];
var start_point = vertices[0];
var end_point = vertices[-1];

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
    line_adds[Count(line_adds)] = {
        'attributes': attributes,
        'geometry': Geometry($feature),
        //'associationType': 'content'
    };

    if (create_end_junctions) {
        attributes = {
            'AssetGroup': end_feature_AG,
            'AssetType': end_feature_AT,
            'IsSpatial': 0,
        };
        junction_adds[Count(junction_adds)] = {'attributes': attributes, 'geometry': Point(start_point)};
        junction_adds[Count(junction_adds)] = {'attributes': attributes, 'geometry': Point(end_point)};
    }
}
var edit_payload = [{'className': 'Lines', 'adds': line_adds}];
if (Count(junction_adds) > 0) {
    edit_payload[Count(edit_payload)] = {'className': 'Junctions', 'adds': junction_adds}
}
return {
    "result": identifier,
    "edit": edit_payload
}
```
