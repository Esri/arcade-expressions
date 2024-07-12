# Calculate M values of a line using vertex distance

This calculation calculates the measures of every segment of a line and updates the M values of the segments.


## Use cases

M values are not auto calculated, they must be updated.  That can be done manually, but this automatically updates them when the geometry of the line is changed.
This should only be used if the M values aren't static, but meant to represent the actual length of the line in the feature class' units. 

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert, Update

## Expression Template

This Arcade expression will calculates the M values using the distance the vertex is along a line
```js
var line = Geometry($feature);
var lineGeo = Dictionary(Text(line));

function distance(coord1x, coord1y, coord2x, coord2y) {
  var dx = coord2x - coord1x
  var dy = coord2y - coord1y
  return Sqrt(dx * dx + dy * dy)
  }

var length = 0

var paths = lineGeo['paths']
var prev_coords = paths[0][0]

for (var pathIndx in paths)
 {
  var path = paths[pathIndx]
  for (var vertIndx in path)
    {
      var coords = path[vertIndx];
      var segDist = distance(coords[0], coords[1], prev_coords[0], prev_coords[1])
      length = length + segDist
      coords[-1] = length
      prev_coords = coords;
     }
  }

lineGeo['hasM'] = line['hasM']
lineGeo['hasZ'] = line['hasZ']

return {
  "result": {"geometry": Polyline(lineGeo)}
};
```
