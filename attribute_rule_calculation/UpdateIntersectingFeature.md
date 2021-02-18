# Update an Intersecting Feature

This calculation attribute rule copies a value from the edited feature to features it intersects.

## Use cases

To copy a lifecycle, diameter, district, etc from a feature to features it intersects.

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Insert, Update
  - **Exclude from application evaluation:** True


## Expression Template

This Arcade expression uses the source feature to find features in another layer and update their values [Example](./UpdateIntersectingFeature.zip)

```js
var all_devices = FeatureSetByName($datastore, "WaterDevice", ["globalid"], true)
var devices = Intersects(all_devices, $feature)
var updates = []
var i=0
for (var device in devices){
  updates[i++] = {'globalid': device.globalid,
                'attributes': {'linevalue': $feature.ValueToCopy}
               }
}
return {
   'result': $feature.ValueToCopy, 
   'edit': [{
        'className': 'WaterDevice',
        'updates': updates           
    }]
}
```

```js
// Check to to if the ID changed
var orig_assetid = $originalFeature.assetid;
var assetid = $feature.assetid;
if (assetid == orig_assetid) {
    return null;
}
// Get the connected mains to the edited feature
var sewer_mains = FeatureSetByName($datastore, "SewerMain", ["globalid"], true)
var connected_mains = Intersects(sewer_mains, $feature)

// Functions to check if points/vertexes are snapped
function points_snapped(point_a, point_b) {
    // Cant explain it, but need these checks to get past validation
    if (IsEmpty(point_a) || IsEmpty(point_b)) {
        return false
    }
    if (HasKey(Dictionary(Text(point_b)), 'x') == false || HasKey(Dictionary(Text(point_a)), 'x') == false) {
        return false
    }
    return (nearly_equal(point_a.x, point_b.x, 4) &&
        nearly_equal(point_a.y, point_b.y, 4) &&
        nearly_equal(point_a.z, point_b.z, 4))

}

function nearly_equal(a, b, sig_fig) {
    // check if nearly equal to certain significant figure  https://stackoverflow.com/a/558289/12665063
    return (a == b || Round(a * Pow(10, sig_fig), 0) == Round(b * Pow(10, sig_fig), 0))
}

var updates = []
var i = 0
// Get the geometry of the edited feature
var port_geo = Geometry($feature);
// Loop through all mains
for (var sewer_main in connected_mains) {
    // Get the First and Last vertex
    var paths = Geometry($feature)['paths'];
    var from_point = paths[0][0]
    var to_point = paths[-1][-1]
    // Depending on where the edited feature is snapped to main, update different fields
    if (points_snapped(port_geo, from_point)) {
        updates[i++] = {
            'globalid': device.globalid,
            'attributes': {'fromid': assetid}
        }
    } else {
        updates[i++] = {
            'globalid': device.globalid,
            'attributes': {'toid': assetid}
        }
    }

}
// Return the edits
return {
    'edit': [{
        'className': 'SewerMain',
        'updates': updates
    }]
}
```