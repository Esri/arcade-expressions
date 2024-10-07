// Assigned To: CommunicationsLine
// Type: Calculation
// Name: Line - Connection Point At Vertex
// Description: Create connection points at vertex. Generates connection points at a vertex when within a distance of a structure junction.
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
// ** Implementation Note: Instead of recreating this rule for each subtype, this rule uses a list of subtypes and exits if not valid
//    If you have added Asset Groups, they will need to be added to this list.
var valid_asset_groups = [1, 3, 4, 5, 6, 7, 9];

// Optionally limit rule to specific asset types.
// ** Implementation Note: Add to list to limit rule to specific asset types. If not specified, will be ignored.
var valid_asset_types = [];

// Call the StructureJunction class on which a distance search can be performed
// ** Implementation Note: Only update the class name and field names if they differ.
var feature_set = FeatureSetByName($datastore, "StructureJunction", ["OBJECTID", "GLOBALID", "AssetGroup", "AssetType"], true);

// Limit StructureJunction features to certain Asset Groups and Asset Types
// ** Implementation Note: This SQL query limits which Structure Junction features are considered in distance search
var filter_sql = "AssetGroup in (103, 104, 105, 125) and AssetType in (81, 121, 201, 241, 361, 581, 582)";

// The maximum distance from a structure junction feature to create connection points
// ** Implementation Note: This value is derived from the field. If field is null or empty, the value will default
//    to number shown in second parameter.
var search_distance = DefaultValue($feature.searchdistance, 75);

// The unit of the distance value in search_distance
// ** Implementation Note: Options for Unit of Measure: https://developers.arcgis.com/arcade/function-reference/geometry_functions/#units-reference
var search_unit = 9002;

// Valid asset types for attachments and containments
// ** Implementation Note: These values do not need to change if using the industry data model. If you have added Asset Types
//    that need to be included, they will need to be added to these lists.
var attachment_assc = [81, 121, 201, 361];
var containment_assc = [241, 581, 582];

// Connection point settings. The class name, asset group, and asset type of the connection points to be generated.
// ** Implementation Note: Asset type will differ depending on if connection point is an attachment or container.
var connection_point_class = 'CommunicationsJunction';
var connection_point_AG = 1;
var connection_point_AT_att = 1;
var connection_point_AT_cont = 3;

// ************* End User Variables Section *************

// Validation
if (IndexOf(valid_asset_groups, $feature.assetgroup) == -1) {
    return assigned_to_value;
}
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
