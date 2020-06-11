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

// Define the leading text, the trailing text and the delimiter for the ID, this function requires the keyed passed in
// NextSequenceValue requires a string literal for copy and paste, although it supports a variable, it is recommended
// to not use one
function get_id(selector_value) {
    var id_format = {}
    var seq_val = null;
    var selector_value_txt = Text(selector_value);
    if (selector_value_txt == '1') {
            id_format = {
                'prefix': "Ppln-Sttn-Strctr",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('StructureBoundary_Ppln_Sttn_Strctr_1_seq');
        }else if (selector_value_txt == '2') {
            id_format = {
                'prefix': "Ppln-Vlt-Bndry",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('StructureBoundary_Ppln_Vlt_Bndry_2_seq');
        }else if (selector_value_txt == '3') {
            id_format = {
                'prefix': "Ppln-Prcssng-Fclty",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('StructureBoundary_Ppln_Prcssng_Fclty_3_seq');
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

