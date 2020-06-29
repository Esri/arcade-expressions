// Assigned To: CommunicationsAssembly
// Type: Calculation
// Name: Create Strand Ends in Terminators
// Description: Rule generates strand end port devices inside Terminator Devices based on field on the feature
// Subtypes: All
// Field: TerminatorCount
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
var assigned_to_field = $feature.TerminatorCount;
// Instead of assigning the rule at the subtype, it is assigned to all subtypes and returns if not valid

// Limit the rule to valid subtypes
var valid_asset_groups = [1, 2, 3, 5, 6, 7];
var valid_asset_types = [1];
if (count(valid_asset_groups) > 0 && indexof(valid_asset_groups, $feature.assetgroup) == -1) {
    return assigned_to_field;
}
if (count(valid_asset_types) > 0 && indexof(valid_asset_types, $feature.assettype) == -1) {
    return assigned_to_field;
}

var point_spacing = DefaultValue($feature.terminatorspacing, .1);
var point_count = DefaultValue($feature.terminatorcount, 0);
var template_rotation = DefaultValue($feature.templaterotation, 0);
var offset_distance = DefaultValue($feature.terminatoroffset, 0);


var device_class = "CommunicationsDevice";
var port_ag = 8;
var port_at = 144;

// ************* End User Variables Section *************

// *************       Functions            *************

function offset_line(point_geo, point_spacing, point_count, offset_distance, line_rotation) {

    // Store the geometry of the point.  Offset the y and Z to get a vertical line that represents the upper coordinate
    var point_y = point_geo.Y;
    point_y = point_y - (floor(point_count / 2) * point_spacing);
    var point_z = point_geo.Z;
    point_z = point_z - (floor(point_count / 2) * point_spacing);
    var point_x = point_geo.X;

    // Loop over the point count and add a vertex using the spacing
    var vertices = [];
    for (var i = 0; i < point_count; i++) {
        vertices[i] = [point_x, point_y, point_z];
        point_y = point_y + point_spacing;
        point_z = point_z + point_spacing;
    }
    // Create a new line, rotate it based on user field and offset to spread it from the placed point
    var new_line = Polyline({"paths": [vertices], "spatialReference": {"wkid": point_geo.spatialReference.wkid}});
    new_line = offset(rotate(new_line, 90 - line_rotation), offset_distance);
    // Get the first path on the new line
    return new_line['paths'][0];
}
// ************* End Functions Section *****************

if (point_count <= 0) {
    return {'ErrorMessage': 'Terminator count is required'};
}
var assemb_geo = Geometry($feature);
var first_path = offset_line(assemb_geo, point_spacing, point_count, offset_distance, template_rotation);
// Loop over the path and construct a point at each vertex and return as a strand end
var new_strand_ends = [];

var point_x;
var point_y;
var point_z;
for (var i in first_path) {

    point_x = first_path[i].x;
    point_y = first_path[i].y;
    point_z = first_path[i].z;
    new_strand_ends[i] = {
        'attributes': {
            'assetgroup': port_ag,
            'assettype': port_at
        },
        'geometry': Point({
            "x": point_x,
            "y": point_y,
            "z": point_z,
            "spatialReference": {"wkid": assemb_geo.spatialReference.wkid}
        }),
        'associationType': 'content'
    };
}

var edit_payload = [{
    'className': device_class,
    'adds': new_strand_ends
}];
return {"result": assigned_to_field, "edit": edit_payload};