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
// Define the leading text, the trailing text and the delimiter for the ID, this function requires the keyed passed in
// NextSequenceValue requires a string literal for copy and paste, although it supports a variable, it is recommended
// to not use one
function get_id(selector_value) {
    var id_format = {}
    var seq_val = null;
    if (Text(selector_value) == '1') {
            id_format = {
                'prefix': "Ppln-Mfflr",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('StructureJunction_Ppln_Mfflr_1_seq');
        }else if (Text(selector_value) == '2') {
            id_format = {
                'prefix': "Ppln-Anchr",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('StructureJunction_Ppln_Anchr_2_seq');
        }else if (Text(selector_value) == '3') {
            id_format = {
                'prefix': "Ppln-Pp-Spprt",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('StructureJunction_Ppln_Pp_Spprt_3_seq');
        }else if (Text(selector_value) == '4') {
            id_format = {
                'prefix': "Ppln-Pp-Hngr",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('StructureJunction_Ppln_Pp_Hngr_4_seq');
        }else if (Text(selector_value) == '5') {
            id_format = {
                'prefix': "Ppln-End-Cnnctn",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('StructureJunction_Ppln_End_Cnnctn_5_seq');
        }else if (Text(selector_value) == '501') {
            id_format = {
                'prefix': "Pp-Accss-Pnt",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('StructureJunction_Pp_Accss_Pnt_501_seq');
        }else if (Text(selector_value) == '7') {
            id_format = {
                'prefix': "Ppln-Vlv-Bx",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('StructureJunction_Ppln_Vlv_Bx_7_seq');
        }else if (Text(selector_value) == '8') {
            id_format = {
                'prefix': "Ppln-Slv",
                'join_char': '-',
                'suffix': ''
            }
            seq_val = NextSequenceValue('StructureJunction_Ppln_Slv_8_seq');
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
