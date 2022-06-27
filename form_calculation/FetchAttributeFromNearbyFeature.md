# Fetch Attribute From Nearby Feature

When installing new assets or collecting other data, it’s often useful to store the nearest address.

## Example

I’m planting new trees in a neighborhood and want to store the nearest address using existing parcel data.

```js
// If feature doesn't have geometry return null
if (IsEmpty(Geometry($feature))) { return null }

// Get the parcels layer
var parcels = FeatureSetByName($map, 'Parcels')

// Buffer the current location and intersect with parcels
var bufferedLocation = Buffer($feature, 100, 'feet')
var candidateParcels = Intersects(parcels, bufferedLocation)

// Calculate the distance between the parcel and the current location
// Store the feature and distance as a dictionary and push it into an array
var featuresWithDistances = []
for (var f in candidateParcels) {
    Push(featuresWithDistances, 
        {
            'distance': Distance($feature, f, 'feet'),
            'feature': f
        }
    )
}

// Sort the candidate parcels by distance using a custom function
function sortByDistance(a, b) {
    return a['distance'] - b['distance']
}
var sorted = Sort(featuresWithDistances, sortByDistance)

// Get the closest feature
var closestFeatureWithDistance = First(sorted)

// If there was no feature, return null
if (IsEmpty(closestFeatureWithDistance)) { return null }

// Return the address
return `${closestFeatureWithDistance['feature']['ADDNUM']} ${closestFeatureWithDistance['feature']['ADDRESSNAM']}`
```