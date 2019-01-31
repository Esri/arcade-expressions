# Return material from barcode

This example shows how to extract the component material for given gas distribution components encoded using the [ASTM F2897 standard](https://www.astm.org/Standards/F2897.htm). This specification defines requirements for the data used in the tracking and traceability base-62 encoding system and the format of the resultant code to characterize various components used in fuel gas piping systems.

## Use cases

In this example we are highlighting how to efficiently display the material for a natural gas component from a barcode captured in the field. The component matterial code is extracted from the barcode string and returns the full material name.

## Workflow

Copy and paste the expression found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.

To configure the script to your layer, you must replace the BARCODE variable assignment with the field containing the barcode string from the gas component.  

## Expression Template

```js
var BARCODE = $feature.BARCODE

// extract material information from the barcode
var material = Mid(BARCODE,9,1)

// Determine material via lookup
var manufacturerMaterial = Decode(material,
    "A", "Plastic PE2406",
    "B", "Plastic PE2708",
    "C", "Plastic PE3408",
    "D", "Plastic PE3608",
    "E", "Plastic PE3708",
    "F", "Plastic PE3710",
    "G", "Plastic PE4608",
    "H", "Plastic PE4710",
    "J", "Plastic PVC",
    "K", "Plastic PA11",
    "L", "Plastic PA12",
    "M", "Steel",
    "N", "Stainless Steel",
    "O", "Cast Iron",
    "P", "Copper",
    "Q", "Brass",
    "R", "Malleable Iron",
    "S", "Ductile Iron",
    "T", "Reinforced Epoxy Resin",
    "U", "Nylon",
    "V", "Glass Filled Nylon", 
    "X", "Other",
    "0", "Steel Grade A",
    "1", "Steel Grade B",
    "2", "Steel Grade C",
    "3", "Steel Grade X42",
    "4", "Steel Grade X46",
    "5", "Steel Grade X52",
    "6", "Steel Grade X56",
    "7", "Steel Grade X60",
    "8", "Steel Grade X65",
    "9", "Steel Grade X70",
    "")
                    
return (manufacturerMaterial)
```

## Example output

See [this web map](https://www.arcgis.com/home/webmap/viewer.html?webmap=e45ac63435f247fa895347ef77894d03&extent=-88.1198,41.8638,-88.1183,41.8646) for examples of how to use this expression in ArcGIS Online.

[![barcode expressions](./images/barcode-expressions.png)]