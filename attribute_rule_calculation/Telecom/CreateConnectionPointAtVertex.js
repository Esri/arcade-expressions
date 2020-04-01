// Assigned To: CommunicationsLine
// Name: Create Connection Points at Vertex
// Description: Rule generates connection points at a vertex when within a distance of a structure junction
// Subtypes: All
// Field: Asset ID field
// Execute: Insert


// ***************************************

// This section has the functions and variables that need to be adjusted based on your implementation
// The field the rule is assigned to
var field_value = $feature.assetid;
// Limit the rule to valid subtypes
var valid_asset_groups = [1, 3, 4, 5, 6, 7, 9];
if (indexof(valid_asset_groups, $feature.assetgroup) == -1) {
    return field_value;
}

var connection_point_AG = 1;
var connection_point_AT = 1;
var connection_point_class = 'CommunicationsJunction';
var filter_sql = "AssetGroup in (103, 104, 105, 110, 125) and AssetType in (81, 121, 201, 241, 361, 581, 582)";
var attachment_assc = [81, 121, 201, 361];
var containment_assc = [241, 581, 582];
var feature_set = FeatureSetByName($datastore, 'StructureJunction', ["OBJECTID", "GLOBALID", "AssetGroup", "AssetType"], true);
var search_distance = 75;
var search_unit = 9002;
var valid_asset_types = [];

// ************* End Section *****************
if (Count(valid_asset_types) > 0 && indexof(valid_asset_types, $feature.assettype) == -1) {
    return field_value;
}
// Buffer the features to find features within a certain distance
var closest_features = Intersects(feature_set, Buffer(Geometry($feature), search_distance, search_unit));
if (Count(closest_features) == 0) {
    return field_value;
}
// Filter the closest results based on the sql to get assets of a certain type
var filtered_features = Filter(closest_features, filter_sql);

var line_geo = Geometry($feature);
var line_vertices = line_geo['paths'][0];
var new_connection_points = [];
var used_structures = [];
var closest_structure_count = Count(filtered_features);
if (closest_structure_count == 0) {
    return field_value
}

for (var i in line_vertices) {
    for (var structure_feat in filtered_features) {
        if (Count(used_structures) == closest_structure_count) {
            break
        }
        if (indexof(used_structures, structure_feat.globalid) >= 0) {
            continue
        }
        var dist = Distance(line_vertices[i], Geometry(structure_feat), search_unit);

        if (dist < search_distance / 2) {
            used_structures[Count(used_structures)] = structure_feat.globalid;
            var attributes = {
                'AssetGroup': connection_point_AG,
                'AssetType': connection_point_AT,
                'ContainerGUID': structure_feat.globalid,
                'containerType': iif(indexof(attachment_assc, structure_feat.AssetType) > -1, 'attachment', 'container')
            };
            new_connection_points[Count(new_connection_points)] = {
                'attributes': attributes,
                'geometry': line_vertices[i]
            };
            break;
        }
    }
}
// If not feature was found, exit
if (IsEmpty(new_connection_points)) {
    return field_value;
}

var edit_payload = [
    {'className': connection_point_class, 'adds': new_connection_points}
];

return {
    "result": field_value,
    "edit": edit_payload
};