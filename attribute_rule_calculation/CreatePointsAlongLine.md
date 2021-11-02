# Create Points Along Line

This calculation attribute rule creates point features along a line at equidistant intervals. Optionally add endpoints.

## Use cases

Create midspan points along a line as part of an editing workflow.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a line feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.

- **Rule Type:** Calculation
- **Triggering Events:** Insert
- **Execution:** Exclude from application evaluation

## Expression Template

This Arcade attribute rule creates midspan points along a line. An example using this rule is included in this [Example](./CreatePointsAlongLine.zip)


[Code](./CreatePointsAlongLine.js)