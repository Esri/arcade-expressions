# Calculate Top Elevation

This calculation attribute sets the surfance elevation of a feature based on the Z and an height/invert value 

## Use cases

In a sewer network, the Z is used to set the bottom elevation, the invert or depth represents how deep/tall the manhole is.  Use this information to calculate the top elevation.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Update

## Expression Template

This Arcade expression will calculates the slope of the line based on two fields
```js
// Get the Z of the feature
bottom_elevation = Geometry($feature).z;

// Return the top elevation
return bottom_elevation + $feature.DEPTH;
```
