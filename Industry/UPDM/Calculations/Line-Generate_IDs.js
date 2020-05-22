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

// Define the leading text, the trailing text and the delimiter for the ID, this dict is keyed by Asset Group as text
var id_formats = {
    '1': {
        'join_char': '-',
        'prefix': 'Srvc-Pp',
        'sequence': 'Line_Srvc_Pp_1_seq',
        'suffix': ''
    },
    '15': {
        'join_char': '-',
        'prefix': 'Prssr-Snsr-Ln',
        'sequence': 'Line_Prssr_Snsr_Ln_15_seq',
        'suffix': ''
    },
    '2': {
        'join_char': '-',
        'prefix': 'Dstrbtn-Pp',
        'sequence': 'Line_Dstrbtn_Pp_2_seq',
        'suffix': ''
    },
    '3': {
        'join_char': '-',
        'prefix': 'Trnsmssn-Pp',
        'sequence': 'Line_Trnsmssn_Pp_3_seq',
        'suffix': ''
    },
    '4': {
        'join_char': '-',
        'prefix': 'Gthrng-Pp',
        'sequence': 'Line_Gthrng_Pp_4_seq',
        'suffix': ''
    },
    '5': {
        'join_char': '-',
        'prefix': 'Sttn-Pp',
        'sequence': 'Line_Sttn_Pp_5_seq',
        'suffix': ''
    },
    '50': {
        'join_char': '-',
        'prefix': 'Bndng-Ln',
        'sequence': 'Line_Bndng_Ln_50_seq',
        'suffix': ''
    },
    '51': {
        'join_char': '-',
        'prefix': 'Tst-Ld-Wr',
        'sequence': 'Line_Tst_Ld_Wr_51_seq',
        'suffix': ''
    },
    '52': {
        'join_char': '-',
        'prefix': 'Rctfr-Cbl',
        'sequence': 'Line_Rctfr_Cbl_52_seq',
        'suffix': ''
    },
    '6': {
        'join_char': '-',
        'prefix': 'Cstmr-Pp',
        'sequence': 'Line_Cstmr_Pp_6_seq',
        'suffix': ''
    },
    '7': {
        'join_char': '-',
        'prefix': 'Rsr-Pp',
        'sequence': 'Line_Rsr_Pp_7_seq',
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