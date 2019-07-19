# Constain Value By Subtype and Other Field

This constraint attribute rule is designed to validate the value for a field is valid based on two fields.  This example is built for a feature class that participates in the Utility Network and using the Asset Group(Subtype) and the Asset Type(unique domain by subtype) to determine the valid feature.

## Use cases

Only certain types of valves in a water network are large enough to support a bypass valve.  

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Constraint
  - **Triggering Events:** Update
  - **Error Number:** User Specified, but suggest a value in the range of 5200
  - **Error Message:** Only XYZ may have a value of ABC


## Expression Template

This Arcade expression will return the a value from an intersected feature

```js
// This rule checks two field values to ensure a value is valid 

var valid_asset_groups = [2];
var valid_asset_types = [175,172,170,167,169];

var invalid_values = [1];

// Ensure the feature is in the valid list
if (indexof(valid_asset_groups, $feature.ASSETGROUP) == -1 && indexof(valid_asset_types, $feature.ASSETTYPE) == -1)
{
	// If the field to evaluate is empty return true
    if (IsEmpty($feature.additionaldevice))
    {
        return true;
    } 
	// If the field as a value and valid is in the invalid list, reject the edit by returning false
    else if (indexof(invalid_values, $feature.additionaldevice) == -1)
    {
        return false;
    }
}
return true;
```

This is a variation, that is looking for a value of a field in a range
```js
// This rule checks two field values to ensure a value is valid 

var valid_asset_groups = [2];
var valid_asset_types = [164];

// Ensure the feature is in the valid list
if (indexof(valid_asset_groups, $feature.ASSETGROUP) == -1 && indexof(valid_asset_types, $feature.ASSETTYPE) == -1)
{
	// If the field to evaluate is empty return true
    if (IsEmpty($feature.DIAMETER))
    {
        return true;
    }
	// If the field as a value is outside the valid range
    else if ($feature.DIAMETER < 4 || $feature.DIAMETER > 10)
    {
        return false;
    }
}
return true;
```