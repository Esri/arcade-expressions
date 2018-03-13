
# Return the top values of a list

Returns the top X values (and what they represent) from a list of number fields.

## Use cases

This is designed specifically for the popup profile. If several competing number fields exist in a feature layer, this will output the top 3 fields with their values to be displayed in the popup. The number of top values to display can easily be configured in the expression.

## Workflow

Copy and paste the expression found in the expression template below to 
the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or
the relevant location in a custom app.

To configure the script to your layer, you must construct an array of objects 
referring to competing **number** field values. Then 
describe the field using the text of the `alias` property.

For example, in a layer representing U.S. counties containing the population
of people from various Asian countries, you would replace this:

```js
var groups = [
  { value: $feature.FIELD_NAME_1, alias: "FIELD NAME 1 ALIAS"},
  { value: $feature.FIELD_NAME_2, alias: "FIELD NAME 2 ALIAS"},
  { value: $feature.FIELD_NAME_3, alias: "FIELD NAME 3 ALIAS"},
  { value: $feature.FIELD_NAME_4, alias: "FIELD NAME 4 ALIAS"},
  { value: $feature.FIELD_NAME_5, alias: "FIELD NAME 5 ALIAS"}

  // ADD MORE FIELDS AS NECESSARY
];
```

With something like the following:

```js
var groups = [
  {value: $feature.HD01_VD02, alias: "Asian Indian"},
  {value: $feature.HD01_VD03, alias: "Bangladeshi"},
  {value: $feature.HD01_VD04, alias: "Bhutanese"},
  {value: $feature.HD01_VD05, alias: "Burmese"},
  {value: $feature.HD01_VD06, alias: "Cambodian"},
  {value: $feature.HD01_VD07, alias: "Chinese (except Taiwanese)"},
  {value: $feature.HD01_VD08, alias: "Filipino"},
  {value: $feature.HD01_VD09, alias: "Hmong"},
  {value: $feature.HD01_VD10, alias: "Indonesian"},
  {value: $feature.HD01_VD11, alias: "Japanese"},
  {value: $feature.HD01_VD12, alias: "Korean"},
  {value: $feature.HD01_VD13, alias: "Laotian"},
  {value: $feature.HD01_VD14, alias: "Malaysian"},
  {value: $feature.HD01_VD15, alias: "Mongolian"},
  {value: $feature.HD01_VD16, alias: "Nepalese"},
  {value: $feature.HD01_VD17, alias: "Okinawan"},
  {value: $feature.HD01_VD18, alias: "Pakistani"},
  {value: $feature.HD01_VD19, alias: "Sri Lankan"},
  {value: $feature.HD01_VD20, alias: "Taiwanese"},
  {value: $feature.HD01_VD21, alias: "Thai"},
  {value: $feature.HD01_VD22, alias: "Vietnamese"},
  {value: $feature.HD01_VD23, alias: "Other Asian, specified"},
  {value: $feature.HD01_VD24, alias: "Other Asian, not specified"}
];
```

## Expression Template

```js
var numTopValues = 3;

var groups = [
  { value: $feature.FIELD_NAME_1, alias: "FIELD NAME 1 ALIAS"},
  { value: $feature.FIELD_NAME_2, alias: "FIELD NAME 2 ALIAS"},
  { value: $feature.FIELD_NAME_3, alias: "FIELD NAME 3 ALIAS"},
  { value: $feature.FIELD_NAME_4, alias: "FIELD NAME 4 ALIAS"},
  { value: $feature.FIELD_NAME_5, alias: "FIELD NAME 5 ALIAS"}

  // ADD MORE FIELDS AS NECESSARY
];

function getValuesArray(a){
  var valuesArray = []
  for(var i in a){
    valuesArray[i] = a[i].value;
  }
  console(valuesArray);
  return valuesArray;
}

function findAliases(top5a,fulla){
  var aliases = [];
  var found = "";
  for(var i in top5a){
    for(var k in fulla){
      if(top5a[i] == fulla[k].value && Find(fulla[k].alias, found) == -1){
        found += fulla[k].alias;
        aliases[Count(aliases)] = {
          alias: fulla[k].alias,
          value: top5a[i]
        };
      }
    }
  }
  return aliases;
}
 
function getTopGroups(groupsArray){
    
  var values = getValuesArray(groupsArray);
  var top5Values = IIF(Max(values) > 0, Top(Reverse(Sort(values)),numTopValues), "no Asians live here");
  var top5Aliases = findAliases(top5Values,groupsArray);
    
  if(TypeOf(top5Values) == "String"){
    return top5Values;
  } else {
    var content = "";
    for(var i in top5Aliases){
      content += (i+1) + ". " + top5Aliases[i].alias + " - " + Text(top5Aliases[i].value, "#,###");
      content += IIF(i < numTopValues-1, TextFormatting.NewLine, "");
    }
  }
    
  return content;
}
 
getTopGroups(groups);
```

## Example output

See [this webmap](https://jsapi.maps.arcgis.com/home/webmap/viewer.html?webmap=1add0bb044974d558f263ea468710aad) for examples of how to use this expression in ArcGIS Online.

[![top-5](./images/top-5.png)](https://jsapi.maps.arcgis.com/home/webmap/viewer.html?webmap=1add0bb044974d558f263ea468710aad)