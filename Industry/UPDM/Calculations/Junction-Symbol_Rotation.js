// Assigned To: PipelineJunction
// Type: Calculation
// Name: Rotate Pipeline Devices to match intersecting Line
// Description: This calculation attribute rule intersects a line layer and based on the number of intersected features, calculates the angle for the point
// Subtypes: All
// Field: symbolrotation
// Execute: Insert, Update

// *************       User Variables       *************

// Set to true if the rotation setting is set to geographic in the layer properties
var geographic_rotation = false;
// Set the counter clockwise spin angle used for the symbol in the symbology options
var symbol_flip_angle = 0
var assigned_to_field = $feature.symbolrotation;

// ************* End User Variables Section ************

// Return if a value is already set, to recalculate an angle, the field must be set to null
if (IsEmpty(assigned_to_field) == false) {
    return assigned_to_field;
}

// Create a feature set to the line layer
var lineClass = FeatureSetByName($datastore, "PipelineLine", ["objectid"], true);
// Find the intersecting lines
var lines = Intersects(lineClass, $feature);
//If no lines intersect, return the original value
if (Count(lines) == 0) {
    return assigned_to_field;
}
var diff_tol = 5;
// Variable to store all found angles
var angles = [];
// Store the features geometry
var feature_geometry = Geometry($feature);
// Loop over all intersecting lines and find their angles
var angle_type;
var angle_value;
for (var line in lines) {
    // Buffer and create an extenf of the point by a small amount to extract the segment
    var clip_area = Extent(Buffer($feature, .01, "meter"));
    // Clip the line by the extend and get the first line segment
    var segment = Clip(line, clip_area)["paths"][0];
    // The features location is on the start of the line, get the angle from the feature to the end vertex
    if (Equals(segment[0], feature_geometry)) {
        angle_type = 'from'
        angle_value = Round(Angle(feature_geometry, segment[-1]), 0)
    }
    // The features location is on the end of the line, create a new segment from the feature to the start vertex
    else if (Equals(segment[-1], feature_geometry)) {
        angle_type = 'to'
        angle_value = Round(Angle(feature_geometry, segment[0]), 0)
    }
    // The features location is midspan of the segment, use the angle of the segment
    else {
        angle_type = 'mid'
        angle_value = Round(Angle(segment[0], segment[-1]), 0)
    }
    if (geographic_rotation == true) {
        // Convert Arithmetic to Geographic
        angle_value = (450 - angle_value) % 360;
    }
    // Add 180 to match 0 rotation in the TOC
    // Add user specified spin angle if their symbol is rotated
    angle_value = (angle_value + 180 + symbol_flip_angle) % 360;
    angles[Count(angles)] = {'angle': angle_value, 'type': angle_type};
}

// If only one angle, return that value
if (Count(angles) == 1) {
    // If the point is midspan, flip to match symbol as it if was on the end point
    if (angles[0]['type'] == 'mid')
    {
        return (angles[0]['angle'] + 180) % 360;
    }
    return angles[0]['angle'];
} else if (Count(angles) == 2) {
    // If the feature is midpan of the first line, return the angle of the second line
    if (angles[0]['type'] == 'mid')
        return angles[1]['angle'];
    // If the feature is midpan of the second line, return the angle of the first line
    else if (angles[1]['type'] == 'mid')
        return angles[0]['angle'];
    // If the feature is at the end point of both lines, return the angle of the first line
    else if (angles[0]['type'] == 'to' && angles[1]['type'] == 'to') {
        return angles[0]['angle'];
    }
    // If the feature is at the start point of both lines, return the angle of the first line
    else if (angles[0]['type'] == 'from' && angles[1]['type'] == 'from') {
        return angles[0]['angle'];
    }
    // If the feature is at the start point of the first line and end of the second line, return the second line
    else if (angles[0]['type'] == 'from') {
        return angles[1]['angle'];
    }
    // If the feature is at the start point of the second line and start of the second line, return the first line
    return angles[0]['angle'];

} else if (Count(angles) == 3) {
    // Flatten the angles to ignore direction
    var flat_angle1 = angles[0]['angle'] % 180;
    var flat_angle2 = angles[1]['angle'] % 180;
    var flat_angle3 = angles[2]['angle'] % 180;
    // Create differences between angles
    var angle_dif_a = Abs(flat_angle1 - flat_angle2);
    var angle_dif_b = Abs(flat_angle1 - flat_angle3);
    var angle_dif_c = Abs(flat_angle2 - flat_angle3);
    // If difference between line 1 and 2 is below the tolerance, meaning the lines follow the ame plane, return the
    // third line
    if (angle_dif_a <= (diff_tol * 2) || angle_dif_a >= (180 - (diff_tol * 2))) {
        return angles[2]['angle'];
    }
    // If difference between line 1 and 3 is below the tolerance, meaning the lines follow the ame plane, return the
    // second line
    else if (angle_dif_b <= (diff_tol * 2) || angle_dif_b >= (180 - (diff_tol * 2))) {
        return angles[1]['angle'];

    }
    // If difference between line 2 and 3 is below the tolerance, meaning the lines follow the ame plane, return the
    // first line
    else if (angle_dif_c <= (diff_tol * 2) || angle_dif_c >= (180 - (diff_tol * 2))) {
        return angles[0]['angle'];
    }
    // Return first if not covered above
    return angles[0]['angle'];
}
// All other cases, the first feature is returned
else {
    return angles[0]['angle'];
}