// Assigned To: StructureLine
// Type: Calculation
// Name: Contain a Structure Line in Structure Line
// Description: Rule searches for structure line containers with a certain distance to contain the structure in it. This supports adding a conduit or duct bank in a trench or tunnel and a lashing guy in a Aerial Span.
// Subtypes: All
// Field: Assetid
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
// ** Implementation Note: The field this rule is assigned to does not matter as it does not affect the assigned to field
var assigned_to_value = $feature.assetid;

// Limit the rule to valid asset groups/subtypes
// ** Implementation Note: Instead of recreating this rule for each subtype, this rules uses a list of subtypes and exits if not valid
//    If you have added Asset Groups, they will need to be added to this list.
var valid_asset_groups = [102, 103, 109];

// Limit the rule to specific asset types.
// ** Implementation Note: This rule uses a list of asset types and exits if not valid. Add to list to limit rule to specific asset types.
var valid_asset_types = [81, 121, 127];

// Call the StructureLine class on which a distance search will be performed
// ** Implementation Note: Only update the class name and field names if they differ.
var feature_set = FeatureSetByName($datastore, 'StructureLine', ["OBJECTID", "GLOBALID", "ASSOCIATIONSTATUS", "AssetGroup", "AssetType"], true);

// Limit StructureLine features to certain Asset Groups and Asset Types
// ** Implementation Note: This SQL query limits which Structure Line features are considered in distance search
var filter_structure_lines_sql = "AssetGroup in (103, 104, 112) and AssetType in (101, 125, 221)";

// The maximum distance a structure line container can be from the content
// ** Implementation Note: This value is derived from the field. If field is null or empty, the value will default
//    to number shown in second parameter.
var search_distance = DefaultValue($feature.searchdistance, 75);

// The unit of the distance value in search_distance
// ** Implementation Note: Options for Unit of Measure: https://developers.arcgis.com/arcade/function-reference/geometry_functions/#units-reference
var search_unit = 9002;

// Set the container asset types that can only contain one child item
// Create a list of what items can be in what parent containers
// ** Implementation Note: These values do not need to change if using the industry data model.
var restrict_to_one_content = [];
var child_to_parent = {
    '121': [101, 221],
    '127': [125],
    '81': [101]
};

// Structure Line container class name
// ** Implementation Note: This is the name of the class used to create containers
var structure_Line_class = 'StructureLine';

// ************* End User Variables Section *************

// *************       Functions            *************

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
        bit_pos++
        if (test_value == 0)
            break;
    }
    // now that we know the bit position, we shift the bits of
    // num until we get to the bit we care about
    for (var i = 1; i <= bit_pos; i++) {
        var num = Floor(num / 2);
    }

    if (num % 2 == 0) {
        return false
    } else {
        return true
    }

}

// ************* End Functions Section ******************

// Validation
if (IndexOf(valid_asset_groups, $feature.assetgroup) == -1) {
    return assigned_to_value;
}
if (Count(valid_asset_types) > 0 && IndexOf(valid_asset_types, $feature.assettype) == -1) {
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

    // Check to see if point is between vertexs
    var from_point = line_vertices[vert_idx];
    var to_point = line_vertices[vert_idx + 1];

    var segment = Polyline({
        'paths': [[[from_point.X, from_point.y], [to_point.X, to_point.Y]]],
        "spatialReference": {"wkid": line_geo.spatialReference.wkid}
    });

    var mid_point = Centroid(segment);
    for (var struct_feat in filtered_features) {
        // Check to see if the container is valid for the type
        if (IndexOf(child_to_parent[Text($feature.assettype)], struct_feat['AssetType']) == -1) {
            continue;
        }
        // If there is already content, and it is restricted to one item, skip it
        if (has_bit(struct_feat['ASSOCIATIONSTATUS'], 1) && IndexOf(restrict_to_one_content, struct_feat['AssetType']) >= 0) {
            continue;
        }
        if (Distance(struct_feat, mid_point, search_unit) < search_distance / 2) {
            var parent_globalid = struct_feat.globalid;
            // If the parent has already been added as a container, dont add it more than once
            if (IndexOf(added_to, parent_globalid) > -1) {
                continue;
            }

            added_to[Count(added_to)] = parent_globalid;
            structure_containers[Count(structure_containers)] = {
                'globalID': parent_globalid,
                'associationType': 'container'
            };
            break;
        }
    }
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