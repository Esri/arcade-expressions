# Attribute from Intersection

This expression returns an attribute value from a featureSet where the largest feature intersects the input feature.

## Use cases

To suggest a value from a majority intersection. For instance, when drawing a polygon, return the county name for which the majority of the new polygon is in.

## Workflow

Copy and paste the expression found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.

To configure the script to your layer, edit the first line to specify the layer you would like to use instead of the example layer. 

```js
var set = FeatureSetByName($datastore,"Building Footprints")
```

Also edit the last line to specify the attribute you would like to use intead of the example `objectid`.

```js
getAttributeFromLargestArea($feature, set, 'objectid')
```

## Expression Template

This Arcade expression will extract the attribute value from a feature in a featureSet where the input feature intersection area is the largest.

```js
var set = FeatureSetByName($datastore, 'Building Footprints')

function getAttributeFromLargestArea(feat, set, field) {
    var items = intersects(set, feat)

    if (items == false) {
        return { 'errorMessage': 'No intersection found' }
    }

    if (count(items) == 1) {
        var result = first(items)

        return result[field]
    }

    var largest = -1
    var result

    for (var item in items) {
        var size = area(intersection(item, feat))

        if (size > largest) {
            largest = size
            result = item[field]
        }
    }

    return result
}

getAttributeFromLargestArea($feature, set, 'objectid') 
```
