# Create attachment to structure within distance

This calculation attribute rule creates an attachment association to the closest structure within a distance

## Use cases

When adding fiber cable, clicking near the pole that it is attached too

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert
  - **Exclude from application evaluation:** True


## Expression Template

When adding fiber cable, clicking near the pole that it is attached too

```js
// ***************************************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
var field_value = $feature.assetid;
var assigned_to_class = 'CommunicationsJunction';
var association_class = 'StructureJunction';
var filter_sql = "assetgroup IN (107) AND assettype IN (241)";
var feature_set = FeatureSetByName($datastore, 'StructureJunction', ["OBJECTID", "GLOBALID"], true);
var search_distance = 25;
var search_unit = 'feet';

// ************* End Section *****************

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

var assocation_update = [{'globalid': closest_row.globalid, 'associationType': 'structure'}];

var edit_payload = [{'className': association_class, 'updates': assocation_update}];

return {
    "result": field_value,
    "edit": edit_payload
};
```

