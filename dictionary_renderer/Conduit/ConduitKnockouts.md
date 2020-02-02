# Display Knock Out

This script uses attributes with the number of tubes on the x and y to draw a symbol for each knockout.  A symbol per each
tube is required in the sytlex file, with a unique primitive name.  A python script is provided that will copy one
symbol the required number of times.  The ConduitKnockouts.stylx has a point symbol copied and id'ed 1000 times.

## Use cases

Knock out walls in a man hole

## Workflow

### Use the sample
- Open ArcGIS Pro
- Add the Feature Class from ConduitExample.gdb
- Open the symbology tab and select dictionary renderer
- Select ConduitKnockouts.stylx
- Match the fields

### Create your own
- Using ArcGIS Pro create a mobile style and follow the steps to enable it as a dictionary renderer using the configuration and script below
- Add a new symbol to the style
- Open CopySymbol.py and modify the variables to match your paths and the key of the symbol to copy
- A version of the stylex file will be created with the new symbols

## Dictionary Configuration

```json
{
  "configuration": [{
      "name": "colors",
      "value": "LIGHT",
      "domain": ["LIGHT", "MEDIUM", "DARK"],
      "info": "color themes for frame fills"
    }
  ],
  "symbol": ["NumTubesX","NumTubesY"],
  "text": []
}

```
## Dictionary Script

```js
// Set the spacing to match your symbols
var x_spacing = 16;
var y_spacing = 16;

// Get the values from the feature, return 0 when not set
var tubes_y = DefaultValue($feature.NumTubesY, 0);
var tubes_x = DefaultValue($feature.NumTubesX, 0);

// Return keys
var keys = "";

// Total points added, used for indexing of symbols
var total_points = 0;

// Return default symbol when fields not defined or value not set in field
if (tubes_x == 0 || tubes_y == 0) {
    return "ConduitPoint_0";
}

// If only one row, center
var start_x = 0;
if (tubes_x > 1) {
    start_x = 0 - (x_spacing * (tubes_x - 1) / 2);
}
var start_y = 0;
if (tubes_y > 1) {
    start_y = 0 - (y_spacing * (tubes_y - 1) / 2);
}
// Loop over rows and columns and add symbol for each
var current_y = start_y;
for (var v = 0; v < tubes_y; v++) {
    var current_x = start_x;
    for (var h = 0; h < tubes_x; h++) {
        if (keys == "") {
            keys = 'ConduitPoint_' + total_points;
        } else {
            keys += ';ConduitPoint_' + total_points;
        }
        keys += ';po:' + 'Conduit_' + total_points + '|OffsetX|' + current_x;
        keys += ';po:' + 'Conduit_' + total_points + '|OffsetY|' + current_y;
        current_x += x_spacing;
        total_points += 1;
    }
    current_y += y_spacing;
}
// return keys
return keys;

```