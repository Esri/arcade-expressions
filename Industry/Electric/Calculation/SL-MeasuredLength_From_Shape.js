// Assigned To: StructureLine
// Type: Calculation
// Name: MeasuredLength From Shape-SL
// Description: Calculate length of line in specified units
// Subtypes: Wire Casing, Linear Marker, Wire Aerial Support, Wire Trench, Electric High Voltage Conduit, Electric Low Voltage Conduit, Electric Medium Voltage Conduit, Connector Line, Communications Conduit, Access Tunnel,Electric High Voltage Cable Pathway, Electric Medium Voltage Cable Pathway, Electric Low Voltage Cable Pathway, Wire Microduct Pathway,Ground
// Field: measuredlength
// Trigger: Insert, Update
// Exclude From Client: False
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
Expects($feature, 'measuredlength');
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
