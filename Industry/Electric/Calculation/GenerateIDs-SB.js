// Assigned To: StructureBoundary
// Type: Calculation
// Name: GenerateIDs-SB
// Description: Generate IDs for StructureBoundary using database sequences
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
//   - GenerateIDs-SJO
//   - GenerateIDs-SL
//   - GenerateIDs-SEO
//   - GenerateIDs-ED
//   - GenerateIDs-EA
//   - GenerateIDs-EJ
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
    if (selector_value_txt == '107') {
                            id_format = {
                                'prefix': "E-CEN-GEN",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SB_E_CEN_GEN_107_seq');
                        }else if (selector_value_txt == '108') {
                            id_format = {
                                'prefix': "E-DIST-GEN",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SB_E_DIST_GEN_108_seq');
                        }else if (selector_value_txt == '102') {
                            id_format = {
                                'prefix': "E-SUB",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SB_E_SUB_102_seq');
                        }else if (selector_value_txt == '103') {
                            id_format = {
                                'prefix': "E-STORFAC",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SB_E_STORFAC_103_seq');
                        }else if (selector_value_txt == '101') {
                            id_format = {
                                'prefix': "Wr-CAB",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SB_Wr_CAB_101_seq');
                        }else if (selector_value_txt == '104') {
                            id_format = {
                                'prefix': "Wr-VLT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SB_Wr_VLT_104_seq');
                        }else if (selector_value_txt == '105') {
                            id_format = {
                                'prefix': "E-SWGR",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SB_E_SWGR_105_seq');
                        }else if (selector_value_txt == '106') {
                            id_format = {
                                'prefix': "E-By",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SB_E_By_106_seq');
                        }else if (selector_value_txt == '110') {
                            id_format = {
                                'prefix': "E-Zn",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SB_E_Zn_110_seq');
                        }else if (selector_value_txt == '801') {
                            id_format = {
                                'prefix': "BLD",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SB_BLD_801_seq');
                        }else if (selector_value_txt == '803') {
                            id_format = {
                                'prefix': "SUP",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SB_SUP_803_seq');
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