# Constrain to Domain Code

This expression constrains new input values to values within the domain applied to the field.

## Use cases

As you may or may not know, esri allows values to be stored in a field managed by a domain that are outside of the domain values. You are able to do this using normal esri editing tools etc. This constraint aims to remove this loophole.

## Workflow

Copy and paste the expression found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.

To configure the script to your layer, edit the first line to specify the field you would like to use instead of the example layer. 

```js
var field = 'field_with_domain';
```

## Expression Template

This Arcade expression will not allow a value to be entered into a field that is not a part of the domain applied to the field.

```js
// Refer to the name of the field you would like to protect.
var field = 'field_with_domain';

if (!haskey($feature, field) || isempty($feature[field])) {
    return true;
}

return iif (isempty(domainname($feature, field, $feature[field])), {
    'errorMessage': 'Value does not fall within the allowable domain values. Input: ' + $feature[field]
}, true);
```
