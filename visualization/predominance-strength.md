# Strength of Predominance

Returns the value of a the winning (or predominant) field as a percentage 
of the total value (or share) among a set of competing number fields. For example, if a layer contains three 
fields for vote totals (e.g. Republican, Democrat, Other), the strength of the predominance 
will be the value of the winner divided by all categories combined. For example, in an election map, if a Republican wins a county with 55% of the vote, then the value returned by this expression will be `55`. This should be used in
conjunction with a predominance visualization.

Read the [Creating a predominance visualization with Arcade](https://blogs.esri.com/esri/arcgis/2017/05/23/creating-a-predominance-visualization-with-arcade/) blog post from
the ArcGIS blog for more information.

## Use cases

Calculating the strength of predominance is useful for providing more detail in a predominance visualization. If creating a visualization in ArcGIS Online, this is particularly powerful for driving the opacity of the features alongside a predominance visualization.

For example, in an election map, the feature can be shaded with a certain color to represent the winner of the vote for the given area. The strength of predominance helps show how convincing the victory is. When applied to an opacity ramp, low values will make the feature more transparent, and high values will make it more opaque. That way if a candidate won a highly populated county by only one vote, then the color of the feature will be virtually indiscernible, indicating it wasn't a convincing victory, but hotly contested.

While common in the visualization profile, this expression may be used in the popup and labeling profiles as well.

## Workflow

Copy and paste the expression found in the expression template below to 
the Arcade editor in ArcGIS Online, the relevant location in ArcGIS Pro, or
the relevant location in a custom app.

To configure the script to your layer, you must construct an array of field values
referenced using the `$feature` global.

For example, in a layer representing U.S. counties containing voting data from the 2016 U.S. 
presidential election, you would replace this:

```js
var fields = [
  $feature.FIELD_NAME_1,
  $feature.FIELD_NAME_2
  // e.g. $feature.CATEGORY3_A + $feature.CATEGORY3_B,
  // $feature.CATEGORY4

  // ADD MORE FIELDS AS NECESSARY
];
```

With something like the following:

```js
var fields = [
  $feature.REPUBLICAN_VOTES,
  $feature.DEMOCRAT_VOTES,
  $feature.OTHER_VOTES
];
```

## Expression Template

```js
// The fields from which to calculate predominance
// Each item in the array must reference a field global variable
// OR an arcade expression that returns a number
// Replace the field names in ALL CAPS with
// the competing fields in your layer

var fields = [
  $feature.FIELD_NAME_1,
  $feature.FIELD_NAME_2
  // e.g. $feature.CATEGORY3_A + $feature.CATEGORY3_B,
  // $feature.CATEGORY4

  // ADD MORE FIELDS AS NECESSARY
];

// Returns the strength of the predominant field as a
// percentage of all fields.

var winner = Max(fields);
var total = Sum(fields);
return (winner/total)*100;
```

## Example output
