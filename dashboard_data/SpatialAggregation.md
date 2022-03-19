# Aggregate by Spatial Relationship

This expression aggregates data from one layer using a spatial relationship with data from a second layer.

In this specific example, point features ([Global Power Plants](https://www.arcgis.com/home/item.html?id=848d61af726f40d890219042253bedd7)) are being aggregated by polygons ([Time Zones](https://www.arcgis.com/home/item.html?id=312cebfea2624e108e234220b04460b8)) using the **Contains** function.

Please note: including spatial information can severely impact performance, depending on the size of the layer and the type of operation performed.

```js
// Portal
var portal = Portal('https://www.arcgis.com/');

// Create FeatureSet for polygons
var poly_fs = FeatureSetByPortalItem(
    portal,
    '312cebfea2624e108e234220b04460b8',
    0,
    ['ZONE'],
    true
);

// Create Featureset for points
var pt_fs = FeatureSetByPortalItem(
    portal,
    '848d61af726f40d890219042253bedd7',
    0,
    ['capacity_mw'],
    true
);

// Create dict for output FeatureSet
var out_dict = {
    fields: [
        {name: 'tz', alias: 'Time Zone', type: 'esriFieldTypeString'},
        {name: 'pt_cnt', alias: 'Number of Power Plants', type: 'esriFieldTypeInteger'}
    ],
  geometryType: '',
  features: []
};

// Iterate over time zones
for (var poly in poly_fs) {

    // Filter points by polygon
    var pts = Contains(poly, pt_fs);

    // Push feature to dict
    Push(
        out_dict['features'],
        {
            attributes: {
                tz: poly['ZONE'],
                pt_cnt: Count(pts)
            }
        }
    )
}

// Convert dictionary to feature set.
return FeatureSet(Text(out_dict));
```

We can use this expression to create a serial chart or list that shows the number of points per polygon. Simple modifications to this expression can add additional statistics, such as **Sum**, **Average**, and the like.

![Serial chart](/dashboard_data/images/SpatialAggregation(SerialChart).png)
