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

// Define the leading text, the trailing text and the delimiter for the ID, this dict is keyed by Asset Group as text
var id_formats = {
    '1': {
        'join_char': '-',
        'prefix': 'Cplng',
        'sequence': 'Junction_Cplng_1_seq',
        'suffix': ''
    },
    '10': {
        'join_char': '-',
        'prefix': 'Scrw',
        'sequence': 'Junction_Scrw_10_seq',
        'suffix': ''
    },
    '11': {
        'join_char': '-',
        'prefix': 'Elctr-Stp',
        'sequence': 'Junction_Elctr_Stp_11_seq',
        'suffix': ''
    },
    '12': {
        'join_char': '-',
        'prefix': 'Plstc-Fsn',
        'sequence': 'Junction_Plstc_Fsn_12_seq',
        'suffix': ''
    },
    '13': {
        'join_char': '-',
        'prefix': 'Sddl',
        'sequence': 'Junction_Sddl_13_seq',
        'suffix': ''
    },
    '14': {
        'join_char': '-',
        'prefix': 'Tnk',
        'sequence': 'Junction_Tnk_14_seq',
        'suffix': ''
    },
    '15': {
        'join_char': '-',
        'prefix': 'Ln-Htr',
        'sequence': 'Junction_Ln_Htr_15_seq',
        'suffix': ''
    },
    '16': {
        'join_char': '-',
        'prefix': 'Clng-Systm',
        'sequence': 'Junction_Clng_Systm_16_seq',
        'suffix': ''
    },
    '17': {
        'join_char': '-',
        'prefix': 'Odrzr',
        'sequence': 'Junction_Odrzr_17_seq',
        'suffix': ''
    },
    '18': {
        'join_char': '-',
        'prefix': 'Cpn',
        'sequence': 'Junction_Cpn_18_seq',
        'suffix': ''
    },
    '19': {
        'join_char': '-',
        'prefix': 'Dhydrtn-Eqpmnt',
        'sequence': 'Junction_Dhydrtn_Eqpmnt_19_seq',
        'suffix': ''
    },
    '2': {
        'join_char': '-',
        'prefix': 'Elbw',
        'sequence': 'Junction_Elbw_2_seq',
        'suffix': ''
    },
    '20': {
        'join_char': '-',
        'prefix': 'Drp',
        'sequence': 'Junction_Drp_20_seq',
        'suffix': ''
    },
    '21': {
        'join_char': '-',
        'prefix': 'Cnnctn-Pnt',
        'sequence': 'Junction_Cnnctn_Pnt_21_seq',
        'suffix': ''
    },
    '23': {
        'join_char': '-',
        'prefix': 'Unn',
        'sequence': 'Junction_Unn_23_seq',
        'suffix': ''
    },
    '24': {
        'join_char': '-',
        'prefix': 'Plg',
        'sequence': 'Junction_Plg_24_seq',
        'suffix': ''
    },
    '3': {
        'join_char': '-',
        'prefix': 'End-Cp',
        'sequence': 'Junction_End_Cp_3_seq',
        'suffix': ''
    },
    '30': {
        'join_char': '-',
        'prefix': 'Pp-Bnd',
        'sequence': 'Junction_Pp_Bnd_30_seq',
        'suffix': ''
    },
    '4': {
        'join_char': '-',
        'prefix': 'Expnsn-Jnt',
        'sequence': 'Junction_Expnsn_Jnt_4_seq',
        'suffix': ''
    },
    '5': {
        'join_char': '-',
        'prefix': 'Flng',
        'sequence': 'Junction_Flng_5_seq',
        'suffix': ''
    },
    '50': {
        'join_char': '-',
        'prefix': 'Wr-Jnctn',
        'sequence': 'Junction_Wr_Jnctn_50_seq',
        'suffix': ''
    },
    '51': {
        'join_char': '-',
        'prefix': 'Insltn-Jnctn',
        'sequence': 'Junction_Insltn_Jnctn_51_seq',
        'suffix': ''
    },
    '6': {
        'join_char': '-',
        'prefix': 'Rdcr',
        'sequence': 'Junction_Rdcr_6_seq',
        'suffix': ''
    },
    '7': {
        'join_char': '-',
        'prefix': 'T',
        'sequence': 'Junction_T_7_seq',
        'suffix': ''
    },
    '8': {
        'join_char': '-',
        'prefix': 'Trnstn',
        'sequence': 'Junction_Trnstn_8_seq',
        'suffix': ''
    },
    '9': {
        'join_char': '-',
        'prefix': 'Wld',
        'sequence': 'Junction_Wld_9_seq',
        'suffix': ''
    }
};
// ************* End Section *****************

// Functions
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

// End Functions

if (IsEmpty(assigned_to_field) == false && assigned_to_field != '') {
    return assigned_to_field
}
if (TypeOf(id_formats) != 'Dictionary' || HasKey(id_formats, Text($feature.assetgroup)) == false) {
    return assigned_to_field;
}

var id_format = id_formats[Text($feature.assetgroup)];
// Remove any empty values
var id_parts = remove_empty([id_format['prefix'], NextSequenceValue(id_format['sequence']), id_format['suffix']])
return Concatenate(id_parts, id_format['join_char'])