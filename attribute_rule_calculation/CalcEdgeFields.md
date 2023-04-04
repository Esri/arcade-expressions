# Calc Attributes from Edge

This calculation attribute rule calculates multiple attributes from intersection of point features with features in another linear feature class. 
The script takes the point and intersects any lines in another layer.  For each intersecting feature, it determines if the intersecting point is the from or to end point of the line, and gets the attribute from the line and puts it in the appropriate attribute. 

## Use cases

In a sewer network, if the point intersectst the endpoint of a line it gets the diameter of that pipe and updates the INDIAM field.  If the point intersectst the begin point of the intersecting pipe, it gets the diameter of that pipe and updates the OUTDIAM field. 

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert

## Expression Template

```js
var intxField = "DIAMETER"
var intxFeatureSet = FeatureSetByName($datastore, 'Mainlines', [intxField], true)
var intxFeatures = Intersects(intxFeatureSet, $feature)

var featureGeom = Geometry($feature)
var featureX = featureGeom.x
var featureY = featureGeom.y

var attributes = {}

function IsEmptyButBetter(data) {
    if (IsEmpty(data)) return true;
    for (var x in data) return false;
    return true;
}

//cycle through selected features
for (var intxFeature in intxFeatures) {
  var line_shape = Geometry(intxFeature)
    
  // Get the origin and end points of the line
  var orig_x = line_shape['paths'][0][0].x
  var orig_y = line_shape['paths'][0][0].y

  if (featureX == orig_x && featureY == orig_y) {
    attributes['OUTDIAM'] = intxFeature['DIAMETER']
  }
  
  var end_x = line_shape['paths'][-1][-1].x
  var end_y = line_shape['paths'][-1][-1].y

  if (featureX == end_x && featureY == end_y) {
    attributes['INDIAM'] = intxFeature['DIAMETER']
  }

}
var result = {}
if (!IsEmptyButBetter(attributes)) {
    result['result'] = {
        'attributes': attributes
    }
}

return result
```
