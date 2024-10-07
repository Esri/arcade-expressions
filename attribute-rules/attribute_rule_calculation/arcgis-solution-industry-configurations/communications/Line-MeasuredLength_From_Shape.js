// Assigned To: CommunicationsLine
// Type: Calculation
// Name: Line - MeasuredLength From Shape
// Description: Calculate length of line in specified units
// Subtypes: All
// Field: measuredlength
// Trigger: Insert, Update
// Exclude From Client: False
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - StructureLine - MeasuredLength From Shape


// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// Field in the data model used to store measured length
// ** Implementation Note: This value does not need to change if using the industry data model
var assigned_to_field = $feature.measuredlength;

// The unit of measure used to calculate length
// ** Implementation Note: Options for Unit of Measure: https://developers.arcgis.com/arcade/function-reference/geometry_functions/#units-reference
var unit_of_measure = 'feet';

// ************* End User Variables Section *************

// Only calculate if field is null or zero
if (IsEmpty(assigned_to_field) || assigned_to_field == 0) {
    return Length(Geometry($feature), unit_of_measure);
}

return assigned_to_field;
