# Last Value

This calculation attribute rule stores the value last entered into a table to be applied to future edit events

## Use cases

To streamline editing by applying previous attributes to future edits

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert, Updates
  - **Exclude from application evaluation:** True


## Expression Template

Sample data with rule implemented.  [Example](./LastValue.gdb.zip)

Code is stored in the a JS file.  [Code](./LastValue.js)
