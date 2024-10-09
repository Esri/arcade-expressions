// Assigned To: StructureLine
// Type: Calculation
// Name: GenerateIDs-SL
// Description: Generate IDs for StructureLine using database sequences
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
    if (selector_value_txt == '801') {
                            id_format = {
                                'prefix': "GND",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_GND_801_seq');
                        }else if (selector_value_txt == '102') {
                            id_format = {
                                'prefix': "WRDCT-BK",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_WRDCT_BK_102_seq');
                        }else if (selector_value_txt == '103') {
                            id_format = {
                                'prefix': "Wr-Arl-SUP",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_Wr_Arl_SUP_103_seq');
                        }else if (selector_value_txt == '104') {
                            id_format = {
                                'prefix': "Wr-Trnch",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_Wr_Trnch_104_seq');
                        }else if (selector_value_txt == '112') {
                            id_format = {
                                'prefix': "Accss-Tnnl",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_Accss_Tnnl_112_seq');
                        }else if (selector_value_txt == '105') {
                            id_format = {
                                'prefix': "E-HV-Cndt",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_E_HV_Cndt_105_seq');
                        }else if (selector_value_txt == '106') {
                            id_format = {
                                'prefix': "E-LV-Cndt",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_E_LV_Cndt_106_seq');
                        }else if (selector_value_txt == '107') {
                            id_format = {
                                'prefix': "E-MV-Cndt",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_E_MV_Cndt_107_seq');
                        }else if (selector_value_txt == '111') {
                            id_format = {
                                'prefix': "CON-Ln",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_CON_Ln_111_seq');
                        }else if (selector_value_txt == '110') {
                            id_format = {
                                'prefix': "Wr-Lnr-SUP",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_Wr_Lnr_SUP_110_seq');
                        }else if (selector_value_txt == '113') {
                            id_format = {
                                'prefix': "E-HV-Cbl-Pthwy",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_E_HV_Cbl_Pthwy_113_seq');
                        }else if (selector_value_txt == '114') {
                            id_format = {
                                'prefix': "E-MV-Cbl-Pthwy",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_E_MV_Cbl_Pthwy_114_seq');
                        }else if (selector_value_txt == '115') {
                            id_format = {
                                'prefix': "E-LV-Cbl-Pthwy",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_E_LV_Cbl_Pthwy_115_seq');
                        }else if (selector_value_txt == '118') {
                            id_format = {
                                'prefix': "Wr-Mcrdct-Pthwy",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_Wr_Mcrdct_Pthwy_118_seq');
                        }else if (selector_value_txt == '101') {
                            id_format = {
                                'prefix': "Wr-Csng",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_Wr_Csng_101_seq');
                        }else if (selector_value_txt == '124') {
                            id_format = {
                                'prefix': "Lnr-Mrkr",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_Lnr_Mrkr_124_seq');
                        }else if (selector_value_txt == '145') {
                            id_format = {
                                'prefix': "Wr-Lnr-Crssrm",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_Wr_Lnr_Crssrm_145_seq');
                        }else if (selector_value_txt == '146') {
                            id_format = {
                                'prefix': "Wr-Lnr-Pl",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_Wr_Lnr_Pl_146_seq');
                        }else if (selector_value_txt == '109') {
                            id_format = {
                                'prefix': "COM-Cndt",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SL_COM_Cndt_109_seq');
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