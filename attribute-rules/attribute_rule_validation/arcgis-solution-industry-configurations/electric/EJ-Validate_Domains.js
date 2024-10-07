// Assigned To: ElectricJunction
// Type: Validation
// Name: Validate Domains-EJ
// Description: Validate domains applied by subtype. Checks for nulls where no domain applied and for valid value where domain applied.
// Subtypes: All
// Error Number: 5003
// Error Message: Error
// Severity: 4
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - EL-Validate Domains
//    - ED-Validate Domains

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// Enable domain checks
// ** Implementation Note: This rule can check two scenarios. These checks can be enabled or disabled.
//     1. If a field specified in the field list below has no domain applied for a particular subtype, ensure the value is null.
//        (this is useful for Network Attributes)
//     2. If a domain is applied to a field, ensure the value is valid for domain. This will check every field on $feature.
var no_domain_check = true;
var value_invalid_for_domain_check = true;

// Custom error messages
// ** Implementation Note: Customize error messages for the two domain checks.
var no_domain_mess = 'Value found where no domain is applied in following fields:'; // field names will be appended at end of message
var value_invalid_for_domain_mess = 'Invalid values found in following fields:'; // field names will be appended at end of message

// The subtype field of $feature
var assetgroup = $feature.ASSETGROUP;

// Fields to run "no_domain_check" against. Each field should be declared to ensure ArcGIS validation succeeds.
// Info on field declares: https://developers.arcgis.com/arcade/guide/logic/#global-variables
var fields = ["lifecyclestatus","phasesnormal","phaseswinter","phasessummer","phasesplan","phasechange"];
Expects($feature,"lifecyclestatus","phasesnormal","phaseswinter","phasessummer","phasesplan","phasechange");

// The Electric Junction class name
var class_name = 'ElectricJunction';

// ************* End User Variables Section *************

// *************       Functions            *************

// monikerize FeatureSetByName function
var get_features_switch_yard = FeatureSetByName;

function get_valid_codes(d) {
    // extract coded values from domain object
    var valid_codes = [];
    var coded_values = d["codedValues"];
    for (var idx in coded_values) {
        push(valid_codes, coded_values[idx]["code"]);
    }
    return valid_codes;
}

function get_all_fields() {
    // extract list of all fields from $feature
    var all_fields = [];
    var flds = Schema($feature)['fields'];
    for (var idx in flds) {
        push(all_fields, flds[idx]['name']);
    }
    return all_fields;
}

// ************* End Functions Section ******************

// Scan all fields for invalid values based on whether a domain is applied.

// Check fields specified in user section. If no domain applied then the value should be null.
var no_domain_errors = [];
var class_fs = get_features_switch_yard($datastore, class_name, fields, false);
if (no_domain_check) {
    for (var idx in fields) {
        var field = fields[idx];
        var d = Domain(class_fs, field, Number(assetgroup));  // have to force assetgroup to Number to get past validation
        if (IsEmpty(d)) {
            // no domain is applied to this field, on this subtype. It should be null.
            if (!IsEmpty($feature[field])) {
                push(no_domain_errors, field);
            }
        }
    }
}

// Check for invalid values in fields that have domain applied
var invalid_value_errors = [];
if (value_invalid_for_domain_check) {
    var all_fields = get_all_fields();
    class_fs = get_features_switch_yard($datastore, class_name, all_fields, false);
    for (var idx in all_fields) {
        var d2 = Domain(class_fs, all_fields[idx], Number(assetgroup));  // have to force assetgroup to Number to get past validation
        if (IsEmpty(d2)) {
            continue;
        }
        // domain applied, check if value is valid. allow nulls.
        var value = $feature[all_fields[idx]];
        if (IsEmpty(value)) {
            continue;
        }
        // only coded value and range domains supported currently
        if (d2["type"] == "codedValue") {
            var allowed_codes = get_valid_codes(d2);
            if (!Includes(allowed_codes, value)) {
                push(invalid_value_errors, all_fields[idx]);
            }
        } else if (d2["type"] == "range") {
            if (value < d2["min"] || d2["max"] < value) {
                push(invalid_value_errors, all_fields[idx]);
            }
        }
    }
}

// Build error message from results
var error_mess = '';
if (Count(no_domain_errors) > 0) {
    error_mess += `${no_domain_mess} ${Concatenate(no_domain_errors, ', ')}. `;
}
if (Count(invalid_value_errors) > 0) {
    error_mess += `${value_invalid_for_domain_mess} ${Concatenate(invalid_value_errors, ', ')}. `;
}

if (!IsEmpty(error_mess)) {
    return {'errorMessage': error_mess};
}
return true;