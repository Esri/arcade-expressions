# Constrain to Domain Code

This expression constrains new input values to values within the domain applied to the field. This rule can check two scenarios. These checks can be enabled or disabled.
1. If a field specified in the field list below has no domain applied for a particular subtype, ensure the value is null.
     (this is useful for Network Attributes)
2. If a domain is applied to a field, ensure the value is valid for domain. This will check every field on $feature.

## Use cases

As you may or may not know, esri allows values to be stored in a field managed by a domain that are outside of the domain values. You are able to do this using normal esri editing tools etc. This constraint aims to remove this loophole.

## Workflow

Copy and paste the expression found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.


## Expression Template

This Arcade expression will not allow a value to be entered into a field that is not a part of the domain applied to the field.

```js
// Assigned To: ElectricDevice
// Type: Validation
// Name: ElectricDevice - Validate Domains
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
//    - None

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
var fields = ["plandevicestatus", "normaldevicestatus", "currentdevicestatus", "winterdevicestatus", "summerdevicestatus"];
$feature.plandevicestatus;
$feature.normaldevicestatus;
$feature.currentdevicestatus;
$feature.winterdevicestatus;
$feature.summerdevicestatus;

// The Electric Device class name
var electric_device = 'ElectricDevice';

// ************* End User Variables Section *************

// *************       Functions            *************

// monikerize FeatureSetByName function
var get_features_switch_yard = FeatureSetByName;

function get_valid_codes(d) {
    // extract coded values from domain object
    var valid_codes = [];
    var coded_values = d["codedValues"];
    for (var idx in coded_values) {
        push(valid_codes, coded_values[idx]["code"])
    }
    return valid_codes
}

function get_all_fields(feature) {
    // extract list of all fields from $feature
    var all_fields = [];
    var flds = Schema($feature)['fields'];
    for (var idx in flds) {
        push(all_fields, flds[idx]['name'])
    }
    return all_fields
}

// ************* End Functions Section ******************

// Scan all fields for invalid values based on whether a domain is applied.

// Check fields specified in user section. If no domain applied then the value should be null.
var no_domain_errors = [];
var device_fs = get_features_switch_yard($datastore, electric_device, fields, false);
if (no_domain_check) {
    for (var idx in fields) {
        var field = fields[idx];
        var d = Domain(device_fs, field, Number(assetgroup));  // have to force assetgroup to Number to get past validation
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
    var all_fields = get_all_fields($feature);
    device_fs = get_features_switch_yard($datastore, electric_device, all_fields, false);
    for (var idx in all_fields) {
        var d2 = Domain(device_fs, all_fields[idx], Number(assetgroup));  // have to force assetgroup to Number to get past validation
        if (IsEmpty(d2)) {
            continue
        }
        // domain applied, check if value is valid. allow nulls.
        var value = $feature[all_fields[idx]];
        if (IsEmpty(value)) {
            continue
        }
        // only coded value and range domains supported currently
        if (d2["type"] == "codedValue") {
            var allowed_codes = get_valid_codes(d2);
            if (!Includes(allowed_codes, value)) {
                push(invalid_value_errors, all_fields[idx]);
            }
        } else if (d2["type"] == "range") {
            if (value < d2["min"] || d2["max"] < value) {
                push(invalid_value_errors, all_fields[idx])
            }
        }
    }
}

// Build error message from results
var error_mess = '';
if (Count(no_domain_errors) > 0) {
    error_mess += `${no_domain_mess} ${Concatenate(no_domain_errors, ', ')}. `
}
if (Count(invalid_value_errors) > 0) {
    error_mess += `${value_invalid_for_domain_mess} ${Concatenate(invalid_value_errors, ', ')}. `
}

if (IsEmpty(error_mess)) {
    return true;
} else {
    return {'errorMessage': error_mess}
}
```
