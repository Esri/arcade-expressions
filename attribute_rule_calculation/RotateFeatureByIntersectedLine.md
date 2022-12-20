# Rotate Feature by Intersected Line

This calculation attribute rule rotates a feature by angle of an intersected line

## Use cases

Rotate a valve to match the direction of a line.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Update

## Expression Template

This Arcade expression will rotates a feature by angle of an intersected line

```js
// Find the first intersecting line from the intersecting class
var lineClass = FeatureSetByName($datastore, "WaterLine", ["objectid"], true)
var line = First(Intersects(lineClass, $feature))

// If no feature was found, return the original value
if (line == null)
   return $feature.rotation

// Buffer the point by a small amount to extract the segment
var search = Extent(Buffer($feature, .01, "meter"))
var segment = Clip(line, search)["paths"][0]

// Start and end points of the line
var x1 = segment[0]['x']
var y1 = segment[0]['y']
var x2 = segment[-1]['x']
var y2 = segment[-1]['y']

// Arithmetic angle (counter-clockwise from + X axis)
var degrees = Atan2(y2 - y1, x2 - x1) * 180 / PI;
return (degrees + 360) % 360;
```

Using the angle function
```js
// Find the first intersecting line from the intersecting class
var lineClass = FeatureSetByName($datastore, "WaterLine", ["objectid"], true)
var line = First(Intersects(lineClass, $feature))

// If no feature was found, return the original value
if (line == null)
   return $feature.rotation

// Buffer the point by a small amount to extract the segment
var search = Extent(Buffer($feature, .01, "meter"))
var segment = Clip(line, search)["paths"][0]

// Get angle of line using the start and end vertex
return Angle(segment[0], segment[-1])  
```

More complicated version that uses the number of lines to calculate the angle.  An example with using this rule is included in the [Example](./RotateFeatureByIntersectedLine.zip).  To demonstrate, add the RotationTest layer to an ArcGIS Pro project and create new lines and point features.
```js
// This calculation attribute rule intersects a line layer and based on the number of
// intersected features, calculates the angle for the point

// Assigned To: Point
// Type: Calculation
// Name: Rotate Point on Line
// Description: Calculate the rotation based on angle of the intersection line(s)
// Subtypes: All
// Field: symbolrotation
// Trigger: Insert, Update
// Exclude From Client: False
// Disable: False
// Is Editable: True

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

Expects($feature, 'symbolrotation');
// Assigned to field for the rule
var assigned_to_field = $feature.symbolrotation;

// Set to true if the rotation setting is set to geographic in the layer properties
var geographic_rotation = false;

// Set the counter clockwise spin angle used for the symbol in the symbology options
var symbol_flip_angle = 0;

// A number value to orient the line in case of a intersection between two lines, this can be omitted by specifying
// null of empty string.
// If a value is set, make sure to include it in the featuresetbyname list below
var number_field = 'diameter';

// Create feature set to the intersecting classs using the GDB Name
// ** Implementation Note: If the Utility Network domain was changed, this variable would have to be adjusted
var intersecting_featsets = [
    FeatureSetByName($datastore, "lines", ['objectid', 'diameter'], true),
    FeatureSetByName($datastore, "lines2", ['objectid'], true)
];

// ************* End User Variables Section *************

// Return if a value is already set, to recalculate an angle, the field must be set to null
if (IsEmpty(assigned_to_field) == false) {
    return assigned_to_field;
}

// The tolerance between lines to determine if they follow the same plane
var diff_tol = 5;

// Variable to store all found angles
var angles = [];

// Store the features geometry
var feature_geometry = Geometry($feature);
// Loop over all intersecting lines and find their angles
var angle_type;
var angle_value;

// Loop over all feature sets
for (var i in intersecting_featsets) {
    var intersecting_featset = intersecting_featsets[i];
    // Find the intersecting lines
    var lines = Intersects(intersecting_featset, $feature);

    for (var line in lines) {
        // Buffer and create an extent of the point by a small amount to extract the segment
        var clip_area = Extent(Buffer($feature, .01, "meter"));
        // Clip the line by the extend and get the first line segment
        var segment = Clip(line, clip_area)["paths"][0];
        // The features location is on the start of the line, get the angle from the feature to the end vertex
        if (Equals(segment[0], feature_geometry)) {
            angle_type = 'from';
            angle_value = Round(Angle(feature_geometry, segment[-1]), 0);
        }
        // The features location is on the end of the line, create a new segment from the feature to the start vertex
        else if (Equals(segment[-1], feature_geometry)) {
            angle_type = 'to';
            angle_value = Round(Angle(feature_geometry, segment[0]), 0);
        }
        // The features location is midspan of the segment, use the angle of the segment
        else {
            angle_type = 'mid';
            angle_value = Round(Angle(segment[0], segment[-1]), 0);
        }
        if (geographic_rotation == true) {
            // Convert Arithmetic to Geographic
            angle_value = (450 - angle_value) % 360;
        }
        // Add 180 to match 0 rotation in the TOC
        // Add user specified spin angle if their symbol is rotated
        angle_value = (angle_value + 180 + symbol_flip_angle) % 360;

        // Get the numerical field from the feature
        var num_value = IIf(HasKey(line, number_field), line[number_field], null);
        Push(angles, {'angle': angle_value, 'type': angle_type, 'number_value': num_value});
    }
}

// If only one angle, return that value
var angle_count = Count(angles);
if (angle_count == 0) {
    //If no lines intersect, return the original value
    return assigned_to_field;
} else if (angle_count == 1) {
    // If the point is midspan, flip to match symbol as it if was on the end point
    if (angles[0]['type'] == 'mid') {
        return (angles[0]['angle'] + 180) % 360;
    }
    return angles[0]['angle'];
} else if (angle_count == 2) {
    // If the feature is midpan of the first line, return the angle of the second line
    if (angles[0]['type'] == 'mid')
        return angles[1]['angle'];
    // If the feature is midpan of the second line, return the angle of the first line
    else if (angles[1]['type'] == 'mid')
        return angles[0]['angle'];
    // If the feature is at the end/start point of both lines, return the angle of the first line
    else if (
        (angles[0]['type'] == 'to' && angles[1]['type'] == 'to') ||
        (angles[0]['type'] == 'from' && angles[1]['type'] == 'from')
    ) {
        // If the number values are the same, or not specified
        if (angles[0]['number_value'] == angles[1]['number_value']) {
            return angles[0]['angle'];
        } else if (angles[0]['number_value'] > angles[1]['number_value']) {
            return angles[0]['angle'];
        } else if (angles[0]['number_value'] < angles[1]['number_value']) {
            return angles[1]['angle'];
        }
        return angles[0]['angle'];

    }
    // If the feature is at the start point of the first line and end of the second line, return the second line
    else if (angles[0]['type'] == 'from' && angles[1]['type'] == 'to') {
        // If the number values are the same, or not specified
        if (angles[0]['number_value'] == angles[1]['number_value']) {
            return angles[1]['angle'];
        } else if (angles[0]['number_value'] > angles[1]['number_value']) {
            return angles[0]['angle'];
        } else if (angles[0]['number_value'] < angles[1]['number_value']) {
            return angles[1]['angle'];
        }
        return angles[1]['angle'];

    }
    // If the feature is at the start point of the second line and start of the second line, return the first line
    else if (angles[0]['type'] == 'to' && angles[1]['type'] == 'from') {
        // If the number values are the same, or not specified
        if (angles[0]['number_value'] == angles[1]['number_value']) {
            return angles[0]['angle'];
        } else if (angles[0]['number_value'] > angles[1]['number_value']) {
            return angles[0]['angle'];
        } else if (angles[0]['number_value'] < angles[1]['number_value']) {
            return angles[1]['angle'];
        }
        return angles[0]['angle'];
    }
    //Catch anything no handled
    return angles[0]['angle'];

} else if (angle_count == 3) {
    // Flatten the angles to ignore direction
    var flat_angle1 = angles[0]['angle'] % 180;
    var flat_angle2 = angles[1]['angle'] % 180;
    var flat_angle3 = angles[2]['angle'] % 180;
    // Create differences between angles
    var angle_dif_a = Abs(flat_angle1 - flat_angle2);
    var angle_dif_b = Abs(flat_angle1 - flat_angle3);
    var angle_dif_c = Abs(flat_angle2 - flat_angle3);
    // If difference between line 1 and 2 is below the tolerance, meaning the lines follow the same plane, return the
    // third line
    if (angle_dif_a <= (diff_tol * 2) || angle_dif_a >= (180 - (diff_tol * 2))) {
        return angles[2]['angle'];
    }
        // If difference between line 1 and 3 is below the tolerance, meaning the lines follow the same plane, return the
    // second line
    else if (angle_dif_b <= (diff_tol * 2) || angle_dif_b >= (180 - (diff_tol * 2))) {
        return angles[1]['angle'];

    }
        // If difference between line 2 and 3 is below the tolerance, meaning the lines follow the same plane, return the
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

```