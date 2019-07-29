# Rotate Feature by Intersected Line

This calculation attribute rule rotates a feature by angle of an intersected line

## Use cases

Rotate a valve to match the direction of a line.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Update

## Expression Template

This Arcade expression will rotates a feature by angle of an intersected line

```js
// Find the first intersecting line from the intersecting class
var lineClass = FeatureSetByName($datastore, "WaterLine", ["objectid"], true)
var line = First(Intersects(lineClass, $feature))

// If no feature was found, return the original value
if (line == null)
   return $feature.rotation

// Buffer the point by a small amount to extract the segment
var search = Extent(Buffer($feature, .01, "meter"))
var segment = Clip(line, search)["paths"][0]

// Start and end points of the line
var x1 = segment[0]['x']
var y1 = segment[0]['y']
var x2 = segment[1]['x']
var y2 = segment[1]['y']

// Arithmetic angle (counter-clockwise from + X axis)
return Atan2(y2 - y1, x2 - x1) * 180 / PI  
```

Using the angle function
```js
// Find the first intersecting line from the intersecting class
var lineClass = FeatureSetByName($datastore, "WaterLine", ["objectid"], true)
var line = First(Intersects(lineClass, $feature))

// If no feature was found, return the original value
if (line == null)
   return $feature.rotation

// Buffer the point by a small amount to extract the segment
var search = Extent(Buffer($feature, .01, "meter"))
var segment = Clip(line, search)["paths"][0]

// Start and end points of the line
var x1 = segment[0]['x']
var y1 = segment[0]['y']
var x2 = segment[1]['x']
var y2 = segment[1]['y']

// Get angle of line
return Angle(segment[0], segment[1])  
```