// Assigned To: PipelineLine
// Type: Calculation
// Name: Generate IDs for PipelineLine
// Description: Generate IDs for PipelineLine using database sequences
// Subtypes: All
// Field: assetid
// Execute: Insert

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

var assigned_to_field = $feature.assetid;

// Define the leading text, the trailing text and the delimiter for the ID, this function requires the keyed passed in
// NextSequenceValue requires a string literal for copy and paste, although it supports a variable, it is recommended
// to not use one
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

// ************* End Section *****************
// Functions
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

// End Functions

if (IsEmpty(assigned_to_field) == false && assigned_to_field != '') {
    return assigned_to_field
}
var new_id = get_id($feature.assetgroup)
if (IsEmpty(new_id)) {
    return assigned_to_field;
}
return new_id

