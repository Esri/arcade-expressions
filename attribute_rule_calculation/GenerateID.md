# Generate Unique ID

This calculation attribute rule uses a database sequence to generate a new ID for a feature.

## Use cases

To provide a database generated ID when a feature is created

## Workflow

Using ArcGIS Pro, use the Create Database Sequence geoprocessing tool to create a database sequence to provide the auto incremented number for this rule.  Repeat this process if unique sequences are need for different feature classes or subtypes.  

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert
  - **Exclude from application client:** Checked


## Expression Template

This Arcade expression will return the ID if already set or generate a new ID based on a database sequence

```js
//Define the leading text, the trailing text and the delimiter for the ID
prefix = "ABC"
join_char = "-"
suffix = "XYZ"

//Ensure the ID is not already set, if it is, return the original id
if (IsEmpty($feature.assetid)) {
   // If you do not want to use a prefix, or suffix, remove it from the list
   return Concatenate([prefix, NextSequenceValue("GDB_SEQUENCE_NAME"), suffix], join_char)
}
else {
   return $feature.assetid
}
```

A version for a subtype feature class that can be assigned to all and an dict with values per subtype
```js
// Assigned To: Device
// Name: Generate IDs for <FC>
// Description: Generate IDs for <> using database sequences
// Subtypes: All
// Field: assetid
// Execute: Insert

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

var assigned_to_field = $feature.assetid;

//Define the leading text, the trailing text and the delimiter for the ID, this dict is keyed by Asset Group as text
var id_formats = {
    '1': {
        'sequence': '',
        'prefix': "ABC",
        'join_char': '-',
        'suffix': 'XYZ'
    }
}
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
if (TypeOf(id_formats) != 'Dictionary' || HasKey(id_formats, Text($feature.assetgroup))== false) {
    return assigned_to_field;
}

var id_format = id_formats[Text($feature.assetgroup)];
// Remove any empty values
var id_parts = remove_empty([id_format['prefix'], NextSequenceValue(id_format['sequence']), id_format['suffix']])
return Concatenate(id_parts, id_format['join_char'])


```