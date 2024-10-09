// Assigned To: ElectricEdgeObject
// Type: Calculation
// Name: GenerateIDs-EEO
// Description: Generate IDs for ElectricEdgeObject using database sequences
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
//   - GenerateIDs-EJ
//   - GenerateIDs-EJO
//   - GenerateIDs-EL


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
    if (selector_value_txt == '101') {
                            id_format = {
                                'prefix': "Arl-Br",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_EO_Arl_Br_101_seq');
                        }else if (selector_value_txt == '102') {
                            id_format = {
                                'prefix': "Arl-Cvrd",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_EO_Arl_Cvrd_102_seq');
                        }else if (selector_value_txt == '104') {
                            id_format = {
                                'prefix': "BB",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_EO_BB_104_seq');
                        }else if (selector_value_txt == '105') {
                            id_format = {
                                'prefix': "Undrgrnd",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_EO_Undrgrnd_105_seq');
                        }else if (selector_value_txt == '106') {
                            id_format = {
                                'prefix': "NET",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_EO_NET_106_seq');
                        }else if (selector_value_txt == '107') {
                            id_format = {
                                'prefix': "GND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_EO_GND_107_seq');
                        }else if (selector_value_txt == '108') {
                            id_format = {
                                'prefix': "Sbmrn",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_EO_Sbmrn_108_seq');
                        }else if (selector_value_txt == '109') {
                            id_format = {
                                'prefix': "CON",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_EO_CON_109_seq');
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