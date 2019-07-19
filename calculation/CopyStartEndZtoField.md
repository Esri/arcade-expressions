# Copy Start or End Z of a line to a field

This calculation attribute rule extract the high and low Z values and sets them on a field

## Use cases

In a sewer network, set the upstream and downstream elevation fields from the geometry.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Update

## Expression Template

This Arcade expression will extract the high and low Z values and sets them on a field

The downstream elevation
```js
// get the paths of the line
var paths = Geometry($feature)['paths'];

// Get the First and Last vertex, and select the lowest of the two
return min(paths[0][0]['z'], paths[-1][-1]['z']) 

```

The upstream elevation
```js
// get the paths of the line
var paths = Geometry($feature)['paths'];

// Get the First and Last vertex, and select the highest of the two
return max(paths[0][0]['z'], paths[-1][-1]['z'])

```