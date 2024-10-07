# Create Laterals

This calculation attribute rule creates service laterals to house locations when a main line is drawn

## Use cases

Create connections to houses in a water or sewer network

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a line feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.

- **Rule Type:** Calculation
- **Triggering Events:** Insert
- **Execution:** Exclude from application evaluation

## Expression Template

This Arcade attribute rule creates laterals to buildings along a main line. An example using this rule is included in this [Example](./CreateLateralDevSummitPlenary2023.zip). To use this: Add mobile gdb to Pro, zoom to the area where there are building and sketch a main line close to buildings.


[Code](./CreateLateralDevSummitPlenary2023.js)

[Initial Prototype](./CreateLateral.js)
