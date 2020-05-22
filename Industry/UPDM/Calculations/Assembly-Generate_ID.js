// Assigned To: PipelineAssembly
// Type: Calculation
// Name: Generate IDs for PipelineAssembly
// Description: Generate IDs for PipelineAssembly using database sequences
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
        'prefix': 'Cmprssr-Sttn',
        'sequence': 'Assembly_Cmprssr_Sttn_1_seq',
        'suffix': ''
    },
    '10': {
        'join_char': '-',
        'prefix': 'Vlv-Assmbly',
        'sequence': 'Assembly_Vlv_Assmbly_10_seq',
        'suffix': ''
    },
    '2': {
        'join_char': '-',
        'prefix': 'Mtr-Sttng',
        'sequence': 'Assembly_Mtr_Sttng_2_seq',
        'suffix': ''
    },
    '3': {
        'join_char': '-',
        'prefix': 'Rgltr-Sttn',
        'sequence': 'Assembly_Rgltr_Sttn_3_seq',
        'suffix': ''
    },
    '4': {
        'join_char': '-',
        'prefix': 'Rrl-Tp',
        'sequence': 'Assembly_Rrl_Tp_4_seq',
        'suffix': ''
    },
    '5': {
        'join_char': '-',
        'prefix': 'Twn-Brdr-Sttn',
        'sequence': 'Assembly_Twn_Brdr_Sttn_5_seq',
        'suffix': ''
    },
    '6': {
        'join_char': '-',
        'prefix': 'Wllhd',
        'sequence': 'Assembly_Wllhd_6_seq',
        'suffix': ''
    },
    '7': {
        'join_char': '-',
        'prefix': 'Pggng-Strctr',
        'sequence': 'Assembly_Pggng_Strctr_7_seq',
        'suffix': ''
    },
    '8': {
        'join_char': '-',
        'prefix': 'Fttng-Assmbly',
        'sequence': 'Assembly_Fttng_Assmbly_8_seq',
        'suffix': ''
    },
    '9': {
        'join_char': '-',
        'prefix': 'Pmp-Sttn',
        'sequence': 'Assembly_Pmp_Sttn_9_seq',
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