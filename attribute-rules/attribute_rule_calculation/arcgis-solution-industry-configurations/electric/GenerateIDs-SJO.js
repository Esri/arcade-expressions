// Assigned To: StructureJunctionObject
// Type: Calculation
// Name: GenerateIDs-SJO
// Description: Generate IDs for StructureJunctionObject using database sequences
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
    if (selector_value_txt == '120') {
                            id_format = {
                                'prefix': "Pl",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJO_Pl_120_seq');
                        }else if (selector_value_txt == '130') {
                            id_format = {
                                'prefix': "Wr-VLT-KO",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJO_Wr_VLT_KO_130_seq');
                        }else if (selector_value_txt == '134') {
                            id_format = {
                                'prefix': "Wr-Mcrdct-Fttng",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJO_Wr_Mcrdct_Fttng_134_seq');
                        }else if (selector_value_txt == '135') {
                            id_format = {
                                'prefix': "Wr-Mcrdct-CPT",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJO_Wr_Mcrdct_CPT_135_seq');
                        }else if (selector_value_txt == '126') {
                            id_format = {
                                'prefix': "Wr-Cndt-Fttngs",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJO_Wr_Cndt_Fttngs_126_seq');
                        }else if (selector_value_txt == '132') {
                            id_format = {
                                'prefix': "Wr-Md-Ftg-Grp",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJO_Wr_Md_Ftg_Grp_132_seq');
                        }else if (selector_value_txt == '114') {
                            id_format = {
                                'prefix': "Wr-Crssrm",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJO_Wr_Crssrm_114_seq');
                        }else if (selector_value_txt == '151') {
                            id_format = {
                                'prefix': "E-HV-Cbl-Pthwy",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJO_E_HV_Cbl_Pthwy_151_seq');
                        }else if (selector_value_txt == '152') {
                            id_format = {
                                'prefix': "E-MV-Cbl-Pthwy",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJO_E_MV_Cbl_Pthwy_152_seq');
                        }else if (selector_value_txt == '153') {
                            id_format = {
                                'prefix': "E-LV-Cbl-Pthwy",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJO_E_LV_Cbl_Pthwy_153_seq');
                        }else if (selector_value_txt == '121') {
                            id_format = {
                                'prefix': "Arl-SUP-Hrdwr",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJO_Arl_SUP_Hrdwr_121_seq');
                        }else if (selector_value_txt == '137') {
                            id_format = {
                                'prefix': "BLD-Rsr",
                                'join_char': '-',
                                'suffix': ''
                            }
                            seq_val = NextSequenceValue('SJO_BLD_Rsr_137_seq');
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