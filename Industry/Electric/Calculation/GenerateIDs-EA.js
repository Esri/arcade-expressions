// Assigned To: ElectricAssembly
// Type: Calculation
// Name: GenerateIDs-EA
// Description: Generate IDs for ElectricAssembly using database sequences
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
    if (selector_value_txt == '30') {
                            id_format = {
                                'prefix': "E-GNDng-Eqpmnt",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_E_GNDng_Eqpmnt_30_seq');
                        }else if (selector_value_txt == '31') {
                            id_format = {
                                'prefix': "HV-By",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_HV_By_31_seq');
                        }else if (selector_value_txt == '32') {
                            id_format = {
                                'prefix': "MV-By",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_MV_By_32_seq');
                        }else if (selector_value_txt == '33') {
                            id_format = {
                                'prefix': "LV-By",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_LV_By_33_seq');
                        }else if (selector_value_txt == '1') {
                            id_format = {
                                'prefix': "HV-AC-PFC-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_HV_AC_PFC_BK_1_seq');
                        }else if (selector_value_txt == '2') {
                            id_format = {
                                'prefix': "HV-DC-PFC-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_HV_DC_PFC_BK_2_seq');
                        }else if (selector_value_txt == '24') {
                            id_format = {
                                'prefix': "HV-Cntllr",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_HV_Cntllr_24_seq');
                        }else if (selector_value_txt == '3') {
                            id_format = {
                                'prefix': "HV-SVC-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_HV_SVC_BK_3_seq');
                        }else if (selector_value_txt == '4') {
                            id_format = {
                                'prefix': "HV-SW-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_HV_SW_BK_4_seq');
                        }else if (selector_value_txt == '5') {
                            id_format = {
                                'prefix': "HV-XFR-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_HV_XFR_BK_5_seq');
                        }else if (selector_value_txt == '12') {
                            id_format = {
                                'prefix': "MV-ARSR-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_MV_ARSR_BK_12_seq');
                        }else if (selector_value_txt == '13') {
                            id_format = {
                                'prefix': "MV-CON-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_MV_CON_BK_13_seq');
                        }else if (selector_value_txt == '25') {
                            id_format = {
                                'prefix': "MV-CTRLlr",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_MV_CTRLlr_25_seq');
                        }else if (selector_value_txt == '14') {
                            id_format = {
                                'prefix': "MV-FS-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_MV_FS_BK_14_seq');
                        }else if (selector_value_txt == '15') {
                            id_format = {
                                'prefix': "MV-PFC-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_MV_PFC_BK_15_seq');
                        }else if (selector_value_txt == '16') {
                            id_format = {
                                'prefix': "MV-REG-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_MV_REG_BK_16_seq');
                        }else if (selector_value_txt == '17') {
                            id_format = {
                                'prefix': "MV-SVC-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_MV_SVC_BK_17_seq');
                        }else if (selector_value_txt == '18') {
                            id_format = {
                                'prefix': "MV-SW-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_MV_SW_BK_18_seq');
                        }else if (selector_value_txt == '19') {
                            id_format = {
                                'prefix': "MV-XFR-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_MV_XFR_BK_19_seq');
                        }else if (selector_value_txt == '20') {
                            id_format = {
                                'prefix': "MV-LMR-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_MV_LMR_BK_20_seq');
                        }else if (selector_value_txt == '21') {
                            id_format = {
                                'prefix': "MV-ACR-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_MV_ACR_BK_21_seq');
                        }else if (selector_value_txt == '22') {
                            id_format = {
                                'prefix': "MV-SECT-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_MV_SECT_BK_22_seq');
                        }else if (selector_value_txt == '6') {
                            id_format = {
                                'prefix': "LV-ARSR-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_LV_ARSR_BK_6_seq');
                        }else if (selector_value_txt == '7') {
                            id_format = {
                                'prefix': "LV-CON-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_LV_CON_BK_7_seq');
                        }else if (selector_value_txt == '26') {
                            id_format = {
                                'prefix': "LV-CTRLlr",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_LV_CTRLlr_26_seq');
                        }else if (selector_value_txt == '9') {
                            id_format = {
                                'prefix': "LV-FS-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_LV_FS_BK_9_seq');
                        }else if (selector_value_txt == '10') {
                            id_format = {
                                'prefix': "LV-SVC-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_LV_SVC_BK_10_seq');
                        }else if (selector_value_txt == '11') {
                            id_format = {
                                'prefix': "LV-SW-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_LV_SW_BK_11_seq');
                        }else if (selector_value_txt == '8') {
                            id_format = {
                                'prefix': "LV-XFR-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_A_LV_XFR_BK_8_seq');
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