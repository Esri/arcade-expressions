# Return component size from barcode

This example shows how to extract the component size or sizes for given gas distribution components encoded using the [ASTM F2897 standard](https://www.astm.org/Standards/F2897.htm). This specification defines requirements for the data used in the tracking and traceability base-62 encoding system and the format of the resultant code to characterize various components used in fuel gas piping systems.

## Use cases

In this example we are highlighting how to efficiently extract the size of a gas component from a barcode captured in the field.  In some cases, one or more component sizes is derived from the barcode string.  

## Workflow

Copy and paste the expression found in the expression template below to the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or the relevant location in a custom app.

To configure the script to your layer, you must replace the BARCODE variables with the field containing the barcode string from the natural gas component.  

## Expression Template

```js
var base62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

var BARCODE = $feature.BARCODE;

// extract the encoded component size from the barcode
var ComponentSize = Mid(BARCODE,12,3);

var d = Dictionary(
    1, "0.25, 0, CTS, 0.062", 2, "0.375, 0, CTS, 0.062", 3, "0.50, 0, CTS, 0.062",
    4, "0.50, 0, CTS, 0.090", 5, "0.50, 0, CTS, 0.104",
    6, "0.75, 0, CTS, 0.062", 7, "0.75, 0, CTS, 0.077", 8, "0.75, 0, CTS, 0.090",
    9, "1.0, 0, CTS, 0.062", 10, "1.0, 0, CTS, 0.090",
    11, "1.0, 0, CTS, 0.099", 12, "1.0, 0, CTS, 1.01", 13, "1.0, 0, CTS, 0.121",
    14, "1.25, 0, CTS, 0.062", 15, "1.25, 0, CTS, 0.090",
    16, "1.25, 0, CTS, 0.121", 17, "1.75, 0, CTS, 0.062", 18, "0.50, 9.3, IPS, 0.090",
    19, "0.50, 11, IPS, 0.076", 20, "0.75, 11, IPS, 0.095",
    21, "0.75, D, IPS, 0.090", 22, "1.0, 9.33, IPS, 0.140", 23, "1.0, 9.9, IPS, 0.133",
    24, "1.0, 11, IPS, 0.120", 25, "1.0, 13.5, IPS, 0.097",
    26, "1.0, D, IPS, 0.090", 27, "1.25, 9.33, IPS, 0.178", 28, "1.25, 10, IPS, 0.166",
    29, "1.25, 11, IPS, 0.151", 30, "1.25, 13.5, IPS, 0.123",
    31, "1.25, 17, IPS, 0.098", 32, "1.25, D, IPS, 0.090", 33, "1.50, 11, IPS, 0.173",
    34, "1.50, 13.5, IPS, 0.141", 35, "1.50, 17, IPS, 0.112",
    36, "1.50, D, IPS, 0.090", 37, "2.0, 9.33, IPS, 0.255", 38, "2.0, 11, IPS, 0.216",
    39, "2.0, 13.5, IPS, 0.176", 40, "3.0, 11, IPS, 0.318",
    41, "3.0, 11.5, IPS, 0.304", 42, "3.0, 13.5, IPS, 0.259", 43, "4.0, 9.33, IPS, 0.482",
    44, "4.0, 11, IPS, 0.409", 45, "4.0, 11.5, IPS, 0.391",
    46, "4.0, 13.5, IPS, 0.333", 47, "4.0, 15.5, IPS, 0.290", 48, "4.0, 17, IPS, 0.265",
    49, "6.0, 11, IPS, 0.602", 50, "6.0, 11.5, IPS, 0.576",
    51, "6.0, 13.5, IPS, 0.491", 52, "6.0, 17, IPS, 0.390", 53, "6.0, 21, IPS, 0.315",
    54, "8.0, 11, IPS, 0.784", 55, "8.0, 11.5, IPS, 0.750",
    56, "8.0, 13.5, IPS, 0.639", 57, "8.0, 17, IPS, 0.507", 58, "8.0, 21, IPS, 0.411",
    59, "10.0, 11, IPS, 0.977", 60, "10.0, 11.5, IPS, 0.935",
    61, "10.0, 13.5, IPS, 0.796", 62, "10.0, 17, IPS, 0.632", 63, "10.0, 21, IPS, 0.512",
    64, "12.0, 11, IPS, 1.159", 65, "12.0, 11.5, IPS, 1.109",
    66, "12.0, 13.5, IPS, 0.944", 67, "12.0, 17, IPS, 0.750", 68, "12.0, 21, IPS, 0.607",
    69, "14.0, 11, IPS, 1.273", 70, "14.0, 13.5, IPS, 1.037",
    71, "14.0, 17, IPS, 0.824", 72, "14.0, 21, IPS, 0.667", 73, "16.0, 11, IPS, 1.455",
    74, "16.0, 13.5, IPS, 1.185", 75, "16.0, 17, IPS, 0.941",
    76, "16.0, 21, IPS, 0.762", 77, "18.0, 11, IPS, 1.636", 78, "18.0, 13.5, IPS, 1.333",
    79, "18.0, 17, IPS, 1.059", 80, "18.0, 21, IPS, 0.857",
    81, "20.0, 11, IPS, 1.818", 82, "20.0, 13.5, IPS, 1.481", 83, "20.0, 17, IPS, 1.176",
    84, "20.0, 21, IPS, 0.952", 85, "22.0, 11, IPS, 2.000",
    86, "22.0, 13.5, IPS, 1.630", 87, "22.0, 17, IPS, 1.294", 88, "22.0, 21, IPS, 1.048",
    89, "24.0, 11, IPS, 2.182", 90, "24.0, 13.5, IPS, 1.778",
    91, "24.0, 17, IPS, 1.412", 92, "24.0, 21, IPS, 1.143", 101, "0.5, -1, MPT, -1",
    102, "0.75, -1, MPT, -1", 103, "1.0, -1, MPT, -1",
    104, "1.25, -1, MPT, -1", 105, "1.50, -1, MPT, -1", 106, "2.0, -1, MPT, -1",
    107, "3.0, -1, MPT, -1", 108, "4.0, -1, MPT, -1", 109, "6.0, -1, MPT, -1",
    110, "8.0, -1, MPT, -1", 111, "10.0, -1, MPT, -1", 112, "12.0, -1, MPT, -1",
    121, "0.5, -1, FPT, -1", 122, "0.75, -1, FPT, -1", 123, "1.0, -1, FPT, -1",
    124, "1.25, -1, FPT, -1", 125, "1.50, -1, FPT, -1", 126, "2.0, -1, FPT, -1",
    127, "3.0, -1, FPT, -1", 128, "4.0, -1, FPT, -1", 129, "6.0, -1, FPT, -1",
    130, "8.0, -1, FPT, -1", 131, "10.0, -1, FPT, -1", 132, "12.0, -1, FPT, -1",
    151, "0.125, -1, NPS, 0.068", 152, "0.125, -1, NPS, 0.095",
    153, "0.25, -1, NPS, 0.088", 154, "0.25, -1, NPS, 0.119", 155, "0.375, -1, NPS, 0.091",
    156, "0.375, -1, NPS, 0.126", 157, "0.5, -1, NPS, 0.109",
    158, "0.5, -1, NPS, 0.147", 159, "0.75, -1, NPS, 0.113", 160, "0.75, -1, NPS, 0.154",
    161, "1, -1, NPS, 0.133", 162, "1, -1, NPS, 0.179",
    163, "1.25, -1, NPS, 0.14", 164, "1.25, -1, NPS, 0.191", 165, "1.5, -1, NPS, 0.145",
    167, "2, -1, NPS, 0.154", 168, "2, -1, NPS, 0.218",
    169, "3, -1, NPS, 0.188", 170, "3, -1, NPS, 0.216", 171, "4, -1, NPS, 0.156",
    172, "4, -1, NPS, 0.188", 173, "4, -1, NPS, 0.237",
    175, "6, -1, NPS, 0.188", 176, "6, -1, NPS, 0.219", 177, "6, -1, NPS, 0.25",
    178, "6, -1, NPS, 0.28", 181, "8, -1, NPS, 0.188",
    182, "8, -1, NPS, 0.219", 183, "8, -1, NPS, 0.25", 184, "8, -1, NPS, 0.322",
    187, "10, -1, NPS, 0.188", 188, "10, -1, NPS, 0.203",
    189, "10, -1, NPS, 0.219", 190, "10, -1, NPS, 0.279", 191, "10, -1, NPS, 0.365",
    193, "12, -1, NPS, 0.219", 194, "12, -1, NPS, 0.25",
    195, "12, -1, NPS, 0.312", 196, "12, -1, NPS, 0.375", 197, "14, -1, NPS, 0.209",
    198, "14, -1, NPS, 0.25", 199, "14, -1, NPS, 0.375",
    200, "14, -1, NPS, 0.625", 201, "14, -1, NPS, 0.687", 202, "14, -1, NPS, 0.938",
    203, "15, -1, NPS, 0.209", 204, "15, -1, NPS, 0.25",
    205, "16, -1, NPS, 0.188", 206, "16, -1, NPS, 0.219", 207, "16, -1, NPS, 0.225",
    208, "16, -1, NPS, 0.243", 209, "16, -1, NPS, 0.25",
    210, "16, -1, NPS, 0.26", 211, "16, -1, NPS, 0.27", 212, "16, -1, NPS, 0.28",
    213, "16, -1, NPS, 0.312", 214, "16, -1, NPS, 0.325",
    215, "16, -1, NPS, 0.345", 216, "16, -1, NPS, 0.357", 217, "16, -1, NPS, 0.365",
    218, "16, -1, NPS, 0.375", 219, "16, -1, NPS, 0.406",
    220, "16, -1, NPS, 0.5", 221, "16, -1, NPS, 0.53", 222, "16, -1, NPS, 0.55",
    223, "16, -1, NPS, 0.56", 224, "16, -1, NPS, 0.625",
    225, "16, -1, NPS, 0.656", 226, "16, -1, NPS, 0.843", 227, "16, -1, NPS, 1.039",
    228, "16, -1, NPS, 1.125", 229, "16, -1, NPS, 1.218",
    230, "16, -1, NPS, 1.438", 231, "16, -1, NPS, 1.594", 232, "18, -1, NPS, 0.219",
    233, "18, -1, NPS, 0.25", 234, "18, -1, NPS, 0.312",
    235, "18, -1, NPS, 0.344", 236, "18, -1, NPS, 0.375", 237, "18, -1, NPS, 0.406",
    238, "18, -1, NPS, 0.5", 239, "18, -1, NPS, 0.75",
    240, "18, -1, NPS, 0.938", 241, "18, -1, NPS, 1.125", 242, "18, -1, NPS, 1.156",
    243, "18, -1, NPS, 1.375", 244, "18, -1, NPS, 2.1",
    245, "20, -1, NPS, 0.219", 246, "20, -1, NPS, 0.234", 247, "20, -1, NPS, 0.25",
    248, "20, -1, NPS, 0.265", 249, "20, -1, NPS, 0.281",
    250, "20, -1, NPS, 0.288", 251, "20, -1, NPS, 0.312", 252, "20, -1, NPS, 0.328",
    253, "20, -1, NPS, 0.344", 254, "20, -1, NPS, 0.375",
    255, "20, -1, NPS, 0.406", 256, "20, -1, NPS, 0.438", 257, "20, -1, NPS, 0.469",
    258, "20, -1, NPS, 0.5", 259, "22, -1, NPS, 0.219",
    260, "22, -1, NPS, 0.237", 261, "22, -1, NPS, 0.25", 262, "22, -1, NPS, 0.281",
    263, "22, -1, NPS, 0.312", 264, "22, -1, NPS, 0.344",
    265, "22, -1, NPS, 0.371", 266, "22, -1, NPS, 0.375", 267, "22, -1, NPS, 0.432",
    268, "22, -1, NPS, 0.438", 269, "22, -1, NPS, 0.5",
    270, "22, -1, NPS, 0.562", 271, "22, -1, NPS, 0.625", 272, "24, -1, NPS, 0.25",
    273, "24, -1, NPS, 0.265", 274, "24, -1, NPS, 0.271",
    275, "24, -1, NPS, 0.281", 276, "24, -1, NPS, 0.289", 277, "24, -1, NPS, 0.307",
    278, "24, -1, NPS, 0.312", 279, "24, -1, NPS, 0.32",
    280, "24, -1, NPS, 0.344", 281, "24, -1, NPS, 0.375", 282, "24, -1, NPS, 0.382",
    283, "24, -1, NPS, 0.391", 284, "24, -1, NPS, 0.406",
    285, "24, -1, NPS, 0.5", 286, "24, -1, NPS, 0.562", 287, "24, -1, NPS, 0.625",
    288, "24, -1, NPS, 1.531", 289, "26, -1, NPS, 0.25",
    290, "26, -1, NPS, 0.264", 291, "26, -1, NPS, 0.278", 292, "26, -1, NPS, 0.281",
    293, "26, -1, NPS, 0.291", 294, "26, -1, NPS, 0.312",
    295, "26, -1, NPS, 0.344", 296, "26, -1, NPS, 0.375", 297, "26, -1, NPS, 0.438",
    298, "26, -1, NPS, 0.5", 299, "30, -1, NPS, 0.25",
    300, "30, -1, NPS, 0.281", 301, "30, -1, NPS, 0.287", 302, "30, -1, NPS, 0.312",
    303, "30, -1, NPS, 0.328", 304, "30, -1, NPS, 0.337",
    305, "30, -1, NPS, 0.344", 306, "30, -1, NPS, 0.35", 307, "30, -1, NPS, 0.365",
    308, "30, -1, NPS, 0.375", 309, "30, -1, NPS, 0.391",
    310, "30, -1, NPS, 0.406", 311, "30, -1, NPS, 0.417", 312, "30, -1, NPS, 0.421",
    313, "30, -1, NPS, 0.428", 314, "30, -1, NPS, 0.43",
    315, "30, -1, NPS, 0.437", 316, "30, -1, NPS, 0.438", 317, "30, -1, NPS, 0.45",
    318, "30, -1, NPS, 0.469", 319, "30, -1, NPS, 0.5",
    320, "30, -1, NPS, 0.562", 321, "30, -1, NPS, 0.563", 322, "30, -1, NPS, 0.593",
    323, "30, -1, NPS, 0.625", 324, "30, -1, NPS, 0.75",
    325, "34, -1, NPS, 0.375", 326, "34, -1, NPS, 0.416", 327, "34, -1, NPS, 0.438",
    328, "34, -1, NPS, 0.469", 329, "34, -1, NPS, 0.5",
    330, "34, -1, NPS, 0.524", 331, "34, -1, NPS, 0.562", 332, "34, -1, NPS, 0.566",
    333, "34, -1, NPS, 0.6", 334, "34, -1, NPS, 0.628",
    335, "34, -1, NPS, 0.75", 336, "34, -1, NPS, 0.754", 337, "34, -1, NPS, 0.875",
    338, "34, -1, NPS, 1.25", 339, "36, -1, NPS, 0.312",
    340, "36, -1, NPS, 0.322", 341, "36, -1, NPS, 0.344", 342, "36, -1, NPS, 0.375",
    343, "36, -1, NPS, 0.391", 344, "36, -1, NPS, 0.406",
    345, "36, -1, NPS, 0.422", 346, "36, -1, NPS, 0.428", 347, "36, -1, NPS, 0.438",
    348, "36, -1, NPS, 0.453", 349, "36, -1, NPS, 0.469",
    350, "36, -1, NPS, 0.484", 351, "36, -1, NPS, 0.5", 352, "36, -1, NPS, 0.525",
    353, "36, -1, NPS, 0.562", 354, "36, -1, NPS, 0.594",
    355, "42, -1, NPS, 0.625", 356, "42, -1, NPS, 0.75", 357, "42, -1, NPS, 0.375",
    358, "42, -1, NPS, 0.5", 359, "42, -1, NPS, 0.688");

//Format component info for a single component size
var ComponentInfo;
var result;
function SingleComponentFormatter(Component){
    ComponentInfo = Split(Component,",");
    result = ComponentInfo[0] + TextFormatting.DoubleQuote +  
    ComponentInfo[2] + " SDR" + ComponentInfo[1];
    //console (result);
    return (result);
};
    
//Decode characters from base62, convert to base10    
function ConvertFromBase62(input){
    var x = 0;
    for (var z=0;z<Count(input);z++) {
      x = x * Count(base62) + Find(Mid(input,z,1), base62);
    };
    return x;
};

var x = ConvertFromBase62(ComponentSize);

var C1FACTOR = (x - 1) / 378;

// determine if the component has multiple sizes
if (hasKey(d, C1FACTOR)){
    //return single component size
    return SingleComponentFormatter(d[C1FACTOR]);
}
else{
    // Need to find and report both component sizes
    var C2Start;
    var C1Candidate;
    
    For(C1Candidate=1; C1Candidate<378; C1Candidate++){
        C2Start = C1Candidate + 1;
        var C2Candidate;
        var C1VALUESET;
        var C2VALUESET;
        var SIZECODECandidate;
        For(C2Candidate=C2Start; C2Candidate<378; C2Candidate++){
            SIZECODECandidate = (C1Candidate * 378) + (C2Candidate + 1)
             if(SIZECODECandidate == x){
                C1VALUESET = d[Text(C1Candidate)];
                C2VALUESET = d[Text(C2Candidate)];

                // assemble and return formatted component string
                return SingleComponentFormatter(C2VALUESET) + 
                " x " + SingleComponentFormatter(C1VALUESET);
                }
        };
    };
}
```

## Example output

See [this web map](https://www.arcgis.com/home/webmap/viewer.html?webmap=e45ac63435f247fa895347ef77894d03&extent=-88.1198,41.8638,-88.1183,41.8646) for examples of how to use this expression in ArcGIS Online.

[![barcode expressions](./images/barcode-expressions.png)]
