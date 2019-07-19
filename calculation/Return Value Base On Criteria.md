# Return Value Base On Criteria

This calculation attribute evaluates a set of fields to set a valid in another field.

## Use cases

This is use to set the a value to determine if a feature can particpate in a cathodic protection network.  The CP Tracability field is used as a barrier in the Utility Network 

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Update



## Expression Template

This Arcade expression will evaluates a set of fields to set a valid in another field.

```js
// This rules evaluates a set of fields to determine CP traceability.

var traceable = 1; // Also used for Bonded
var not_traceable = 2; // Also used for Insulated
// The material field and list of material types and that are conductive
var conductive_types = ['0','1','2','3','4','5','6','7','8','9','S','R','Q','P','O','N','M'];

// If an override is specified, use that value regardless of other attributes
if ($feature.cpoverride > 0)
{
    return $feature.cpoverride;
}
// If a value is set on the bonded, insulated field, return that value
if ($feature.bondedinsulated > 0)
{
  return $feature.bondedinsulated;
}
// Check if the material is conductive
if (count(conductive_types) > 0)
{
    if (indexof(conductive_types, $feature.material) > -1)
    {
      return traceable;
    }
    else
    {
      return not_traceable;
    }
}
//Return the value in the field when no other condition is met
return $feature.cptraceability;
```
// Variation, where conductive types of the feature are not known
```js
// This rules evaluates a set of fields to determine CP traceability.
var traceable = 1; // Also used for Bonded
var not_traceable = 2; // Also used for Insulated

// If an override is specified, use that value regardless of other attributes
if ($feature.cpoverride > 0)
{
    return $feature.cpoverride;
}
// If a value is set on the bonded, insulated field, return that value
if ($feature.bondedinsulated > 0)
{
  return $feature.bondedinsulated;
}
//Return the value in the field when no other condition is met
return $feature.cptraceability;
```