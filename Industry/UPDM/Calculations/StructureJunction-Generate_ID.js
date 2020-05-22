// Assigned To: StructureJunction
// Type: Calculation
// Name: Generate IDs for StructureJunction - Pipeline
// Description: Generate IDs for StructureJunction using database sequences
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
        'prefix': 'Ppln-Mfflr',
        'sequence': 'StructureJunction_Ppln_Mfflr_1_seq',
        'suffix': ''
    },
    '2': {
        'join_char': '-',
        'prefix': 'Ppln-Anchr',
        'sequence': 'StructureJunction_Ppln_Anchr_2_seq',
        'suffix': ''
    },
    '3': {
        'join_char': '-',
        'prefix': 'Ppln-Pp-Spprt',
        'sequence': 'StructureJunction_Ppln_Pp_Spprt_3_seq',
        'suffix': ''
    },
    '4': {
        'join_char': '-',
        'prefix': 'Ppln-Pp-Hngr',
        'sequence': 'StructureJunction_Ppln_Pp_Hngr_4_seq',
        'suffix': ''
    },
    '5': {
        'join_char': '-',
        'prefix': 'Ppln-End-Cnnctn',
        'sequence': 'StructureJunction_Ppln_End_Cnnctn_5_seq',
        'suffix': ''
    },
    '501': {
        'join_char': '-',
        'prefix': 'Pp-Accss-Pnt',
        'sequence': 'StructureJunction_Pp_Accss_Pnt_501_seq',
        'suffix': ''
    },
    '7': {
        'join_char': '-',
        'prefix': 'Ppln-Vlv-Bx',
        'sequence': 'StructureJunction_Ppln_Vlv_Bx_7_seq',
        'suffix': ''
    },
    '8': {
        'join_char': '-',
        'prefix': 'Ppln-Slv',
        'sequence': 'StructureJunction_Ppln_Slv_8_seq',
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