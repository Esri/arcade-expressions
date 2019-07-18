# Generate Unique ID

This expression rule uses a database sequence to generate a new ID for a feature.

## Use cases

To provide a database generated ID when a feature is created

## Workflow

Using ArcGIS Pro, use the Create Database Sequence geoprocessing tool to create a database sequence to provide the auto incremented number for this rule.  Repeat this process if unique sequences are need for different feature classes or subtypes.  

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert


## Expression Template

This Arcade expression will return the ID if already set or generate a new ID based on a database sequence

```js
prefix = "ABC"
join_char = "-"
suffix = "XYZ"

if (IsEmpty($feature.assetid)) {
   return Concatenate([prefix, NextSequenceValue("GDB_SEQUENCE_NAME"), suffix], join_char)
}
else {
   return $feature.assetid
}
```
