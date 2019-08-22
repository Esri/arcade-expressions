# Validate Related Cardinality

This validation attribute rule evaluates the related features to ensure they are valid related features and they do not exceed allowable counts of related features.

## Use cases

In a electric network, where the GIS location is modeling the location of the asset, not the units or devices that make it up.  For instance, a 3 Phase transformer may be one point in GIS, but actually be composed of 3 Single Phase transformers. 

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Validation
  - **Triggering Events:** 

## Expression Template

This Arcade expression will calculates the slope of the line based on two fields
```js
// This rule is designed to check the count of child records and ensure they do not exceed the required amount

// dict with the max number of records by subtype
var max_counts = {
    '1': 2, // Subtype 1 in the child
    '2': 1, // Subtype 2 in the child
    '3': 0 // Subtype 3 in the child is not allowed at all to this parent
};

var no_violation_text = 'No relationship violations';

// Store the parent feature global from the key field in the relationship
var feature_id = $feature.globalid;
if (IsEmpty(feature_id)) {
    return no_violation_text;
}

// force to upper as the sql is case sensitive
feature_id = Upper(feature_id);

// Using the GDB name, get the related classes records and fields
var child_class = FeatureSetByName($datastore, 'RelatedRows', ['PARENTGUID', 'SUBTYPE', 'LIFECYCLE'], false);
// Filter the child class for only related features that are in service
// Optionally, extend query, such as filter by lifecycle - and LIFECYCLE <> 1
var child_records = Filter(child_class, 'PARENTGUID = @feature_id and LIFECYCLE <> 1');

// If no child records, return no issue
if (IsEmpty(child_records)) {
    return no_violation_text;
}
var rec_count = {};
// Loop through each feature, create a dict by the subtype and the count of child records
for (var row in child_records) {
    // Get the subtype code as text
    var sub_text = 'Null';
    if (IsEmpty(row['SUBTYPE']) == false) {
        sub_text = Text(row['SUBTYPE']);
    }
    // Increment the count by subtype
    if (HasKey(rec_count, sub_text) == false) {
        rec_count[sub_text] = 1;
    } else {
        rec_count[sub_text] = rec_count[sub_text] + 1;
    }
}
// Loop over the counts by subtype and add a message for any that violate the counts
var result = '';
for (var key in rec_count) {
    // If the subtype exist in the max count dict, check it max value
    if (HasKey(max_counts, key)) {
        // If the count exceeds, add a message
        if (rec_count[key] > max_counts[key]) {
            result = result + rec_count[key] + ' related ' + DomainName(child_class, 'SUBTYPE', key) +
                ' only ' + max_counts[key] + ' allowed\n';
        }
    }
}

if (result == '') {
    return no_violation_text;
}
return result;

```
