// Assigned To: CommunicationsLine
// Type: Calculation
// Name: Create Connection Points at Vertex
// Description: Generates connection points at a vertex when within a distance of a structure junction
// Subtypes: All
// Field: Assetid
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
// The field the rule is assigned to
var assigned_to_value = $feature.assetid;
// Limit the rule to valid subtypes
var valid_asset_groups = [1, 3, 4, 5, 6, 7, 9];
if (IndexOf(valid_asset_groups, $feature.assetgroup) == -1) {
    return assigned_to_value;
}

var connection_point_AG = 1;
var connection_point_AT_att = 1;
var connection_point_AT_cont = 3;
var connection_point_class = 'CommunicationsJunction';
var filter_sql = "AssetGroup in (103, 104, 105, 125) and AssetType in (81, 121, 201, 241, 361, 581, 582)";
var attachment_assc = [81, 121, 201, 361];
var containment_assc = [241, 581, 582];
var feature_set = FeatureSetByName($datastore, 'StructureJunction', ["OBJECTID", "GLOBALID", "AssetGroup", "AssetType"], true);
var search_distance = DefaultValue($feature.searchdistance, 75);
// Options for Unit of Measure: https://developers.arcgis.com/arcade/function-reference/geometry_functions/#units-reference
var search_unit = 9002;
var valid_asset_types = [];

// ************* End User Variables Section *************

if (Count(valid_asset_types) > 0 && indexof(valid_asset_types, $feature.assettype) == -1) {
    return assigned_to_value;
}
// Buffer the features to find features within a certain distance
var closest_features = Intersects(feature_set, Buffer(Geometry($feature), search_distance, search_unit));
// Filter the closest results based on the sql to get assets of a certain type
var filtered_features = Filter(closest_features, filter_sql);
var closest_structure_count = Count(filtered_features);
if (closest_structure_count == 0) {
    return assigned_to_value
}

var line_geo = Geometry($feature);
var line_vertices = line_geo['paths'][0];
var new_connection_points = [];
var used_structures = [];

if (Count(line_vertices) > 2) {
    for (var i = 1; i < Count(line_vertices) - 1; i++) {
        for (var structure_feat in filtered_features) {
            if (Count(used_structures) == closest_structure_count) {
                break
            }
            if (IndexOf(used_structures, structure_feat.globalid) >= 0) {
                continue
            }
            var dist = Distance(line_vertices[i], Geometry(structure_feat), search_unit);

            if (dist < search_distance / 2) {
                used_structures[Count(used_structures)] = structure_feat.globalid;
                var isContainment = IndexOf(containment_assc, structure_feat.AssetType) == -1
                var isAttachment = IndexOf(attachment_assc, structure_feat.AssetType) == -1
                if (isAttachment == false && isContainment == false) {
                    continue
                }
                var attributes = {
                    'AssetGroup': connection_point_AG,
                    'AssetType': iif(isContainment, connection_point_AT_cont, connection_point_AT_att),
                    'ContainerGUID': structure_feat.globalid,
                    'containerType': iif(isContainment, 'container', 'structure')//attached - content
                };
                new_connection_points[Count(new_connection_points)] = {
                    'attributes': attributes,
                    'geometry': line_vertices[i]
                };
                break;
            }
        }
    }
}
// If not feature was found, exit
if (IsEmpty(new_connection_points)) {
    return assigned_to_value;
}

var edit_payload = [
    {'className': connection_point_class, 'adds': new_connection_points}
];

return {
    "result": assigned_to_value,
    "edit": edit_payload
};
