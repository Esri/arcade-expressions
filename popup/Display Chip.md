# Display Chit

This expression can be used to add a tag to a pop up similar to the [Calcite Components Chip](https://developers.arcgis.com/calcite-design-system/components/chip/).

## Use cases

This is best used in the webmap pop up to style one or multiple catagorical identifiers for quick reference. This expression will automatically generate the html needed to create the chit(s) and ensure they are placed on one line

## Workflow

1) Copy the epxression below into an arcade element
2) Modify the field to match your data and the color variables to fir your popup's styling
3) As necessary, repeate line 9 to add more chips

## Expression Template

```js
var text_ = $feature.YOURFIELD //Field used for display text
var textcolor = "##F8F8F8"  //Text color for the chip
var backgroundcolor = "#007AC2" //background color for the chip


var chips = `<div style="display:table-row;width:100%;">`

//Repeat the next line as many times as needed for multiple chips. 
chips += `<div style="display:inline-block;height:8%;vertical-align:middle;background:${backgroundcolor};border-radius:25px;padding:5px 8px;text-align:center;margin: 2px;color:${textcolor}">${text_} </div>`

chips +=`</div>`

return { 
	type : 'text', 
	text : `<div>
		${chips}
</div>
`
}
```

## Example output

The output of this expression will be one or more chips displayed on your popup. 

