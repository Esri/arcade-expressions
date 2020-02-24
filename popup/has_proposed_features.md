# Has Proposed Features

This example is designed to show how to traverse associations and set an attribute when a container has content

## Use cases

Add an indicator on the Utility Network feature that informs the users that a contained record is in a Proposed or Approved state.  

## Workflow

Select a layer in ArcGIS Pro, Right click and select Configure Pop-up.  Add a new expression and copy and paste the expression found in the expression template below to the Arcade editor.  Adjust the layer id to match that of your device layer


## Expression Template

This example is designed to show how to traverse associations and set an attribute when a container has content

```js
// This example is designed to show how to traverse associations and set an attribute when a container has content, requires ArcGIS Pro 2.5

function associated_records_count(feature, association_type, sql) {
    // Dict to store the edits by classname
    var feat_count = 0;
    // Query to get all the content associations
    var associations = FeatureSetByAssociation(feature, association_type, null, null, ['className'], false);
    // If there is no content, exit the function
    if (count(associations) == 0) {
        return edits;
    }
    // loop over all associated records to get a list of the associated classes
    var associated_classes = [];
    for (var row in associations) {
         associated_classes[Count(associated_classes)] = row.className;
    }
    // Get a unique list of classes
    associated_classes = Distinct(associated_classes);

    // For each class, gets its features and compare to the value to set, if the value is already set, do not update it
    // as it will still trigger an edit event and store, which will fire Attribute Rules and change edit tracking
    for (var i in associated_classes) {
        var class_name = associated_classes[i];
        // Get the features, get all fields as we cannot check the layer ahead of time if it has the field to set
        // NOTE: The Class Name might need to be hard coded
        var features = FeatureSetByAssociation(feature, association_type, null, class_name, ['*'], false);
        feat_count = feat_count + Count(Filter(features, sql));
    }
    return feat_count;
}

// Get the first container
var record_dict = associated_records_count($feature, 'content','lifecyclestatus in (1,2,3,4,6,7)');
if (IsEmpty(record_dict) == true)
{
   return 'All In-Service';
}
if (record_dict > 0)
{
    return 'Contains proposed features';
}
return 'All In-Service';
```
