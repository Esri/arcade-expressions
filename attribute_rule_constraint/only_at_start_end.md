# Only allow the point to be at the start of end of a line

This constraint attribute rule prevents a point feature from being midspan

## Use cases

In a water system, ensure that if a hydrant is on a line, it is at the end or start.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Constraint
  - **Triggering Events:** Insert, Update

## Expression Template

This constraint attribute rule prevent a feature from deleted unless the feature is retired

```js
// This rule prevents a point feature from being midspan

// Create feature set to the intersecting class using the GDB Name
var intersecting_featset = FeatureSetByName($datastore, 'Line', null, true);

// Intersect the edited feature with the feature set and retrieve the features
var intersected_features = Intersects(intersecting_featset, $feature);

// If not intersecting features, allow the edit
if (intersected_features == null || Count(intersected_features) == 0) {
    return true;
}
var valid_edit = true;
var source_geo = Geometry($feature);
for (var feat in intersected_features) {
    var intersect_geo = Geometry(feat);
    var shape = Dictionary(Text(intersect_geo));
    if (TypeOf(intersect_geo) == 'Polyline') {
        for (var i in shape['paths']) {
            // Check the start point
            if (Round(source_geo.X, 2) != Round(shape[i][0][0], 2) &&
                Round(source_geo, Y, 2) != Round(shape[i][0][1], 2) &&
                Round(source_geo.Z, 2) != Round(shape[i][0][2], 2)) {
                valid_edit = false;
                break;
            }
            // Check the end point
            if (Round(source_geo.X, 2) != Round(shape[i][-1][0], 2) &&
                Round(source_geo, Y, 2) != Round(shape[i][-1][1], 2) &&
                Round(source_geo.Z, 2) != Round(shape[i][-1][2], 2)) {
                valid_edit = false;
                break;
            }
        }
    }
    if (valid_edit == false) {
        break;
    }
}
if (valid_edit) {
    return true;
}
return {'errorMessage': 'Point must be on th start or end of a line'};

```
