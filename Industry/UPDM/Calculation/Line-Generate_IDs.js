// Assigned To: PipelineLine
// Type: Calculation
// Name: Line - Generate ID
// Description: Generate IDs for PipelineLine using database sequences
// Subtypes: All
// Field: assetid
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules are rely on additional rules for execution.  If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in:  This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - Assembly - Generate ID
//    - Device - Generate ID
//    - Junction - Generate ID
//    - Line - Generate ID
//    - StructureBoundary - Generate ID
//    - StructureJunction - Generate ID
//    - StructureLine - Generate ID

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

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
    var selector_value_txt = Text(selector_value);
    if (selector_value_txt == '1') {
            id_format = {
                'prefix': "Srvc-Pp",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Line_Srvc_Pp_1_seq');
        }else if (selector_value_txt == '15') {
            id_format = {
                'prefix': "Prssr-Snsr-Pp",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Line_Prssr_Snsr_Pp_15_seq');
        }else if (selector_value_txt == '2') {
            id_format = {
                'prefix': "Dstrbtn-Pp",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Line_Dstrbtn_Pp_2_seq');
        }else if (selector_value_txt == '3') {
            id_format = {
                'prefix': "Trnsmssn-Pp",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Line_Trnsmssn_Pp_3_seq');
        }else if (selector_value_txt == '4') {
            id_format = {
                'prefix': "Gthrng-Pp",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Line_Gthrng_Pp_4_seq');
        }else if (selector_value_txt == '5') {
            id_format = {
                'prefix': "Sttn-Pp",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Line_Sttn_Pp_5_seq');
        }else if (selector_value_txt == '50') {
            id_format = {
                'prefix': "Bndng-Ln",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Line_Bndng_Ln_50_seq');
        }else if (selector_value_txt == '51') {
            id_format = {
                'prefix': "Tst-Ld-Wr",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Line_Tst_Ld_Wr_51_seq');
        }else if (selector_value_txt == '52') {
            id_format = {
                'prefix': "Rctfr-Cbl",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Line_Rctfr_Cbl_52_seq');
        }else if (selector_value_txt == '6') {
            id_format = {
                'prefix': "Cstmr-Pp",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Line_Cstmr_Pp_6_seq');
        }else if (selector_value_txt == '7') {
            id_format = {
                'prefix': "Rsr-Pp",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Line_Rsr_Pp_7_seq');
        }else {
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
        if (!IsEmpty(arr[i]) && Text(arr[i]) != '') {
            new_arr[j++] = arr[i];
        }
    }
    return new_arr;
}

// ************* End Functions Section *****************

if (IsEmpty(assigned_to_field) == false) {
    return assigned_to_field
}
var new_id = get_id(id_selector_value)
if (IsEmpty(new_id)) {
    return assigned_to_field;
}
return new_id

