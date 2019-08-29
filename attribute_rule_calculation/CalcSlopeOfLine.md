# Calc Slope of Line

This calculation attribute rule calculates the slope of the line

## Use cases

In a sewer network, use the upstream and downstream elevation information to set the slope

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Update

## Expression Template

This Arcade expression will calculates the slope of the line based on two fields
```js
// If either field not populated, return the original value
if (IsEmpty($feature.UPELEV) || IsEmpty($feature.DOWNELEV))
{
  return $feature.slope;
}
if (IsEmpty(Geometry($feature)) || Length(Geometry($feature)) == 0)
{
  return $feature.slope;
}
return ABS(($feature.UPELEV - $feature.DOWNELEV)/Length(Geometry($feature)));
```

This Arcade expression will calculates the slope of the line based on start and end vertex Z values
```js
if (IsEmpty(Geometry($feature)) || Length(Geometry($feature)) == 0)
{
  return $feature.slope;
}
// get the paths of the line
var paths = Geometry($feature)['paths'];

// Get the First and Last vertex, and select the lowest of the two
down_elevation = min(paths[0][0]['z'], paths[-1][-1]['z']) 

// Get the First and Last vertex, and select the highest of the two
up_elevation = max(paths[0][0]['z'], paths[-1][-1]['z'])

// Calc the slope
return ABS((up_elevation - down_elevation)/Length(Geometry($feature)))
```
