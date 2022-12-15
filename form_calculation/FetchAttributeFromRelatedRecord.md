# Fetch an Attribute From a Related Record

When performing inspections, it’s often necessary to store information about the parent feature such as the address, or type of asset. These attributes can be pulled from the parent layer by querying the related records and accessing the necessary attributes.

## Example Use Case

I’m inspecting hydrants and need to record the Facility ID with each inspection.

## Example Code

```js
// Get the feature set for the hydrants and return the first;
var hydrants = First(FeatureSetByRelationshipName($feature, 'wHydrant', ['facilityid'], false));

// If there was a hydrant, return the facilityid of it,
// Otherwise, return null
if (!IsEmpty(hydrant)) {
    return hydrant['facilityid'];
} else {
    return null;
}
```
