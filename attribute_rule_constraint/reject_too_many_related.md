# Reject Too Many Related

This constraint attribute rule evaluates the feature when inserted and if it exceed the allowable number of related ojects of this type, rejects the edit.

## Use cases

In a electric network, a feature may be used to represent the location and a table used to store assets.  This rule can ensure that only a certain number of assets are added. 

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Constraint
  - **Triggering Events:** Insert

## Expression Template

This constraint attribute rule evaluates the feature when inserted and if it exceed the allowable number of related ojects of this type, rejects the edit.

```js
// This rule is designed to check the count of child records and ensure they do not exceed the required amount

// dict with the max number of records by subtype
var max_counts = {
    '1': 1, // Subtype 1 in the child
    '2': 1, // Subtype 2 in the child
    '3': 0, // Subtype 3 in the child is not allowed at all to this parent
    '4': 0 // Subtype 3 in the child is not allowed at all to this parent
};

if (HasKey(max_counts, $feature.subtype) == false)
{
    return true;
}
var max_value = max_counts[Text($feature.subtype)];
// A flag to determine if types table are allowed if not defined in max_counts
var non_defined_types_allowed = false;

// Store the featurse global from the key field in the relationship
var feature_id = $feature.globalid;
var parent_id = $feature.parentguid;
if (IsEmpty(feature_id) || IsEmpty(parent_id)) {
    return true;
}

// force to upper as the sql is case sensitive
feature_id = Upper(feature_id);
parent_id = Upper(parent_id);
// Using the GDB name, get the other related records 
var child_class = FeatureSetByName($datastore, 'RelatedRows', ['parent_guid', 'SUBTYPE', 'LIFECYCLE'], false);
// Filter the class the feature is in to get fellow related rows
// Optionally, extend query, such as filter by lifecycle - and LIFECYCLE <> 1
var pier_records = Filter(child_class, 'PARENTGUID = @parent_id and GlobalID <> @feature_id and SUBTYPE = ' + $feature.subtype);

// If no pier records, return
if (IsEmpty(pier_records)) {
    return true;
}
if (Count(pier_records) > max_value)
{
    return {'errorMessage':'Adding this row violated allowable count(' + max_value + ') of related records for type: ' + DomainName($feature, 'SUBTYPE')};
}
else
{
    return true;
}
```
