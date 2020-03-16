# Polyethelene sheeting estimation for sandbag wall

This expression returns the amount of polyethelene sheeting needed to fill sandbags to construct a sandbag wall of a given length, height.

## Use cases

This example can be used in flood response and control activities to ensure necessary resources are deployed. Calculations are derived from [this site]( https://articles.extension.org/pages/26483/sandbagging-for-flood-protection).

## Workflow

Copy and paste the expression found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.

To configure the script to your layer, edit the first line to use the fields representing the desired wall height.

```js
var finishedHeight = $feature.FinishedHeight;
```

## Expression Template

This Arcade expression will return the square feet of polyethelene sheeting required to construct a sandbag wall.

```js
// Replace with appropriate field for height 
var finishedHeight = $feature.FinishedHeight;
var finishedWidth = 3;

// assume length of dike base and top are equal
// e.g. straight line for dike wall
var embankmentCrestLength = Length($feature,"feet");
var embankmentToeLength = Length($feature,"feet");

function CalculatePolySheeting(wallLengthAtCrest,
    wallLengthAtBase,dikeHeight){

    // dike wall width is assumed to be 3x height
    var dikeWidth = dikeHeight * 3;        

    // calculate the slope of the embankment that needs 
    // to be covered (water side)
    var slopeLength = Sqrt(pow(dikeHeight,2) + 
        pow((dikeWidth / 2),2));

    // Assume dike wall top (crest) is one sandbag wide, ~1'
    var embankmentCrestWidth = 1;

    // calculate area to be covered on the side of the embankment
    var embankmentArea = (wallLengthAtCrest + 
        wallLengthAtBase) / 2 * slopeLength;

    // determine area of the crest of wall to be covered. 
    // Assume one sandbag in width (~1')
    var crestArea = wallLengthAtCrest * embankmentCrestWidth;

    //compute total area
    return Ceil(embankmentArea + crestArea,0);

}

If(wallType == 1)
    return CalculatePolySheeting(embankmentCrestLength,
        embankmentToeLength,finishedHeight);
Else
    return "-";
```

## Example output

See [this web map](https://esriapps.maps.arcgis.com/home/webmap/viewer.html?webmap=60954daaebc84852ac74b3776a4d1ea5&extent=-90.2909,38.8442,-90.2355,38.8693) for examples of how to use this expression in ArcGIS Online.

![Sandbag wall material estimation](../images/sandbag-estimate.png)