// Assigned To: CommunicationsLine
// Type: Calculation
// Name: Contain a Communications Line in Structure Line
// Description: Rule searches for structure line containers with a certain distance to contain the cable in it.
// Subtypes: All
// Field: assetid
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
var assigned_to_value = $feature.assetid;
// Limit the rule to valid subtypes
var valid_asset_groups = [1, 3, 4, 5, 6, 7, 9];
if (IndexOf(valid_asset_groups, $feature.assetgroup) == -1) {
    return assigned_to_value;
}

var structure_Line_class = 'StructureLine';
// A cable can be in a duct, aerial span, lashing guy, conduit, tunnel
var filter_structure_lines_sql = "AssetGroup in (101, 103, 104, 109, 112) and AssetType in (41, 101, 125, 127, 121, 221)";
// Set the container asset types that can only contain one child item, a duct and conduit can only have one cable
var restrict_to_one_content = [41, 121];
// List the asset types that a cable should be contained in first, this is conduit, duct and lashing guy.
var contain_cable_in_first = [41, 121, 127];
var feature_set = FeatureSetByName($datastore, 'StructureLine', ["OBJECTID", "GLOBALID", "ASSOCIATIONSTATUS", "AssetGroup", "AssetType"], true);
var search_distance = DefaultValue($feature.searchdistance, 75);
// Options for Unit of Measure: https://developers.arcgis.com/arcade/function-reference/geometry_functions/#units-reference
var search_unit = 9002;
var valid_asset_types = [];

// ************* End User Variables Section *************

// *************       Functions            *************

function sortCandidates(a, b) {
    if (IndexOf(contain_cable_in_first, a['at']) == -1 && IndexOf(contain_cable_in_first, b['at']) == -1) {
        if (a['distance'] < b['distance'])
            return -1;
        if (a['distance'] > b['distance'])
            return 1;
        return 0
    } else if (IndexOf(contain_cable_in_first, a['at']) > -1 && IndexOf(contain_cable_in_first, b['at']) > -1) {
        if (a['distance'] < b['distance'])
            return -1;
        if (a['distance'] > b['distance'])
            return 1;
        return 0;
    } else if (IndexOf(contain_cable_in_first, a['at']) > -1) {

        return -1;
    }
    return 1;
}

// Function to check if a bit is in an int value
function has_bit(num, test_value) {
    // num = number to test if it contains a bit
    // test_value = the bit value to test for
    // determines if num has the test_value bit set
    // Equivalent to num AND test_value == test_value

    // first we need to determine the bit position of test_value
    var bit_pos = -1;
    for (var i = 0; i < 64; i++) {
        // equivalent to test_value >> 1
        var test_value = Floor(test_value / 2);
        bit_pos++;
        if (test_value == 0)
            break;
    }
    // now that we know the bit position, we shift the bits of
    // num until we get to the bit we care about
    var num
    for (var i = 1; i <= bit_pos; i++) {
        num = Floor(num / 2);
    }

    if (num % 2 == 0) {
        return false;
    } else {
        return true;
    }
}

// ************* End Functions Section ******************

if (Count(valid_asset_types) > 0 && indexof(valid_asset_types, $feature.assettype) == -1) {
    return assigned_to_value;
}
// Buffer the features to find features within a certain distance
var closest_features = Intersects(feature_set, Buffer(Geometry($feature), search_distance, search_unit));
// Filter the closest results based on the sql to get assets of a certain type
var filtered_features = Filter(closest_features, filter_structure_lines_sql);
if (Count(filtered_features) == 0) {
    return assigned_to_value;
}
var line_geo = Geometry($feature);
var line_vertices = line_geo['paths'][0];
var vertex_count = Count(line_vertices);

var structure_containers = [];
var added_to = [];
for (var vert_idx = 0; vert_idx < vertex_count - 1; vert_idx++) {
    var structure_candidates = [];
    // Check to see if point is between vertexs
    var from_point = line_vertices[vert_idx];
    var to_point = line_vertices[vert_idx + 1];

    var segment = Polyline({
        'paths': [[[from_point.X, from_point.y], [to_point.X, to_point.Y]]],
        "spatialReference": {"wkid": line_geo.spatialReference.wkid}
    });

    var mid_point = Centroid(segment);
    for (var struct_feat in filtered_features) {
        // If there is already content, skip it
        if (has_bit(struct_feat['ASSOCIATIONSTATUS'], 1) && IndexOf(restrict_to_one_content, struct_feat['AssetType']) >= 0) {
            continue
        }
        var dist = Distance(struct_feat, mid_point, search_unit);
        if (dist < search_distance / 2) {
            structure_candidates[Count(structure_candidates)] = {
                'at': struct_feat['AssetType'],
                'globalid': struct_feat.globalid,
                'distance': dist
            }
        }
    }
    if (Count(structure_candidates) == 0) {
        continue
    }
    // Sort the candidates by what the cable should be in first and by distance
    var sorted_candidates = Sort(structure_candidates, sortCandidates);
    var parent_globalid = sorted_candidates[0]['globalid'];
    // If the parent has already been added as a container, dont add it more than once
    if (IndexOf(added_to, parent_globalid) > -1) {
        continue;
    }
    structure_containers[Count(structure_containers)] = {
        'globalID': parent_globalid,
        'associationType': 'container'
    };
    added_to[Count(added_to)] = parent_globalid;

}

if (Count(structure_containers) == 0) {
    return assigned_to_value;
}

var edit_payload = [
    {
        'className': structure_Line_class,
        'updates': structure_containers
    }
];

return {
    "result": assigned_to_value,
    "edit": edit_payload
};