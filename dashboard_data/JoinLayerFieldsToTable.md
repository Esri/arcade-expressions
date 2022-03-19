# Join attributes from a layer to a table

This expression reads two layers & adds attributes from one to the other based on a shared ID. Typically this same operation would be completed through a dynamic join using hosted feature layers as described here:
https://doc.arcgis.com/en/arcgis-online/analyze/join-features.htm

In cases where the dynamic join isn't possible (i.e. you are not the owner of the layers, you're pulling data from Portal into ArcGIS Online, etc) this workflow could be used to add attributes from the source layer to the target.

## Example Expression

```js
// Portal connection
var portal = Portal("https://www.arcgis.com/");

// Get Polygon layer
var polyfs = FeatureSetByPortalItem(
    portal,
    "4dbbad3d6f694e0ebc7c3b4132ea34df",
    0,
    ["*"],
    false
);

var tablefs = FeatureSetByPortalItem(
    portal,
    "4dbbad3d6f694e0ebc7c3b4132ea34df",
    6,
    ["*"],
    false
);

// Create dict to hold output features
var joinedDict = {
    fields: [
        {name: "FeatureID", type: "esriFieldTypeString"},
        {name: "Name", type: "esriFieldTypeString"},
        {name: "ModelID", type: "esriFieldTypeInteger"},
        {name: "AddressCount", type: "esriFieldTypeInteger"},
        {name: "MAX_TSTime", type: "esriFieldTypeString"}
    ],
    geometryType: '',
    features: []
};

// Populate Feature Array
for (var t in tablefs) {

    // Get matching features based on ID
    var poly_filtered = Filter(
        polyfs,
        `HydroID = ${t["FeatureID"]}`
    )

    // Push features into dict
    for (var p in poly_filtered){
        Push(
            joinedDict,
            {
                attributes: {
                    FeatureID: tableID,
                    Name: p["DPS_Region"],
                    ModelID: t["ModelID"],
                    AddressCount: t["AddressCount"],
                    MAX_TSTime: t["MAX_TSTime"]
                }
            }
        )
    }
}

// Return dictionary cast as a feature set
return FeatureSet(Text(joinedDict));
```

Bringing additional attributes into our main layer by a shared ID allows us to combine data we would otherwise not be able to, as in the following chart. Note that the `DPS_Region` field comes from the polygon layer, while the `ModelID` and `AddressCount` fields come from the tabular layer.

![](/dashboard_data/images/JoinLayerFieldsToTable.png)
