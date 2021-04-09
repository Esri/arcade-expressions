// This rule will calculate the left to address using the left from address, the length of the road and an interval or distance between unique addresses

// Specify the interval or distance between unique addresses
var addressIntervalDistance = 10;

// Specify the unity of measure. Valid options are feet, meters, yards, miles, kilometers
var unit = "feet";
 
// If the Left From Address is empty or the Left To Address is not empty return the Left To Address 
var fromLeft = $feature.fromleft;
var toLeft = $feature.toleft;
if (IsEmpty(fromLeft) || !IsEmpty(toLeft)) return toLeft;

// Return the new Left To Address
var featureLength = Length($feature, unit);
return Ceil(featureLength/addressIntervalDistance) * 2 + fromLeft;
