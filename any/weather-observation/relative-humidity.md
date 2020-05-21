# Calculate relative humidity

This expression calculate the relative humidity based on wet-bulb and dry-bulb temperature readings.

## Use cases

One of the key attributes important to maintaining firefighter safety and wildfire response planning is relative humidity (RH).  Relative humidity provides important insight about the moisture in the air.  The combination of low relative humidity and high temperatures warn firefighters that high-risk weather conditions are present. 

## Workflow

Copy and paste the expression found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.

To configure the script to your layer, edit the first two lines to use the fields representing the dry and wet bulb temperatures.

```js
var dryBulbTemperature = $feature["drybulb_temperature"];
var wetBulbTemperature = $feature["wetbulb_temperature"];
```

## Expression Template

This Arcade expression will return the relative humidity at a given location, deriving the barometric pressure from the feature's Z-value.

```js
var dryBulbTemperature = $feature["drybulb_temperature"];
var wetBulbTemperature = $feature["wetbulb_temperature"];

var pt = Geometry($feature);
var altitude = pt.Z;

function BarometricPressure(T,h){

    var g = 9.80665; //gravitational acceleration
    var P0 = 101325; // pressure at sea level
    var M = 0.0289644; //molar mass of air
    var R = 8.31432; //universal gas constant
    
    //convert F to Kelvin
    var Tk = (T - 32) * 5/9 + 273.15;

    // calculate barometric pressure
    var P = (P0 * exp((-g * M * h) / (R * Tk))) / 100;
    return P;
}

//Relative Humidity using Wet (Tw) & Dry Bulb (Td) Temps
function RelativeHumidity(Td, Tw, h){
	
    var Tdk = (Td - 32) * 5/9;
    var Twk = (Tw - 32) * 5/9;
    
    var Es = 6.112 * exp((17.67 * Tdk)/(Tdk + 243.5));
    var Ew = 6.112 * exp((17.67 * Twk)/(Twk + 243.5));
    
    //get barometric pressure based on dry temp and altitude
    var Psta = BarometricPressure(Td,h);

    var E = Ew - Psta * (Tdk - Twk) * 0.00066 * 
        (1 + (0.00115 * Twk));
    
    // Relative Humidity
    var RH = (E / Es) * 100;
    
    return RH;
    //return Text(RH,'#') + '%';    
}

return (RelativeHumidity(dryBulbTemperature, 
    wetBulbTemperature, altitude));
```

## Example output

See [this web map](https://esriapps.maps.arcgis.com/home/webmap/viewer.html?webmap=b69e2dac2d224962bad47e569f4048bf) for examples of how to use this expression in ArcGIS Online.

![Relative Humidity](../images/relative-humidity-heat-index.png)