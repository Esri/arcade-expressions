```js
// This rule will create a Junction to Junction association when a feature is placed

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
var field_value = $feature.assetid;
var assigned_to_class = 'ElectricDistributionDevice';
var association_class = 'ElectricDistributionDevice';
var filter_sql = "assetgroup IN (16) AND assettype IN (3)";
var feature_set = FeatureSetByName($datastore, 'ElectricDistributionDevice', ["OBJECTID", "GLOBALID"], true);
var search_distance = 25;
var search_unit = 'feet';
var association_table = 500001;
// These are examples of the source ID for UN layers, they need to be adjusted to match your GDB
var id_lookup = {
    'StructureJunction': 3,
    'StructureLine': 4,
    'StructureBoundary': 5,
    'ElectricDistributionDevice': 6,
    'ElectricDistributionLine': 7,
    'ElectricDistributionAssembly': 8,
    'ElectricDistributionJunction': 9
};

// ************* End Section *****************

var association_type_lookup = {
    'connectivity': 1,
    'containment': 2,
    'attachment': 3
};

// Buffer the features to find features within a certain distance
var closest_features = Intersects(feature_set, Buffer($feature, search_distance, search_unit));
if (Count(closest_features) == 0) {
    return field_value;
}
// Filter the closest results based on the sql to get assets of a certain type
var filtered_features = Filter(closest_features, filter_sql);

var feat_geo = Geometry($feature);

var dist = null;
var closest_row = null;
for (var feat in filtered_features) {
    //Ignore the source feature
    if (feat['globalid'] == $feature.globalid) {
        continue;
    }
    if (IsEmpty(closest_row)) {
        closest_row = feat;
        continue;
    }
    if (Distance(feat_geo, feat, 'meters') < dist) {
        closest_row = feat;
    }
}
// If not feature was found, exit
if (IsEmpty(closest_row)) {
    return field_value;
}

var edit_playload = [];
edit_playload[0] = {
    'className': association_table,
    'adds': [{
        'fromnetworksourceid': id_lookup(association_class),
        'fromglobalid': closest_row['globalid'],
        'fromterminalid': 1,
        'tonetworksourceid': id_lookup(assigned_to_class),
        'toglobalid': $feature['globalid'],
        'toterminalid': 1,
        'associationtype': association_type_lookup('connectivity'),
        'iscontentvisible': 0,
        'globalid': Guid()
    }]
}
return {"result": field_value, "edit": edit_payload};

```

### Modified version for SWEET
```js
// This rule will create a Junction to Junction association when a feature is placed

// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
var assigned_to_class = 'ElectricDevice';
var association_class = 'ElectricDevice';
var filter_sql = "assetgroup = 22";

var feature_set = FeatureSetByName($map,"Low Voltage Service", ["OBJECTID", "GLOBALID"], true);
var search_distance = 250;
var search_unit = 'feet';

// These are examples of the source ID for UN layers, they need to be adjusted to match your GDB
var id_lookup = {
    'StructureJunction': 3,
    'StructureLine': 4,
    'StructureBoundary': 5,
    'ElectricDevice': 6,
    'ElectricLine': 7,
    'ElectricAssembly': 8,
    'ElectricJunction': 9
};

// ************* End Section *****************

var association_type_lookup = {
    'connectivity': 1,
    'containment': 2,
    'attachment': 3
};
// Buffer the features to find features within a certain distance
var closest_features = Intersects(feature_set, Buffer($feature, search_distance, search_unit));
if (Count(closest_features) == 0) {
    return null;
}
// Filter the closest results based on the sql to get assets of a certain type
var filtered_features = Filter(closest_features, filter_sql);
var feat_geo = Geometry($feature);

var dist = null;
var closest_row = null;
for (var feat in filtered_features) {
    //Ignore the source feature
    if (feat['globalid'] == $feature.globalid) {
        continue;
    }
    if (IsEmpty(closest_row)) {
        closest_row = feat;
        continue;
    }
    if (Distance(feat_geo, feat, 'meters') < dist) {
        closest_row = feat;
    }
}
// If not feature was found, exit
if (IsEmpty(closest_row)) {
    return null;
}
var att = {
        'fromnetworksourceid': id_lookup[association_class],
        'fromglobalid': closest_row['globalid'],
        'fromterminalid': 1,
        'tonetworksourceid': id_lookup[assigned_to_class],
        'toglobalid': $feature['globalid'],
        'toterminalid': 1,
        'associationtype': association_type_lookup['connectivity'],
        'iscontentvisible': 0,
        'globalid': Guid()
    }
var new_feat = Feature(null, att);
return new_feat;

```