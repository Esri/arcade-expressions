# Restrict Editing

This constraint attribute rule evaluates the user from edit tracking and an table to determine if the user can edit a feature of this type.

## Use cases

In a electric network, only certain editors are allow to modify certain features.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Constraint
  - **Triggering Events:** Insert, Delete or Update

## Expression Template

This constraint attribute rule evaluates the user from edit tracking and an table to determine if the user can edit a feature of this type.
An example with using this rule is included in the [Example](./restrict_editing.zip).  
To demonstrate, open and add both the class and table to the map.  The rules is configured on update.  Only Bob and Frank are allowed to edit.

```js
// Assigned To: Any Class
// Type: Constraint
// Name: Restrict Editing on <Any Class>
// Description: Restrict editing based on UAC table, user names are delimited by ;
// Subtypes: All
// Trigger: Insert, Update, Delete
// Exclude From Client: True
// Error Number: 5705
// Error Message: Insufficient privileges to preform this edit

var fc = 'ElectricDevice';
var uac_fs = FeatureSetByName($datastore, 'UAC', ['featureClass', 'assetGroupCode', 'assetTypeCode', 'UAC'], false);
var sql = "featureClass = '" + fc + "' AND " + 'assetGroupCode = ' + $feature.assetgroup + ' AND ' + 'assetTypeCode = ' + $feature.assettype
var result = Filter(uac_fs, sql);
if (count(result) == 0) {
    return true;
}
var row = First(result);
var valid_users = Split(row['UAC'], ';');
var cleaned_users = [];
for (var i in valid_users) {
    cleaned_users[count(cleaned_users)] = Trim(valid_users[i]);
}
if (IndexOf(cleaned_users, $feature.updatedby) >= 0) {
    return True;
}

return {'errorMessage': 'You are not allowed modify/create/delete this feature'};

```
