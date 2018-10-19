# Match Pop-up to Map Value

This expression matches the pop-up text color to the map. For example, if a layer in your map is symbolized by different colors, your pop-up text will change depending on which feature you select. 

## Use cases

Matching your pop-up text to the map color further emphasizes the difference between each feature. The example below shows a map of tornadoes scaled between 0 and 5. Each tornado has a different color depending on its Fujita scale. The pop-up matches the same colors of each scale shown in the map. F5 tornadoes cause the most damage and is shown as a dark red symbol in the map and the text is dark red in the pop-up further emphasizing the severity. The F0 tornadoes are the weakest and is shown as a gray symbol in the map and the text is gray in the pop-up which demphasizes its severity.

## Workflow

Copy and paste the expression found in the expression template below to 
the pop-up Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or
the relevant location in a custom app.

To configure the script to your layer, you must fill in the field name with your layer's field name of interest and modify the categories and font color to the colors in your map.

For example, in a layer containing fields for hurricane magnitue, you would replace this:

```js
var fujita = $feature["F_SCALE"]

When (fujita == 0, "#999999", fujita == 1, "#F9B152",
fujita == 2, "#FC943F", fujita == 3, "#FC713F",
fujita == 4, "#F23835", fujita == 5, "#A80000", null)
```

With something like the following:

```js
var wind = $feature.windspeed

When(wind == 10, "#abcdd8", wind == 20, "#a6cddb", wind == 30, "#A5CBDC", 
wind == 40, "#9EBCCE", wind == 50, "#9EACBD", wind == 60, "#A49BA7",
wind == 70, "#BD6D6D", wind == 80, "#BD6D6D", wind == 90, "#CA4E4A",
wind == 100, "#CD292A", null)

```
## HTML Template

Next you will need to configure the pop-up with a custom attribute display. Click the View HTML source button and add the following HTML. You will want to update the expression references to correspond to the expression you created above. Add the expression to your font color in the html.

```html
<font size="4">This was an </font><font size="5"><b><font color="{expression/expr0}" style="">F{F_SCALE}</font></b> </font><font size="4">tornado.</font>

```

## Expression Template
Create a variable then use a When function to set a hex value to each Fujita scale betweeon 0 and 5.
```js
//Create a variable that represents a field of interest
vavar variablename = $feature["YOUR_FIELD_NAME"]

//When the variable value is equal to a certain category, return a specific hex value
When (variablename == insert value here, "#inserthexvaluehere", variablename == insert value here, "#inserthexvaluehere",
variablename == insert value here, "#inserthexvaluehere",variablename == insert value here, "#inserthexvaluehere",
variablename == insert value here, "#inserthexvaluehere", variablename == insert value here, "#inserthexvaluehere", null)
```

## Example output

See [this web map](https://urbanobservatory.maps.arcgis.com/home/webmap/viewer.html?webmap=52621fa7be0a46d69f167538310c6d0b) for examples of how to use this expression in ArcGIS Online. F5 tornadoes are shown in dark red while F0 tornadoes are shown in gray. All pop-ups match the symbol color.

[![Kansas Tornadoes](https://i.imgur.com/MvY8ywi.jpg)](https://urbanobservatory.maps.arcgis.com/home/webmap/viewer.html?webmap=52621fa7be0a46d69f167538310c6d0b)
