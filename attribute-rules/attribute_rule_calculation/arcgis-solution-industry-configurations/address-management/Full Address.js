// This will calculate the full address for a site address point by concatenating several other field values 

// Specify the fields to concatenate
var values = [$feature.preaddrnum, $feature.addrnum, $feature.addrnumsuf, $feature.fullname, $feature.unittype, $feature.unitid, $feature.altunittype, $feature.altunitid, $feature.secondaltunittype, $feature.secondaltunitid, $feature.thirdaltunittype, $feature.thirdaltunitid, $feature.fourthaltunittype, $feature.fourthaltunitid];

var combined_value = [];
// Loop through the field values and test if they are null or empty strings
// If they are not null or empty add them to an array
for (var i in values) {
    var value = values[i];
    if (IsEmpty(value)) continue;
    combined_value[Count(combined_value)] = value
}

// Return the field values concatenated with a space between
return Concatenate(combined_value, " ");