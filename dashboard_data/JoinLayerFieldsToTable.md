# Join attributes from a layer to a table

This expression reads two layers & adds attributes from one to the other based on a shared ID. Typically this same operation would be completed through a dynamic join using hosted feature layers as described here: 
https://doc.arcgis.com/en/arcgis-online/analyze/join-features.htm

In cases where the dynamic join isnt possible (i.e. you are not the owner of the layers, you're pulling data from Portal into ArcGIS Online, etc) this workflow could be used inside a Dashboard data expression to add attributes from the source layer to the target.

## Example Expression

```javascript
var portal = Portal("https://www.arcgis.com/");
var polyfs = FeatureSetByPortalItem(portal,"4dbbad3d6f694e0ebc7c3b4132ea34df",0,["*"],false);
var tablefs = FeatureSetByPortalItem(portal,"4dbbad3d6f694e0ebc7c3b4132ea34df",6,["*"],false);

var joinedDict = {
  fields: [
    { name: "FeatureID", type: "esriFieldTypeString" },
    { name: "Name", type: "esriFieldTypeString" },	
    { name: "ModelID", type: "esriFieldTypeInteger" },
    { name: "AddressCount", type: "esriFieldTypeInteger" },
    { name: "MAX_TSTime", type: "esriFieldTypeString" },
  ],
'geometryType': '',
'features':[]};

var i = 0;
for (var t in tablefs) {
    var tableID = t["FeatureID"]
    for (var p in Filter(polyfs, "HydroID = "+tableID)){
        joinedDict.features[i] = {
            attributes: {
                FeatureID: tableID,
                Name: p["DPS_Region"],
				ModelID: t["ModelID"],
                AddressCount: t["AddressCount"],
                MAX_TSTime: t["MAX_TSTime"],
            }
        }
    }
i++
}

// Return dictionary cast as a feature set 
return FeatureSet(Text(joinedDict));
```
