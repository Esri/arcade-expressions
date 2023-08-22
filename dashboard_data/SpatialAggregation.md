# Aggregate by Spatial Relationship

This expression aggregates data from one layer using a spatial relationship with data from a second layer.

In this specific example, point features ([Global Power Plants](https://www.arcgis.com/home/item.html?id=848d61af726f40d890219042253bedd7)) are being aggregated by polygons ([Time Zones](https://www.arcgis.com/home/item.html?id=312cebfea2624e108e234220b04460b8)) using the **Contains** function.

_Note for Enterprise users: Prior to Enterprise 11.2, the FeatureSet() function does not accept dictionaries. You must wrap the dictionary with a Text() function: FeatureSet(Text(dict)). Additionally, dates need to be in EPOCH and can be converted by wrapping them with the Number() function: Number(Now()). For more information see https://community.esri.com/t5/arcgis-dashboards-blog/dashboard-data-expressions-what-has-changed-june/bc-p/1299698_

```js
// Portal
var portal = Portal('https://www.arcgis.com/');

// Create FeatureSet for polygons
var poly_fs = FeatureSetByPortalItem(
    portal,
    '312cebfea2624e108e234220b04460b8',
    0,
    [
        'ZONE'
    ],
    true
);

// Create Featureset for points
var pt_fs = FeatureSetByPortalItem(
    portal,
    '848d61af726f40d890219042253bedd7',
    0,
    [
        'capacity_mw'
    ],
    true
);

// Create empty feature array and feat object for output
var features = [];
var feat;

// Iterate over time zones
for (var poly in poly_fs) {
    
    // Filter points by polygon
    var pts = Contains(poly, pt_fs);
    
    // Create feature with aggregated values
    feat = { 
        'attributes': { 
            'tz': poly['ZONE'], 
            'pt_cnt': Count(pts)
        }
    };
    
    // Push feature into array
    Push(features, feat);
};

// Create dict for output FeatureSet
var out_dict = { 
    'fields': [
        {'name': 'tz', 'alias': 'Time Zone', 'type': 'esriFieldTypeString'},
        {'name': 'pt_cnt', 'alias': 'Number of Power Plants', 'type': 'esriFieldTypeInteger'}
    ],
  'geometryType': '', 
  'features': features 
}; 

// Convert dictionary to feature set. 
return FeatureSet(out_dict); 
```

We can use this expression to create a serial chart or list that shows the number of points per polygon. Simple modifications to this expression can add additional statistics, such as **Sum**, **Average**, and the like.

![Serial chart](/dashboard_data/images/SpatialAggregation(SerialChart).png)
