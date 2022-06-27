# Spatial Inheritance (Fetch an attribute from an underlying polygon)

Sometimes, it can be valuable to store the geographic area a feature was collected in. In the past, this could be done manually by selecting the region from a list of values or by post processing the data. Now, this can be streamlined and automatically captured in the field by using a form calculation that performs a spatial intersection of the current location and a layer of polygons representing the geographic areas.

## Example

I am recording bird sightings and want to automatically store the region I’m in.

```js
// Create a feature set using the 'Regions' layer in the map
var regions = FeatureSetByName($map, 'Regions', ['name'])

// Intersect the current location with the regions and 
// get the first region
var region = First(Intersects($feature, regions))

// If the current location does intersect a feature, 
// return the name of the region. Otherwise, return null
if (!IsEmpty(region)) {
    return region['name']
} else {
    return null
}
```