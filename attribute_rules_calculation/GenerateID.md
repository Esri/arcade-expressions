# Generate Unique ID

This calculation attribute rule uses a database sequence to generate a new ID for a feature.

## Use cases

To provide a database generated ID when a feature is created

## Workflow

Using ArcGIS Pro, use the Create Database Sequence geoprocessing tool to create a database sequence to provide the auto incremented number for this rule.  Repeat this process if unique sequences are need for different feature classes or subtypes.  

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert
  - **Exclude from application client:** Checked


## Expression Template

This Arcade expression will return the ID if already set or generate a new ID based on a database sequence

```js
//Define the leading text, the trailing text and the delimiter for the ID
prefix = "ABC"
join_char = "-"
suffix = "XYZ"

//Ensure the ID is not already set, if it is, return the original id
if (IsEmpty($feature.assetid)) {
   // If you do not want to use a prefix, or suffix, remove it from the list
   return Concatenate([prefix, NextSequenceValue("GDB_SEQUENCE_NAME"), suffix], join_char)
}
else {
   return $feature.assetid
}
```
