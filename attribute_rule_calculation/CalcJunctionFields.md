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
// Get Manhole layer
var fields = ['FACILITYID', 'RIMELEV', 'INVERTELEV']
var point_fs = FeatureSetByName($datastore, "ssManhole", fields, true);

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

//find point intersecting origin
//var origIntx = first(Intersects(Buffer(orig_point, 0.02), point_fs));
var origIntx = first(Intersects(orig_point, point_fs));

if (!IsEmpty(origIntx)) {
	attributes['UPELEV'] = origIntx['INVERTELEV']
	attributes['START_COVELEV'] = origIntx['RIMELEV']
	attributes['FROMMH'] = origIntx['FACILITYID']
  }

//find point intersecting end
//var endIntx = first(Intersects(Buffer(end_point, 0.02), point_fs));
var endIntx = first(Intersects(end_point, point_fs));

if (!IsEmpty(endIntx)) {
	attributes['DOWNELEV'] = endIntx['INVERTELEV']
	attributes['END_COVELEV'] = endIntx['RIMELEV']
	attributes['TOMH'] = endIntx['FACILITYID']
  }


var result = {}
if (Text(attributes) != '{}') {
    result['result'] = {
        'attributes': attributes
    }
}

return result
```
