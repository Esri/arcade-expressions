# Copy a Value from an Intersecting Feature

This calculation attribute rule copies a value from an intersected feature to the edited feature.

## Use cases

To copy a life cycle, diameter, district, etc from a feature that created or edited feature intersects.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert, Update
  - **Field** Blank, do not set this


## Expression Template

This Arcade expression will return the a value from an intersected feature. An example with using this rule is included in the [Example](./CopyValueIntersectingFeature.zip)

```js

// This rule will populate the edited features field with a value from an intersecting feature

// Value to copy from the intersected feature
var intersecting_field = "ValueToCopy";

// Create feature set to the intersecting class using the GDB Name
var intersecting_featset = FeatureSetByName($datastore, 'Line', [intersecting_field], true);

// Intersect the edited feature with the feature set and retrieve the first feature
var intersected_feature = First(Intersects(intersecting_featset, $feature));

// Check to make sure there was an intersected feature, if not, return the original value
if (IsEmpty(intersected_feature) || intersected_feature == null)
{ 
    return;
}
// If the intersected feature is null, return the original value
if (IsEmpty(intersected_feature.valueToCopy))
{
    return;
}
return {
    //result is a dictionary
    "result": {
        "attributes": {
            "ValueCopied": intersected_feature[intersecting_field]
        }
    }
};
```
