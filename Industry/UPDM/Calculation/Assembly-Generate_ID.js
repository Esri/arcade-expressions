// Assigned To: PipelineAssembly
// Type: Calculation
// Name: Assembly - Generate ID
// Description: Generate IDs for PipelineAssembly using database sequences
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
            'prefix': "Cmprssr-Sttn",
            'join_char': '-',
            'suffix': ''
        }
        seq_val = NextSequenceValue('Assembly_Cmprssr_Sttn_1_seq');
    } else if (selector_value_txt == '10') {
        id_format = {
            'prefix': "Vlv-Assmbly",
            'join_char': '-',
            'suffix': ''
        }
        seq_val = NextSequenceValue('Assembly_Vlv_Assmbly_10_seq');
    } else if (selector_value_txt == '2') {
        id_format = {
            'prefix': "Mtr-Sttng",
            'join_char': '-',
            'suffix': ''
        }
        seq_val = NextSequenceValue('Assembly_Mtr_Sttng_2_seq');
    } else if (selector_value_txt == '3') {
        id_format = {
            'prefix': "Rgltr-Sttn",
            'join_char': '-',
            'suffix': ''
        }
        seq_val = NextSequenceValue('Assembly_Rgltr_Sttn_3_seq');
    } else if (selector_value_txt == '4') {
        id_format = {
            'prefix': "Rrl-Tp",
            'join_char': '-',
            'suffix': ''
        }
        seq_val = NextSequenceValue('Assembly_Rrl_Tp_4_seq');
    } else if (selector_value_txt == '5') {
        id_format = {
            'prefix': "Twn-Brdr-Sttn",
            'join_char': '-',
            'suffix': ''
        }
        seq_val = NextSequenceValue('Assembly_Twn_Brdr_Sttn_5_seq');
    } else if (selector_value_txt == '6') {
        id_format = {
            'prefix': "Wllhd",
            'join_char': '-',
            'suffix': ''
        }
        seq_val = NextSequenceValue('Assembly_Wllhd_6_seq');
    } else if (selector_value_txt == '7') {
        id_format = {
            'prefix': "Pggng-Strctr",
            'join_char': '-',
            'suffix': ''
        }
        seq_val = NextSequenceValue('Assembly_Pggng_Strctr_7_seq');
    } else if (selector_value_txt == '8') {
        id_format = {
            'prefix': "Fttng-Assmbly",
            'join_char': '-',
            'suffix': ''
        }
        seq_val = NextSequenceValue('Assembly_Fttng_Assmbly_8_seq');
    } else if (selector_value_txt == '9') {
        id_format = {
            'prefix': "Pmp-Sttn",
            'join_char': '-',
            'suffix': ''
        }
        seq_val = NextSequenceValue('Assembly_Pmp_Sttn_9_seq');
    } else {
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

