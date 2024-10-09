// ---- Implementation Specific ----

var current_table = 'Pipes';                          // The name of the table the rule is executing against.
var edit_tracking_user = $feature.last_edited_user;   // The assigned to class last editor field
var edit_time = $feature.last_edited_date;            // The assigned to class last edit date field
var fields = ['project', 'diameter'];                 // The name of the fields that will be tracked for last values.

var et_utc = true;                                    // True if editor tracking is in UTC, false if in locale
var max_age = 1440;                                   // Max age a last value record is valid in minutes

var last_value_table = 'LastValue';                   // The name of the "LastValue" table in the workspace.

// The fields from the last value table
var last_value_fields = ['field_name', 'field_value', 'objectID', 'last_edited_date']

// A feature set to query the Last Value Table
var last_value_feat_set = FeatureSetByName($datastore, 'LastValue', last_value_fields, false)


// Variables to store last value information and return edit payloads
var last_values = {};  // Existing values from LastValue table.
var attributes = {};   // The attributes that will be written to $feature.
var inserts = [];      // Inserts to LastValue table.
var updates = [];      // Updates to LastValue table.

function get_last_values(current_time) {
    // Create a dict of the last values.  The table is filtered by current user
    var where = 'table_name = @current_table and created_user = @edit_tracking_user'
    var values = OrderBy(Filter(last_value_feat_set, where), 'last_edited_date ASC')
    // Loop over the rows in the Last Value table and build a dict with values.
    // If more than one entry for a field exist with the same user info, the latest is used
    for (var row in values) {
        last_values[row['field_name']] = {
            'value': row['field_value'],
            'id': row['objectID'],
            'entry_age': ABS(DateDiff(current_time, row['last_edited_date'], 'minutes'))
        }
    }
}

function process(field_name) {
    // Check if field exist, needed to bypass validatiob
    if (!HasKey($feature, field_name)) {
        return null;
    }
    // check if there is a valid last value within the max age window in the last value tale
    var feature_value = $feature[field_name];
    var has_last_value = HasKey(last_values, field_name);

    if (IsEmpty(feature_value)) {
        // If the features value is empty, check if a valid entry exist in the last value table
        if (has_last_value && !IsEmpty(last_values[field_name]['value']) && last_values[field_name]['entry_age'] < max_age) {
            attributes[field_name] = last_values[field_name]['value']
        }
    } else {
        // The feature is not empty, if the last value as an entry, update it, if not create a new one
        if (has_last_value) {
            // User wants to update the existing last value.
            Push(updates, {
                'objectID': last_values[field_name]['id'],
                'attributes': {'field_value': feature_value}
            })
        } else {
            // No last value exists, insert it.
            Push(inserts, {
                'attributes': {
                    'table_name': current_table,
                    'field_name': field_name,
                    'field_value': feature_value
                }
            })
        }
    }
}

// Get the current time based on how editor tracking is being stored
// This could be changed to get it from the features editor tracking
var current_time = iif(et_utc, TimeStamp(), Now())
// Init the last value dict
get_last_values(current_time);
// Loop through assigned to fields and set their values
for (var i in fields) {
    process(fields[i])
}

// Build up edit payload for writing to LastValue table
var edit = [];
if (Count(inserts) > 0) {
    Push(edit, {'className': last_value_table, 'adds': inserts})
}
if (Count(updates) > 0) {
    Push(edit, {'className': last_value_table, 'updates': updates})
}
var result = {};
if (Count(edit) > 0) {
    result['edit'] = edit;
}
if (Text(attributes) != '{}') {
    result['result'] = {
        'attributes': attributes
    }
}
return result