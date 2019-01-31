# Return lot number from barcode

This example shows how to extract the manufacturing lot number for given gas distribution components encoded using the [ASTM F2897 standard](https://www.astm.org/Standards/F2897.htm). This specification defines requirements for the data used in the tracking and traceability base-62 encoding system and the format of the resultant code to characterize various components used in fuel gas piping systems.

## Use cases

In this example we are highlighting how to efficiently display lot number information for a natural gas component from a barcode captured in the field.  The lot number is extracted and decoded from the barcode string.  

## Workflow

Copy and paste the expression found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.

To configure the script to your layer, you must replace the BARCODE variable assignment with the field containing the barcode string from the natural gas component.  


## Expression Template

```js
var base62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

var BARCODE = $feature.BARCODE

// extract the encoded lot number from the barcode
var lotnumberEncoded = Mid(BARCODE,2,4)

// unencode the lot number
var manufacturerLotCode = 0;
for (var z=0;z<Count(lotnumberEncoded);z++) {
  manufacturerLotCode = manufacturerLotCode * Count(base62) + Find(Mid(lotnumberEncoded,z,1), base62)
};

return (manufacturerLotCode)
```

## Example output

See [this web map](https://www.arcgis.com/home/webmap/viewer.html?webmap=e45ac63435f247fa895347ef77894d03&extent=-88.1198,41.8638,-88.1183,41.8646) for examples of how to use this expression in ArcGIS Online.

[![barcode expressions](./images/barcode-expressions.png)]
