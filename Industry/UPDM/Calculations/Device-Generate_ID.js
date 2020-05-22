// Assigned To: PipelineDevice
// Type: Calculation
// Name: Generate IDs for Pipeline Device
// Description: Generate IDs for PipelineDevice using database sequences
// Subtypes: All
// Field: assetid
// Execute: Insert
// Exclude From Client: True

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

var assigned_to_field = $feature.assetid;

// Define the leading text, the trailing text and the delimiter for the ID, this dict is keyed by Asset Group as text
var id_formats = {
    '1': {
        'join_char': '-',
        'prefix': 'Excss-Flw-Vlv',
        'sequence': 'Device_Excss_Flw_Vlv_1_seq',
        'suffix': ''
    },
    '10': {
        'join_char': '-',
        'prefix': 'Cmprssr',
        'sequence': 'Device_Cmprssr_10_seq',
        'suffix': ''
    },
    '11': {
        'join_char': '-',
        'prefix': 'Wllhd-Src-Flng',
        'sequence': 'Device_Wllhd_Src_Flng_11_seq',
        'suffix': ''
    },
    '12': {
        'join_char': '-',
        'prefix': 'Cntrllbl-T',
        'sequence': 'Device_Cntrllbl_T_12_seq',
        'suffix': ''
    },
    '13': {
        'join_char': '-',
        'prefix': 'Shrt-Stp',
        'sequence': 'Device_Shrt_Stp_13_seq',
        'suffix': ''
    },
    '18': {
        'join_char': '-',
        'prefix': 'Pmp',
        'sequence': 'Device_Pmp_18_seq',
        'suffix': ''
    },
    '19': {
        'join_char': '-',
        'prefix': 'Rgltr',
        'sequence': 'Device_Rgltr_19_seq',
        'suffix': ''
    },
    '2': {
        'join_char': '-',
        'prefix': 'Mtr',
        'sequence': 'Device_Mtr_2_seq',
        'suffix': ''
    },
    '20': {
        'join_char': '-',
        'prefix': 'Scrbbr',
        'sequence': 'Device_Scrbbr_20_seq',
        'suffix': ''
    },
    '3': {
        'join_char': '-',
        'prefix': 'Cntrllbl-Vlv',
        'sequence': 'Device_Cntrllbl_Vlv_3_seq',
        'suffix': ''
    },
    '4': {
        'join_char': '-',
        'prefix': 'Flw-Vlv',
        'sequence': 'Device_Flw_Vlv_4_seq',
        'suffix': ''
    },
    '5': {
        'join_char': '-',
        'prefix': 'Rlf-Vlv',
        'sequence': 'Device_Rlf_Vlv_5_seq',
        'suffix': ''
    },
    '50': {
        'join_char': '-',
        'prefix': 'And',
        'sequence': 'Device_And_50_seq',
        'suffix': ''
    },
    '51': {
        'join_char': '-',
        'prefix': 'Rctfr',
        'sequence': 'Device_Rctfr_51_seq',
        'suffix': ''
    },
    '52': {
        'join_char': '-',
        'prefix': 'Tst-Pnt',
        'sequence': 'Device_Tst_Pnt_52_seq',
        'suffix': ''
    },
    '6': {
        'join_char': '-',
        'prefix': 'Strnr',
        'sequence': 'Device_Strnr_6_seq',
        'suffix': ''
    },
    '8': {
        'join_char': '-',
        'prefix': 'Prssr-Mntrng-Dvc',
        'sequence': 'Device_Prssr_Mntrng_Dvc_8_seq',
        'suffix': ''
    },
    '9': {
        'join_char': '-',
        'prefix': 'Lmp',
        'sequence': 'Device_Lmp_9_seq',
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