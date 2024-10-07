// Assigned To: ElectricJunction
// Type: Calculation
// Name: GenerateIDs-EJ
// Description: Generate IDs for ElectricJunction using database sequences
// Subtypes: All
// Field: assetid
// Evaluation Order: 1
// Trigger: Insert, Update
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules are rely on additional rules for execution.  If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated In: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//   - GenerateIDs-SJ
//   - GenerateIDs-SB
//   - GenerateIDs-SJO
//   - GenerateIDs-SL
//   - GenerateIDs-SEO
//   - GenerateIDs-ED
//   - GenerateIDs-EA
//   - GenerateIDs-EJO
//   - GenerateIDs-EL
//   - GenerateIDs-EEO


// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
Expects($feature, 'assetid', 'assetgroup');

// Field in the data model used to store and manage the ID
// ** Implementation Note: This value does not need to change if using the industry data model
var assigned_to_field = $feature.assetid;

// Asset group/Subtype field used to define different IDs per the class
// ** Implementation Note: This value does not need to change if using the industry data model
var id_selector_value = $feature.assetgroup;

// Define the leading text, the trailing text and the delimiter for the ID, this function requires the keyed passed in
// NextSequenceValue requires a string literal for copy and paste, although it supports a variable, it is recommended
// to not use one
// ** Implementation Note: Adjust the prefix and join_char for each subtype.  The selector_value_txt is the subtype of the layer

function get_id(selector_value) {
    var id_format = {}
    var seq_val = null;
    var selector_value_txt = Text(selector_value)
    if (selector_value_txt == '20') {
                            id_format = {
                                'prefix': "GND-ATT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_J_GND_ATT_20_seq');
                        }else if (selector_value_txt == '1') {
                            id_format = {
                                'prefix': "HV-ATT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_J_HV_ATT_1_seq');
                        }else if (selector_value_txt == '2') {
                            id_format = {
                                'prefix': "HV-CPT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_J_HV_CPT_2_seq');
                        }else if (selector_value_txt == '3') {
                            id_format = {
                                'prefix': "HV-LE",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_J_HV_LE_3_seq');
                        }else if (selector_value_txt == '7') {
                            id_format = {
                                'prefix': "MV-ATT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_J_MV_ATT_7_seq');
                        }else if (selector_value_txt == '8') {
                            id_format = {
                                'prefix': "MV-CPT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_J_MV_CPT_8_seq');
                        }else if (selector_value_txt == '9') {
                            id_format = {
                                'prefix': "MV-LE",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_J_MV_LE_9_seq');
                        }else if (selector_value_txt == '4') {
                            id_format = {
                                'prefix': "LV-ATT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_J_LV_ATT_4_seq');
                        }else if (selector_value_txt == '5') {
                            id_format = {
                                'prefix': "LV-CPT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_J_LV_CPT_5_seq');
                        }else if (selector_value_txt == '6') {
                            id_format = {
                                'prefix': "LV-LE",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_J_LV_LE_6_seq');
                        } else {
        return null;
    }
        var id_parts = remove_empty([id_format['prefix'], seq_val, id_format['suffix']])
        return Concatenate(id_parts, id_format['join_char'])
    }
// ************* End User Variables Section *************

// *************       Functions            *************
function remove_empty(arr) {
   var new_arr = [];
   var j = 0;
   for (var i = 0; i < Count(arr); i++) {
       if (!IsEmpty(arr[i]) && arr[i] != '') {
           new_arr[j++] = arr[i];
       }
   }
   return new_arr;
}

// ************* End Functions Section *****************


if ($editcontext.editType == 'UPDATE'){
    if (IsEmpty(assigned_to_field) == false) {
        return assigned_to_field
    }
}
var new_id = get_id(id_selector_value)
if (IsEmpty(new_id)) {
    return assigned_to_field;
}
return new_id