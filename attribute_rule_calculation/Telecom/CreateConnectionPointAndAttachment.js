// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
var field_value = $feature.assetid;
var connection_point_AG = 1;
var connection_point_AT = 1;
var connection_point_class = 'CommunicationsJunction';
var association_table = 'UN_5_Associations';
var association_class = 'StructureJunction';
var filter_sql = "OBJECTID > -1";
var feature_set = FeatureSetByName($datastore, 'StructureJunction', ["OBJECTID", "GLOBALID"], true);
var search_distance = 75;
var search_unit = 9002;
var valid_asset_types = [];

var id_lookup = {
    'StructureJunction': 3,
    'StructureLine': 4,
    'StructureBoundary': 5,
    'CommunicationsDevice': 6,
    'CommunicationsLine': 7,
    'CommunicationsAssembly': 8,
    'CommunicationsJunction': 9
};
var association_type_lookup = {
    'connectivity': 1,
    'containment': 2,
    'attachment': 3
};
// ************* End Section *****************
if (Count(valid_asset_types) > 0 && indexof(valid_asset_types, $feature.assettype) == -1) {
    return field_value;
}
// Buffer the features to find features within a certain distance
var closest_features = Intersects(feature_set, Buffer(Geometry($feature), search_distance, search_unit));
if (Count(closest_features) == 0) {
    return 'aqs'
    return field_value;
}
// Filter the closest results based on the sql to get assets of a certain type
var filtered_features = closest_features;//Filter(closest_features, filter_sql);

var line_geo = Geometry($feature);
var line_vertices = line_geo['paths'][0];
var new_connection_points = [];
var new_association = [];
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
        if (indexof(used_structures, structure_feat.globalid) >=0) {
            continue
        }
        var dist = Distance(line_vertices[i], Geometry(structure_feat), search_unit);

        if (dist < search_distance/2) {
            used_structures[Count(used_structures)] = structure_feat.globalid;
            var attributes = {
                'AssetGroup': connection_point_AG,
                'AssetType': connection_point_AT,
                'GlobalID': GUID()
            };
            new_connection_points[Count(new_connection_points)] = {
                'attributes': attributes,
                'geometry': line_vertices[i]
            };
            var assoc_attributes = {
                'fromnetworksourceid': id_lookup[association_class],
                'fromglobalid': structure_feat.globalid,
                'fromterminalid': 1,
                'tonetworksourceid': id_lookup['CommunicationsJunction'],
                'toglobalid': attributes['GlobalID'],
                'toterminalid': 1,
                'associationtype': association_type_lookup['attachment'],
                'iscontentvisible': 0,
                'globalid': Guid()
            };
            new_association[Count(new_association)] = {
                'attributes': assoc_attributes,
                'geometry': null
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
    {'className': connection_point_class, 'updates': new_connection_points},
    {'className': association_table, 'updates': new_association}
];

return {
    "result": field_value,
    "edit": edit_payload
};