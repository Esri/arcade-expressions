// Assigned To: ElectricJunctionObject
// Type: Calculation
// Name: GenerateIDs-EJO
// Description: Generate IDs for ElectricJunctionObject using database sequences
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
    if (selector_value_txt == '1') {
                            id_format = {
                                'prefix': "GND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_GND_1_seq');
                        }else if (selector_value_txt == '2') {
                            id_format = {
                                'prefix': "HV-AR-INS",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_HV_AR_INS_2_seq');
                        }else if (selector_value_txt == '3') {
                            id_format = {
                                'prefix': "HV-CTRLU",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_HV_CTRLU_3_seq');
                        }else if (selector_value_txt == '43') {
                            id_format = {
                                'prefix': "HV-FS",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_HV_FS_43_seq');
                        }else if (selector_value_txt == '4') {
                            id_format = {
                                'prefix': "HV-GEN",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_HV_GEN_4_seq');
                        }else if (selector_value_txt == '5') {
                            id_format = {
                                'prefix': "HV-LMR",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_HV_LMR_5_seq');
                        }else if (selector_value_txt == '6') {
                            id_format = {
                                'prefix': "HV-PCON",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_HV_PCON_6_seq');
                        }else if (selector_value_txt == '7') {
                            id_format = {
                                'prefix': "HV-PFC",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_HV_PFC_7_seq');
                        }else if (selector_value_txt == '8') {
                            id_format = {
                                'prefix': "HV-REG",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_HV_REG_8_seq');
                        }else if (selector_value_txt == '9') {
                            id_format = {
                                'prefix': "HV-SVC",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_HV_SVC_9_seq');
                        }else if (selector_value_txt == '10') {
                            id_format = {
                                'prefix': "HV-SW",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_HV_SW_10_seq');
                        }else if (selector_value_txt == '11') {
                            id_format = {
                                'prefix': "HV-XFR",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_HV_XFR_11_seq');
                        }else if (selector_value_txt == '48') {
                            id_format = {
                                'prefix': "HV-XFR-Wndng",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_HV_XFR_Wndng_48_seq');
                        }else if (selector_value_txt == '25') {
                            id_format = {
                                'prefix': "MV-AR-INS",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_AR_INS_25_seq');
                        }else if (selector_value_txt == '26') {
                            id_format = {
                                'prefix': "MV-CB",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_CB_26_seq');
                        }else if (selector_value_txt == '27') {
                            id_format = {
                                'prefix': "MV-CTRLU",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_CTRLU_27_seq');
                        }else if (selector_value_txt == '28') {
                            id_format = {
                                'prefix': "MV-ELL",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_ELL_28_seq');
                        }else if (selector_value_txt == '29') {
                            id_format = {
                                'prefix': "MV-FS",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_FS_29_seq');
                        }else if (selector_value_txt == '30') {
                            id_format = {
                                'prefix': "MV-GEN",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_GEN_30_seq');
                        }else if (selector_value_txt == '31') {
                            id_format = {
                                'prefix': "MV-LMR",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_LMR_31_seq');
                        }else if (selector_value_txt == '32') {
                            id_format = {
                                'prefix': "MV-MTR",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_MTR_32_seq');
                        }else if (selector_value_txt == '33') {
                            id_format = {
                                'prefix': "MV-PCON",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_PCON_33_seq');
                        }else if (selector_value_txt == '34') {
                            id_format = {
                                'prefix': "MV-PFC",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_PFC_34_seq');
                        }else if (selector_value_txt == '35') {
                            id_format = {
                                'prefix': "MV-REG",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_REG_35_seq');
                        }else if (selector_value_txt == '36') {
                            id_format = {
                                'prefix': "MV-SVC",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_SVC_36_seq');
                        }else if (selector_value_txt == '41') {
                            id_format = {
                                'prefix': "MV-ACR",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_ACR_41_seq');
                        }else if (selector_value_txt == '42') {
                            id_format = {
                                'prefix': "MV-SECT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_SECT_42_seq');
                        }else if (selector_value_txt == '37') {
                            id_format = {
                                'prefix': "MV-SW",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_SW_37_seq');
                        }else if (selector_value_txt == '38') {
                            id_format = {
                                'prefix': "MV-XFR",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_XFR_38_seq');
                        }else if (selector_value_txt == '47') {
                            id_format = {
                                'prefix': "MV-XFR-Wndng",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_MV_XFR_Wndng_47_seq');
                        }else if (selector_value_txt == '40') {
                            id_format = {
                                'prefix': "LV-CB",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_CB_40_seq');
                        }else if (selector_value_txt == '12') {
                            id_format = {
                                'prefix': "LV-AR-INS",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_AR_INS_12_seq');
                        }else if (selector_value_txt == '13') {
                            id_format = {
                                'prefix': "LV-CTRLU",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_CTRLU_13_seq');
                        }else if (selector_value_txt == '14') {
                            id_format = {
                                'prefix': "LV-FS",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_FS_14_seq');
                        }else if (selector_value_txt == '15') {
                            id_format = {
                                'prefix': "LV-GEN",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_GEN_15_seq');
                        }else if (selector_value_txt == '16') {
                            id_format = {
                                'prefix': "LV-LGHT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_LGHT_16_seq');
                        }else if (selector_value_txt == '17') {
                            id_format = {
                                'prefix': "LV-LMR",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_LMR_17_seq');
                        }else if (selector_value_txt == '18') {
                            id_format = {
                                'prefix': "LV-MTR",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_MTR_18_seq');
                        }else if (selector_value_txt == '19') {
                            id_format = {
                                'prefix': "LV-NETPROT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_NETPROT_19_seq');
                        }else if (selector_value_txt == '20') {
                            id_format = {
                                'prefix': "LV-PCON",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_PCON_20_seq');
                        }else if (selector_value_txt == '21') {
                            id_format = {
                                'prefix': "LV-PFC",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_PFC_21_seq');
                        }else if (selector_value_txt == '22') {
                            id_format = {
                                'prefix': "LV-SVC",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_SVC_22_seq');
                        }else if (selector_value_txt == '23') {
                            id_format = {
                                'prefix': "LV-SW",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_SW_23_seq');
                        }else if (selector_value_txt == '24') {
                            id_format = {
                                'prefix': "LV-XFR",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_XFR_24_seq');
                        }else if (selector_value_txt == '44') {
                            id_format = {
                                'prefix': "LV-Wr-CON",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_Wr_CON_44_seq');
                        }else if (selector_value_txt == '45') {
                            id_format = {
                                'prefix': "LV-REG",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_REG_45_seq');
                        }else if (selector_value_txt == '46') {
                            id_format = {
                                'prefix': "LV-XFR-Wndng",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_LV_XFR_Wndng_46_seq');
                        }else if (selector_value_txt == '61') {
                            id_format = {
                                'prefix': "Ln-Hrdwr",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_Ln_Hrdwr_61_seq');
                        }else if (selector_value_txt == '101') {
                            id_format = {
                                'prefix': "Arl-Br",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_Arl_Br_101_seq');
                        }else if (selector_value_txt == '102') {
                            id_format = {
                                'prefix': "Arl-Cvrd",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_Arl_Cvrd_102_seq');
                        }else if (selector_value_txt == '104') {
                            id_format = {
                                'prefix': "BB",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_BB_104_seq');
                        }else if (selector_value_txt == '105') {
                            id_format = {
                                'prefix': "Undrgrnd",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_Undrgrnd_105_seq');
                        }else if (selector_value_txt == '106') {
                            id_format = {
                                'prefix': "NET",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_NET_106_seq');
                        }else if (selector_value_txt == '107') {
                            id_format = {
                                'prefix': "GND-Wr",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_GND_Wr_107_seq');
                        }else if (selector_value_txt == '108') {
                            id_format = {
                                'prefix': "Sbmrn",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_Sbmrn_108_seq');
                        }else if (selector_value_txt == '109') {
                            id_format = {
                                'prefix': "CON",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('E_JO_CON_109_seq');
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