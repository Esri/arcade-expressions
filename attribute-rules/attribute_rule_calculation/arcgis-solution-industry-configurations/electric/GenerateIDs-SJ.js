// Assigned To: StructureJunction
// Type: Calculation
// Name: GenerateIDs-SJ
// Description: Generate IDs for StructureJunction using database sequences
// Subtypes: All
// Field: assetid
// Evaluation Order: 1
// Trigger: Insert, Update
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules are rely on additional rules for execution.  If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated In: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//   - GenerateIDs-SB
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
    if (selector_value_txt == '135') {
                            id_format = {
                                'prefix': "E-Sttn",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_E_Sttn_135_seq');
                        }else if (selector_value_txt == '101') {
                            id_format = {
                                'prefix': "Wr-CAB",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_CAB_101_seq');
                        }else if (selector_value_txt == '102') {
                            id_format = {
                                'prefix': "Wr-Strctr-Gy",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_Strctr_Gy_102_seq');
                        }else if (selector_value_txt == '103') {
                            id_format = {
                                'prefix': "Wr-HH",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_HH_103_seq');
                        }else if (selector_value_txt == '104') {
                            id_format = {
                                'prefix': "Wr-JCT-Bx",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_JCT_Bx_104_seq');
                        }else if (selector_value_txt == '105') {
                            id_format = {
                                'prefix': "Wr-VLT-Accss-Pnt",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_VLT_Accss_Pnt_105_seq');
                        }else if (selector_value_txt == '110') {
                            id_format = {
                                'prefix': "Wr-VLT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_VLT_110_seq');
                        }else if (selector_value_txt == '107') {
                            id_format = {
                                'prefix': "Wr-PED",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_PED_107_seq');
                        }else if (selector_value_txt == '106') {
                            id_format = {
                                'prefix': "E-Pd",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_E_Pd_106_seq');
                        }else if (selector_value_txt == '108') {
                            id_format = {
                                'prefix': "E-PLAT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_E_PLAT_108_seq');
                        }else if (selector_value_txt == '112') {
                            id_format = {
                                'prefix': "E-By",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_E_By_112_seq');
                        }else if (selector_value_txt == '120') {
                            id_format = {
                                'prefix': "E-HV-Pl",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_E_HV_Pl_120_seq');
                        }else if (selector_value_txt == '121') {
                            id_format = {
                                'prefix': "E-MV-Pl",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_E_MV_Pl_121_seq');
                        }else if (selector_value_txt == '122') {
                            id_format = {
                                'prefix': "E-LV-Pl",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_E_LV_Pl_122_seq');
                        }else if (selector_value_txt == '123') {
                            id_format = {
                                'prefix': "Wr-SUP-Pl",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_SUP_Pl_123_seq');
                        }else if (selector_value_txt == '111') {
                            id_format = {
                                'prefix': "COM-Twr",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_COM_Twr_111_seq');
                        }else if (selector_value_txt == '125') {
                            id_format = {
                                'prefix': "COM-Pl",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_COM_Pl_125_seq');
                        }else if (selector_value_txt == '124') {
                            id_format = {
                                'prefix': "Mrkr",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Mrkr_124_seq');
                        }else if (selector_value_txt == '132') {
                            id_format = {
                                'prefix': "Wr-Strctr-Rprsnttn",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_Strctr_Rprsnttn_132_seq');
                        }else if (selector_value_txt == '130') {
                            id_format = {
                                'prefix': "Wr-VLT-KO",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_VLT_KO_130_seq');
                        }else if (selector_value_txt == '134') {
                            id_format = {
                                'prefix': "Dct-JCTs",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Dct_JCTs_134_seq');
                        }else if (selector_value_txt == '126') {
                            id_format = {
                                'prefix': "Wr-Cndt-Fttngs",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_Cndt_Fttngs_126_seq');
                        }else if (selector_value_txt == '113') {
                            id_format = {
                                'prefix': "Wr-Cstmr-ATT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_Cstmr_ATT_113_seq');
                        }else if (selector_value_txt == '133') {
                            id_format = {
                                'prefix': "Strctr-ATT-Pnt",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Strctr_ATT_Pnt_133_seq');
                        }else if (selector_value_txt == '801') {
                            id_format = {
                                'prefix': "GND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_GND_801_seq');
                        }else if (selector_value_txt == '136') {
                            id_format = {
                                'prefix': "Wr-Stck-Sts",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_Stck_Sts_136_seq');
                        }else if (selector_value_txt == '802') {
                            id_format = {
                                'prefix': "BLD",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_BLD_802_seq');
                        }else if (selector_value_txt == '803') {
                            id_format = {
                                'prefix': "SUP",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_SUP_803_seq');
                        }else if (selector_value_txt == '137') {
                            id_format = {
                                'prefix': "BLD-Rsr",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_BLD_Rsr_137_seq');
                        }else if (selector_value_txt == '804') {
                            id_format = {
                                'prefix': "Fndtn",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Fndtn_804_seq');
                        }else if (selector_value_txt == '114') {
                            id_format = {
                                'prefix': "Trnstn-Pnt",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Trnstn_Pnt_114_seq');
                        }else if (selector_value_txt == '145') {
                            id_format = {
                                'prefix': "Wr-Crssrm",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJ_Wr_Crssrm_145_seq');
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