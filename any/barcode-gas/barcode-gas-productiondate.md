# Return production date from barcode

This example shows how to extract the component material for given gas distribution components encoded using the [ASTM F2897 standard](https://www.astm.org/Standards/F2897.htm). This specification defines requirements for the data used in the tracking and traceability base-62 encoding system and the format of the resultant code to characterize various components used in fuel gas piping systems.

## Use cases

In this example we are highlighting how to efficiently display the manufacturer production date for a natural gas component from a barcode captured in the field.  In the example below we are extracting the component manufacture date from the barcode string.  

## Workflow

Copy and paste the expression found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.

To configure the script to your layer, you must replace the BARCODE variables with the field containing the barcode string from the natural gas component.  

## Expression Template

To configure the script to your layer, you must replace the BARCODE variable assignment with the field containing the barcode string from the gas component.  


```js
var base62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

var BARCODE = $feature.BARCODE

// extract portion of the barcode containing date
var manufactureEncodedDate = Mid(BARCODE,6,3);

var x = 0;
for (var z=0;z<Count(manufactureEncodedDate);z++) {
  x = x * Count(base62) + Find(Mid(manufactureEncodedDate,z,1), base62);
};

var manufactureDay;
var manufactureYear = 2000 + Number(Right(x,2));

// number of days 0-9
If (Count(Text(x)) == 3){
    manufactureDay = Number(Left(x,1));
}
else{
    //number of days > 9
    If (Count(Text(x)) == 4){
        manufactureDay = Number(Left(x,2));
    }
    // number of days > 99
    else{
        manufactureDay = Number(Left(x,3));
    }
}

// add days to year
var manufactureDate = DateAdd(Date(manufactureYear,0,1),(manufactureDay - 1),'days');

// format date
var formattedDate = Text(manufactureDate,'M/D/Y');

return formattedDate;
```

## Example output

This example shows how the expression can be used for the feature's popup as well as labeling.

See [this web map](https://www.arcgis.com/home/webmap/viewer.html?webmap=e45ac63435f247fa895347ef77894d03&extent=-88.1198,41.8638,-88.1183,41.8646) for examples of how to use this expression in ArcGIS Online.

[![barcode expressions](./images/barcode-expressions.png)]