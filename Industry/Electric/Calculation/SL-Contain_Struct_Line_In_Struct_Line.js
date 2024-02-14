// Assigned To: StructureLine
// Type: Calculation
// Name: Contain Structure Line in Structure Line-SL
// Description: Rule searches for structure line containers within a certain distance to contain the structure in it. This supports adding a conduit or duct bank in a trench or tunnel and a lashing guy in a Aerial Span.
// Subtypes: All
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
Expects($feature, 'assetgroup', 'assettype', 'searchdistance');
// Limit the rule to valid asset groups/subtypes
// ** Implementation Note: Instead of recreating this rule for each subtype, this rules uses a list of subtypes and exits if not valid
//    If you have added Asset Groups, they will need to be added to this list.
var valid_asset_groups = [102, 103, 105, 106, 107, 109];

// Limit the rule to specific asset types.
// ** Implementation Note: This rule uses a list of asset types and exits if not valid. Add to list to limit rule to specific asset types.
var valid_asset_types = [81, 111, 127];

// Call the StructureLine class on which a distance search will be performed
// ** Implementation Note: Only update the class name and field names if they differ.
var feature_set = FeatureSetByName($datastore, 'StructureLine', ["OBJECTID", "GLOBALID", "ASSOCIATIONSTATUS", "AssetGroup", "AssetType"], true);

// Limit StructureLine features to certain Asset Groups and Asset Types
// ** Implementation Note: This SQL query limits which Structure Line features are considered in distance search
var filter_structure_lines_sql = "AssetGroup in (103, 104, 112, 113, 114, 115) and AssetType in (101, 125, 221, 241, 242, 243)";

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
    '111': [101, 221],
    '127': [125],
    '81': [101]
};

// Structure Line container class name
// ** Implementation Note: This is the name of the class used to create containers
var structure_Line_class = 'StructureLine';

// ************* End User Variables Section *************

// Validation
if (!Includes(valid_asset_groups, $feature.assetgroup)) {
    return;
}
if (Count(valid_asset_types) > 0 && !Includes(valid_asset_types, $feature.assettype)) {
    return;
}

// Buffer the features to find features within a certain distance
var closest_features = Intersects(feature_set, Buffer(Geometry($feature), search_distance, search_unit));

// Filter the closest results based on the sql to get assets of a certain type
var filtered_features = Filter(closest_features, filter_structure_lines_sql);
var closest_feats = [];
for (var struct_feat in filtered_features) {
    Push(closest_feats, struct_feat);
}
// Calling count on the FS causes unnecessary queries, so loop over features to get a list of them
if (Count(closest_feats) == 0) {
    return;
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

    // find closest structure feat to mid point of segment
    var struct_candidate = null;
    var closest_found_dist = search_distance / 2;
    for (var idx in closest_feats) {
        var struct_feat = closest_feats[idx];
        // Check to see if the container is valid for the type
        if (!Includes(child_to_parent[Text($feature.assettype)], struct_feat['AssetType'])) {
            continue;
        }
        // If there is already content, and it is restricted to one item, skip it
        if ((struct_feat['ASSOCIATIONSTATUS'] & 0x1) && Includes(restrict_to_one_content, struct_feat['AssetType'])) {
            continue;
        }
        // If the parent has already been added as a container, dont add it more than once
        if (Includes(added_to, struct_feat.globalid)) {
            continue;
        }
        var dist = Distance(struct_feat, mid_point, search_unit);
        if (dist < closest_found_dist) {
            closest_found_dist = dist;
            struct_candidate = struct_feat;
        }
    }
    if (IsEmpty(struct_candidate)) continue;

    push(added_to, struct_candidate.globalid);
    push(structure_containers, {
        'globalID': struct_candidate.globalid,
        'associationType': 'container'
    });
}
if (Count(structure_containers) == 0) {
    return;
}
var edit_payload = [
    {
        'className': structure_Line_class,
        'updates': structure_containers
    }
];

return {
    "edit": edit_payload
};