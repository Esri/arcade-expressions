# Get Address From Centerline

This calculation attribute rule extracts the address number from the closest street centerline.

## Use cases

To get the address information when a point is placed.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.

  - **Rule Type:** Calculation
  - **Triggering Events:** Insert

## Expression Template

This Arcade expression rule extracts the address number from the closest street centerline.. An example with using this rule is included in the [Example](./GetAddressFromCenterline.zip)


Code(./GetAddressFromCenterline.js)