# Sandbag estimation for sandbag wall

This expression returns the number of sandbags needed to construct a sandbag wall of a given length, height and type.

## Use cases

This example can be used in flood response and control activities to ensure necessary resources are deployed. Calculations are derived from [this site]( https://articles.extension.org/pages/26483/sandbagging-for-flood-protection).

## Workflow

Copy and paste the expression found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.

To configure the script to your layer, edit the first two lines to use the fields representing the desired wall height and type.

```js
var finishedHeight = $feature.FinishedHeight;
var sandbagType = $feature.SandbagType;
```

## Expression Template

This Arcade expression will return the number of sandbags required to construct given the type of sandbag wall.

```js
// Replace with appropriate fields for height 
// and type of sandbag wall
var finishedHeight = $feature.FinishedHeight;
var sandbagType = $feature.SandbagType;

function SandbagsNeeded(dikeHeight,wallLength,wallType) {
    
    // sandbag wall types
    // single stack = 0
    // dike == 1 
    If(wallType == 0){

        return Round((wallLength * dikeHeight * 3),0);
    }
    else {
        // determine number of sandbags per foot of dike wall
        var numSandbagsFoot = ((3 * dikeHeight) + 
            (9 * pow(dikeHeight,2))) / 2;
        
        // calculate number using desired length
        return Round(numSandbagsFoot * 
            wallLength,0);
    }
}

// Determine number of sandbags needed based on proposed 
// length, desired finished height, and wall type
return SandbagsNeeded(finishedHeight, 
    Length($feature,"feet"), sandbagType); 
```

## Example output

See [this web map](https://esriapps.maps.arcgis.com/home/webmap/viewer.html?webmap=60954daaebc84852ac74b3776a4d1ea5&extent=-90.2909,38.8442,-90.2355,38.8693) for examples of how to use this expression in ArcGIS Online.

![Sandbag wall material estimation](../images/sandbag-estimate.png)