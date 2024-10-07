// Assigned To: ElectricLine
// Type: Calculation
// Name: GenerateIDs-EL
// Description: Generate IDs for ElectricLine using database sequences
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
    if (selector_value_txt == '11') {
                            id_format = {
                                'prefix': "NET",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_NET_11_seq');
                        }else if (selector_value_txt == '12') {
                            id_format = {
                                'prefix': "GND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_GND_12_seq');
                        }else if (selector_value_txt == '1') {
                            id_format = {
                                'prefix': "HV-BB",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_HV_BB_1_seq');
                        }else if (selector_value_txt == '3') {
                            id_format = {
                                'prefix': "HV-CON",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_HV_CON_3_seq');
                        }else if (selector_value_txt == '4') {
                            id_format = {
                                'prefix': "HV-STWR",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_HV_STWR_4_seq');
                        }else if (selector_value_txt == '15') {
                            id_format = {
                                'prefix': "HV-SVC",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_HV_SVC_15_seq');
                        }else if (selector_value_txt == '24') {
                            id_format = {
                                'prefix': "HV-Lnr-AR-INS",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_HV_Lnr_AR_INS_24_seq');
                        }else if (selector_value_txt == '8') {
                            id_format = {
                                'prefix': "MV-BB",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_MV_BB_8_seq');
                        }else if (selector_value_txt == '10') {
                            id_format = {
                                'prefix': "MV-CON",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_MV_CON_10_seq');
                        }else if (selector_value_txt == '14') {
                            id_format = {
                                'prefix': "MV-SVC",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_MV_SVC_14_seq');
                        }else if (selector_value_txt == '25') {
                            id_format = {
                                'prefix': "MV-Lnr-AR-INS",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_MV_Lnr_AR_INS_25_seq');
                        }else if (selector_value_txt == '5') {
                            id_format = {
                                'prefix': "LV-BB",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_LV_BB_5_seq');
                        }else if (selector_value_txt == '7') {
                            id_format = {
                                'prefix': "LV-CON",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_LV_CON_7_seq');
                        }else if (selector_value_txt == '13') {
                            id_format = {
                                'prefix': "LV-SVC",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_LV_SVC_13_seq');
                        }else if (selector_value_txt == '26') {
                            id_format = {
                                'prefix': "LV-Lnr-AR-INS",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_LV_Lnr_AR_INS_26_seq');
                        }else if (selector_value_txt == '31') {
                            id_format = {
                                'prefix': "HV-Undrgrnd-COND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_HV_Undrgrnd_COND_31_seq');
                        }else if (selector_value_txt == '32') {
                            id_format = {
                                'prefix': "HV-Sbmrsbl-COND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_HV_Sbmrsbl_COND_32_seq');
                        }else if (selector_value_txt == '34') {
                            id_format = {
                                'prefix': "MV-Undrgrnd-COND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_MV_Undrgrnd_COND_34_seq');
                        }else if (selector_value_txt == '35') {
                            id_format = {
                                'prefix': "MV-Sbmrsbl-COND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_MV_Sbmrsbl_COND_35_seq');
                        }else if (selector_value_txt == '37') {
                            id_format = {
                                'prefix': "LV-Undrgrnd-COND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_LV_Undrgrnd_COND_37_seq');
                        }else if (selector_value_txt == '38') {
                            id_format = {
                                'prefix': "LV-Sbmrsbl-COND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_LV_Sbmrsbl_COND_38_seq');
                        }else if (selector_value_txt == '2') {
                            id_format = {
                                'prefix': "HV-Ovrhd-COND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_HV_Ovrhd_COND_2_seq');
                        }else if (selector_value_txt == '9') {
                            id_format = {
                                'prefix': "MV-Ovrhd-COND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_MV_Ovrhd_COND_9_seq');
                        }else if (selector_value_txt == '6') {
                            id_format = {
                                'prefix': "LV-Ovrhd-COND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_L_LV_Ovrhd_COND_6_seq');
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