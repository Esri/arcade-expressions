// Assigned To: StructureLine
// Name: Get measured length
// Description: Calculate length of line in specified units
// Subtypes: All
// Field: measuredlength
// Execute: Insert, Update

// ******************************************
// This section has the functions and variables that need to be adjusted based on your implementation
var assigned_to_field = $feature.measuredlength;
var shape_length = $feature.SHAPE_Length;

// ************* End Section ****************


// Only calculate if field is null or zero
if (IsEmpty(assigned_to_field) || assigned_to_field == 0) {
    return shape_length;
}

return assigned_to_field;
