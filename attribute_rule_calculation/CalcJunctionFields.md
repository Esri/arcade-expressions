# Calc Attributes from Junction

This calculation attribute rule calculates multiple attributes from junction with features in another feature class. 
The script finds the initial and final points of the line, and intersects the manhole layer with those points.  If a feature is returned it populates the relevant attributes.

## Use cases

In a sewer network, use the upstream and downstream elevation from the manhole layer to set elevation attributes. 

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert

## Expression Template

This Arcade expression will calculates field values from intersecting point layer
```js
// Get Point layer, with fields to evaluate
var fields = ['MHID', 'ELEV']
var point_fs = FeatureSetByName($datastore, "Manholes", fields, true);

var line_shape = Geometry($feature)
var spRef = line_shape['spatialReference']

// Get the origin and end points of the line
var orig_x = line_shape['paths'][0][0].x
var orig_y = line_shape['paths'][0][0].y
var orig_point = Point({x: orig_x, y: orig_y, spatialReference: spRef})

var end_x = line_shape['paths'][-1][-1].x
var end_y = line_shape['paths'][-1][-1].y
var end_point = Point({x: end_x, y: end_y, spatialReference: spRef})

var attributes = {}

function IsEmptyButBetter(data) {
    if (IsEmpty(data)) return true;
    for (var x in data) return false;
    return true;
}

//find point intersecting origin
var origIntx = first(Intersects(orig_point, point_fs));

if (!IsEmptyButBetter(origIntx)) {
	attributes['UPELEV'] = origIntx['ELEV']
	attributes['FROMMH'] = origIntx['MHID']
  }

//find point intersecting end
var endIntx = first(Intersects(end_point, point_fs));

if (!IsEmptyButBetter(endIntx)) {
	attributes['DOWNELEV'] = endIntx['ELEV']
	attributes['TOMH'] = endIntx['MHID']
  }


var result = {}
if (IsEmptyButBetter(attributes)) {
    result['result'] = {
        'attributes': attributes
    }
}

return result
```
