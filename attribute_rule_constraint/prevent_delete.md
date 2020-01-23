# Restrict Editing

This constraint attribute rule prevent a feature from deleted unless the feature is retired

## Use cases

To prevent accidental deletion of an asset.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Constraint
  - **Triggering Events:** Delete

## Expression Template

This constraint attribute rule prevent a feature from deleted unless the feature is retired

```js
if ($feature.lifecyclestatus == 128 || $feature.lifecyclestatus == 64)
{
  return true;
}
return {'errorMessage': 'You are not allowed delete a feature until it is retired'};

```
