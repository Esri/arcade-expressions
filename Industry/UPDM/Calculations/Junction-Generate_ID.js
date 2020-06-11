// Assigned To: PipelineJunction
// Type: Calculation
// Name: Generate IDs for PipelineJunction
// Description: Generate IDs for PipelineJunction using database sequences
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
    if (Text(selector_value) == '1') {
            id_format = {
                'prefix': "Cplng",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Cplng_1_seq');
        }else if (Text(selector_value) == '10') {
            id_format = {
                'prefix': "Scrw",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Scrw_10_seq');
        }else if (Text(selector_value) == '11') {
            id_format = {
                'prefix': "Elctr-Stp",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Elctr_Stp_11_seq');
        }else if (Text(selector_value) == '12') {
            id_format = {
                'prefix': "Plstc-Fsn",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Plstc_Fsn_12_seq');
        }else if (Text(selector_value) == '13') {
            id_format = {
                'prefix': "Sddl",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Sddl_13_seq');
        }else if (Text(selector_value) == '14') {
            id_format = {
                'prefix': "Tnk",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Tnk_14_seq');
        }else if (Text(selector_value) == '15') {
            id_format = {
                'prefix': "Ln-Htr",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Ln_Htr_15_seq');
        }else if (Text(selector_value) == '16') {
            id_format = {
                'prefix': "Clng-Systm",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Clng_Systm_16_seq');
        }else if (Text(selector_value) == '17') {
            id_format = {
                'prefix': "Odrzr",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Odrzr_17_seq');
        }else if (Text(selector_value) == '18') {
            id_format = {
                'prefix': "Cpn",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Cpn_18_seq');
        }else if (Text(selector_value) == '19') {
            id_format = {
                'prefix': "Dhydrtn-Eqpmnt",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Dhydrtn_Eqpmnt_19_seq');
        }else if (Text(selector_value) == '2') {
            id_format = {
                'prefix': "Elbw",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Elbw_2_seq');
        }else if (Text(selector_value) == '20') {
            id_format = {
                'prefix': "Drp",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Drp_20_seq');
        }else if (Text(selector_value) == '21') {
            id_format = {
                'prefix': "Cnnctn-Pnt",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Cnnctn_Pnt_21_seq');
        }else if (Text(selector_value) == '23') {
            id_format = {
                'prefix': "Unn",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Unn_23_seq');
        }else if (Text(selector_value) == '24') {
            id_format = {
                'prefix': "Plg",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Plg_24_seq');
        }else if (Text(selector_value) == '3') {
            id_format = {
                'prefix': "End-Cp",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_End_Cp_3_seq');
        }else if (Text(selector_value) == '30') {
            id_format = {
                'prefix': "Pp-Bnd",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Pp_Bnd_30_seq');
        }else if (Text(selector_value) == '4') {
            id_format = {
                'prefix': "Expnsn-Jnt",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Expnsn_Jnt_4_seq');
        }else if (Text(selector_value) == '5') {
            id_format = {
                'prefix': "Flng",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Flng_5_seq');
        }else if (Text(selector_value) == '50') {
            id_format = {
                'prefix': "Wr-Jnctn",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Wr_Jnctn_50_seq');
        }else if (Text(selector_value) == '51') {
            id_format = {
                'prefix': "Insltn-Jnctn",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Insltn_Jnctn_51_seq');
        }else if (Text(selector_value) == '6') {
            id_format = {
                'prefix': "Rdcr",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Rdcr_6_seq');
        }else if (Text(selector_value) == '7') {
            id_format = {
                'prefix': "T",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_T_7_seq');
        }else if (Text(selector_value) == '8') {
            id_format = {
                'prefix': "Trnstn",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Trnstn_8_seq');
        }else if (Text(selector_value) == '9') {
            id_format = {
                'prefix': "Wld",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('Junction_Wld_9_seq');
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

