// This rule will update an attribute in the parent feature
// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

var parent_id = $feature.facilityguid;
// Note: The parent class name needs to be a string literal in both of the following lines, do not replace the literal
// in the FeatureSetByName with the variable
// If this is enterprise, use the fully qualified name, i.e: database.owner.class
var parent_class_name = "Facilities";
var parent_class = FeatureSetByName($datastore, "Facilities", ["globalid"], false);
var fields_to_copy = ['status', 'workoffice', 'workremote', 'essstaffonly', 'accessrest', 'staffallow', 'visitorallow',
    'entstaff', 'buildsecure', 'openstate', 'hoursop', 'schtoclose', 'closedatetime', 'schtoopen', 'opendatetime',
    'adddetails'];

// ************* End User Variables Section *************

if (IsEmpty(parent_id)) {
    return parent_id;
}
// force to upper as the sql is case sensitive
parent_id = Upper(parent_id);

// Filter the parent class for only related features
var parent_record = First(Filter(parent_class, "globalid = @parent_id"));
if (IsEmpty(parent_record)) {
    return parent_id;
}

var attributes = {};
// Loop through each field and add to attribute list to update
for (var field_idx in fields_to_copy) {
    attributes[fields_to_copy[field_idx]] = $feature[fields_to_copy[field_idx]];
}
// Return the original value in the result parameter, as to not lost the entered value
// Using the edit parameter, return the class and list of updates
return {
    'result': parent_id,
    'edit': [
        {
            'className': parent_class_name,
            'updates': [{
                'globalid': parent_id,
                'attributes': attributes
            }]
        }]
};