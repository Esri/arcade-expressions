# Geometry as an attribute

When integrating with other systems, it can be useful to store the x, y, z, or m values as separate attributes. This can be done by accessing the feature’s geometry via Arcade.

## Examples

I need to store the x and y locations as separate attributes so I can import it into some other system without out post-processing.

```js
// Get the X value
var geom = Geometry($feature)
if (IsEmpty(geom)) {
    return null
} else {
    return geom.X
}
```

I need to store the latitude and longitude values to conform to some standard data collection specification (requires data to be in Web Mercator Projection)

```js

// Create a function to convert meters to lat, long
function MetersToLatLon(geometry) {
    if (IsEmpty(geometry)) {
        return [null, null]
    }
    var originShift = 2.0 * PI * 6378137.0 / 2.0    
    var lon = (geometry.x / originShift) * 180.0
    var lat = (geometry.y / originShift) * 180.0 
    lat = 180.0 / PI * (2.0 * Atan( Exp( lat * PI / 180.0)) - PI / 2.0)    
    return [Round(lat, 6), Round(lon, 6)]
}

// Call the function and return the latitude or longitude value
MetersToLatLon(Geometry($feature))[0]
```
