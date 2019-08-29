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
