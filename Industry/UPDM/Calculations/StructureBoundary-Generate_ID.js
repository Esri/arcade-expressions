// Assigned To: StructureBoundary
// Type: Calculation
// Name: Generate IDs for StructureBoundary - Pipeline
// Description: Generate IDs for StructureBoundary using database sequences
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
        'prefix': 'Ppln-Sttn-Strctr',
        'sequence': 'StructureBoundary_Ppln_Sttn_Strctr_1_seq',
        'suffix': ''
    },
    '2': {
        'join_char': '-',
        'prefix': 'Ppln-Vlt-Bndry',
        'sequence': 'StructureBoundary_Ppln_Vlt_Bndry_2_seq',
        'suffix': ''
    },
    '3': {
        'join_char': '-',
        'prefix': 'Ppln-Prcssng-Fclty',
        'sequence': 'StructureBoundary_Ppln_Prcssng_Fclty_3_seq',
        'suffix': ''
    }
};
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
if (TypeOf(id_formats) != 'Dictionary' || HasKey(id_formats, Text($feature.assetgroup)) == false) {
    return assigned_to_field;
}

var id_format = id_formats[Text($feature.assetgroup)];
// Remove any empty values
var id_parts = remove_empty([id_format['prefix'], NextSequenceValue(id_format['sequence']), id_format['suffix']])
return Concatenate(id_parts, id_format['join_char'])