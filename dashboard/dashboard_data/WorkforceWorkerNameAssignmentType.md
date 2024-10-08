# ArcGIS Workforce: Obtain the the worker name & description of assignment type from a FeatureSet

This expression obtains the worker name and description of assignment type using the Dashboard Data profile used to create FeatureSets in ArcGIS Dashboards.
This expression provides the ability to filter the assignments by worker name or assignment name. With the default schema, this is not an option, since the field type is GUID.

Potential changes you will likely need to tailor it for your implementation:

1. Check/change config settings (lines 12-16)

2. Fields returned from Assignments layer (line 24)
3. Assignments layer filter (line 25) -- more records may impact performance, so filtering here instead of in the Dashboard element can be beneficial

```js
function getTableValue(features, matchValue, matchField, returnFieldName){
    // Loop through features, return the field name
    for (var f in features){
        if (f[matchField] == matchvalue){
            return f[returnFieldName]
        }
    }
    return "N/A"
}
// Configurations
var cfg = {
    "portal_url":"https://<your-portal>.com",
    "wf_project_id":"<your-wf-project-id>",
    "assignments_lyr_ndx":<int>,
    "assignments_type_lyr_ndx":<int>,
    "worker_lyr_ndx": <int>
}
// Set variables
var p = Portal(cfg.portal_url)
var wrkrs_fs = FeatureSetByPortalItem(p, cfg.wf_project_id, cfg.worker_lyr_ndx, ['globalid','name'])
var workers = Filter(wrkrs_fs, '1=1')
var assignment_types_table = FeatureSetByPortalItem(p, cfg.wf_project_id, cfg.assignments_type_lyr_ndx, ['GlobalID', 'description'])
var assignment_types = Filter(assignment_types_table, '1=1')
var assignments_table = FeatureSetByPortalItem(p, cfg.wf_project_id, cfg.assignments_lyr_ndx, ['description','workerid','assignmenttype','notes','location'])
var assigned = Filter(assignments_table, "status = 1")
var s = Schema(assigned)
var sFldCount = Count(s.fields)
var newFldCount = sFldCount
s.fields[newFldCount] = {'name':'worker_name','type': 'esriFieldTypeString'}
s.fields[newFldCount+1] = {'name':'assignment_name','type': 'esriFieldTypeString'}
var returnFS = {
    fields: s.fields,
    geometryType: "",
    features: [],
}

// Loop through assigned, return FeatureSet
for (var a in assigned){
    var t = {}
    for (var f in a){
        t[f] = a[f]
    }
    var n = getTableValue(workers, a.workerid, 'globalid', 'name')
    t["worker_name"] = n
    var at = getTablevalue(assignment_types, a.assignmenttype, 'GlobalID', 'description')
    t["assignment_name"] = at

    Push(returnFS.features, {'attributes':t})
}
return FeatureSet(returnFS)
```

The resulting data can be visualized in a serial chart element using the 'Categories from Features' configuration.

![](./images/workforce-worker-name-assignment-type.png)


_Note for Enterprise users: Prior to Enterprise 11.2, the FeatureSet() function does not accept dictionaries. You must wrap the dictionary with a Text() function: FeatureSet(Text(dict)). Additionally, dates need to be in EPOCH and can be converted by wrapping them with the Number() function: Number(Now()). For more information see https://community.esri.com/t5/arcgis-dashboards-blog/dashboard-data-expressions-what-has-changed-june/bc-p/1299698_

At line 40, when you loop through the assigned you will have to use the following:

```js
for (var f in a){
        if (TypeOf(a[f]) == 'Date'){
            // Convert date fields to Unix Timestamp
            t[f] = Number(a[f])
        } else{
            t[f] = a[f]
        }
    }
```

At line 50, you will have to covert the dictionary to text based JSON:
```js
return FeatureSet(Text(returnFS))
```