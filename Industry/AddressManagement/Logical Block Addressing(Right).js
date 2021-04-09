// This rule will calculate the right to address using the right from address, the length of the road and an interval or distance between unique addresses

// Specify the interval or distance between unique addresses
var addressIntervalDistance = 10;

// Specify the unity of measure. Valid options are feet, meters, yards, miles, kilometers
var unit = "feet";
 
// If the Right From Address is empty or the Right To Address is not empty return the Right To Address 
var fromRight = $feature.fromRight;
var toRight = $feature.toRight;
if (IsEmpty(fromRight) || !IsEmpty(toRight)) return toRight;

// Return the new Right To Address
var featureLength = Length($feature, unit);
return Ceil(featureLength/addressIntervalDistance) * 2 + fromRight;
