# Set Ms to Index

This is an example of how to modify the M's of a feature.  This can be used to set the m's to an index

## Use cases

In an electric network, exporting lines to other packages might need a index for segments between vertexes

## Workflow

Using ArcGIS Pro, use the Add Attribute Rule geoprocessing tool to define this rule on a feature class and optionally on a subtype in that feature class.  Use the following values when defining the rule, the other options are not required or depend on your situation.
  
  - **Rule Type:** Calculation
  - **Triggering Events:** Update, Insert

## Expression Template

This Arcade expression will set the M's
```js
var current_line_geo = Geometry($feature);

var line_geo =  Dictionary(Text(current_line_geo));
var paths = line_geo['paths'];
var max_m = -1;
var shape_updated = false;
for (var path_idx in paths){
    for (var vert_idx in paths[path_idx])
    {
        var coords = paths[path_idx][vert_idx];
        if (!IsEmpty(coords[3])){
            max_m = iif(coords[3]>max_m,coords[3],max_m);
        }

    }
}
for (var path_idx in paths){
    for (var vert_idx in paths[path_idx])
    {

        if (IsEmpty(paths[path_idx][vert_idx][3])){
            max_m++;
            paths[path_idx][vert_idx][3] = max_m;
            shape_updated = true
        }

    }
}
if (!shape_updated){
    return
}
return {
    "result": {"geometry": Polyline(line_geo)}
};

```
