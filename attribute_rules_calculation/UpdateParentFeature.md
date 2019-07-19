# Update Parent Features

This calculation attribute rule is designed to update a parent feature in a relationship when a new child record is inserted.  This is designed for ArcGIS Collector or a workflow when related record is created and attributes are filled prior to submitted in the record.

## Use cases

Inspecting a pole and evaluting a set of fields to determine what is the status that needs to be pushed to the parenet asset.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.

  - **Field:** parentglobalid
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert
  - **Exclude from application evaluation:** Checked


## Expression Template

This Arcade expression will return the a value from an intersected feature.  An example with using this rule is included in the [Example](./UpdateParentFeature.zip)

```js
// This rule will update an attribute in the parent feature

// Store the parent feature global from the key field in the relationship
var parent_id = $feature.parentglobalid;
if (IsEmpty(parent_id))
    return parent_id;

// force to upper as the sql is case sensitive
parent_id = Upper(parent_id);

// Using the GDB name, get the parent classes records and Global ID field
var parent_class = FeatureSetByName($datastore, "testar.unadmin.ParentLayer", ["globalid", 'laststatus'], false);
// Filter the parent class for only related features
var parent_records = Filter(parent_class, "globalid = @parent_id");

var updates = [];
var i = 0;
var new_value = 'Operational';

if (IsEmpty($feature.POLESTATUS) == False)
{
    new_value = 'PoleDown'
}
else if ($feature.LIGHTSOUT == 1)
{
    new_value = 'LightOut'
}
else if ($feature.LIGHTCYCLING == 1)
{
    new_value = 'NeedsRepair'
}

// Loop through each  feature, create a dict of the Global ID and the new value date
for (var row in parent_records) {
    // If the parent row is null or has a different value, updated it
    if (IsEmpty(row['laststatus']) || row['laststatus'] != new_value)
    {
        updates[i++] = {
            'globalid': parent_id,
            'attributes': {"laststatus": new_value}    
        };
    }
}

// Return the original value in the result parameter, as to not lost the entered value
// Using the edit parameter,  return the class and list of updates
return {
'result': parent_id,
'edit': [
            {'className': 'ParentLayer',
             'updates': updates
            } 
        ]
};
```
