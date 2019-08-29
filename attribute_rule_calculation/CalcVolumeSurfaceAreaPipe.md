# Calculate Volume or Surface area of a pipe or line

This calculation attribute rule calculates the volume of a pipe or the surface area using the length and diameter.

## Use cases

In a gas network, calculating the volume of a pipe to estimate the gas pack or the surface area for cathodic protection networks

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Update

## Expression Template

This calculation attribute rule calculates the volume of a pipe or the surface area using the length and diameter. An example with using this rule is included in the [Example](./CopyValueIntersectingFeature.zip)

```js
// This rule is designed to return the volume or surface area of a pipe

var diameter = $feature.NOMINALDIAMETER;
if (IsEmpty(diameter) || diameter == 0)
{
    return 0;
}
// Convert Diameter to the units of length, in this example, diameter is in inches, length is in feer
diameter = diameter * 0.0833333;

// Get the length of the feature, use LengthGeodetic if not using a projected coordinate system
// var len = LengthGeodetic($feature, 'feet');
var len = Length($feature, 'feet');
if (IsEmpty(len) || len == 0)
{
    return 0;
}
// Surface Area = PI x L x D
var surface_area =  PI * len * diameter;
// Volume = PI * (R^2) * L
var volume = PI * POW((diameter/2), 2) * len;

// Select the value you want of a pipe
// return ROUND(surface_area, 6);
return ROUND(volume, 6);
```
