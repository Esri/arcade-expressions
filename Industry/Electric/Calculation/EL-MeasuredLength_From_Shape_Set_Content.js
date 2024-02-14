// Assigned To: ElectricLine
// Type: Calculation
// Name: MeasuredLength From Shape and Content-EL
// Description: Calculate MeasureLength field using length of line in specified units. Pass value to any Edge/Junction Objects if they exist.
// Subtypes: All
// Trigger: Insert, Update
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - SL-MeasuredLength From Shape and Content

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
Expects($feature, 'measuredlength');

// Field in the data model used to store measured length
// ** Implementation Note: This value does not need to change if using the industry data model. Fields need to be
//    declared with dot syntax.
var measured_length_field = "measuredlength";
var measured_length = $feature.measuredlength;
var orig_measured_length = $originalfeature.measuredlength;

// The class name of the content objects. MeasuredLength value will be pushed to any content of Line.
// ** Implementation Note: This is just the class name and should not be fully qualified. Adjust this only if class name differs.
var contained_edge_class = "ElectricEdgeObject";
var contained_edge_fs = FeatureSetByName($datastore, "ElectricEdgeObject", ['globalid'], false);
var contained_junction_class = "ElectricJunctionObject";
var contained_junction_fs = FeatureSetByName($datastore, "ElectricJunctionObject", ['globalid'], false);

// Settings for content. contained sql expression.
// ** Implementation Note: Only content features that match sql statement will be used to update $feature attributes.
var contained_edge_sql = "1=1";
var contained_junction_sql = "AssetGroup in (101,102,103,104,105,106,107,108,109)";
// The unit of measure used to calculate length
// ** Implementation Note: Options for Unit of Measure: https://developers.arcgis.com/arcade/function-reference/geometry_functions/#units-reference
var unit_of_measure = 'feet';

// ************* End User Variables Section *************

// *************       Functions            *************

function get_content_ids(feature) {
    // Query to get all the content associations
    var associations = FeatureSetByAssociation(feature, "content");
    // Due to a bug in MGDB, where class name is fully qualified, filter is not used, but can be once resolved
    // var filtered = Filter(associations, "className = @contained_class");
    // loop over all associated records to get a list of IDs
    var associated_edge_ids = [];
	var associated_junction_ids = [];
    for (var row in associations) {
        if (Lower(Split(row.classname,'.')[-1]) == Lower(contained_edge_class)){
            push(associated_edge_ids, row.globalId);
        }
        if (Lower(Split(row.classname,'.')[-1]) == Lower(contained_junction_class)){
            push(associated_junction_ids, row.globalId);
        }
    }
    return [associated_edge_ids,associated_junction_ids];
}

// ************* End Functions Section ******************

// Calculate measuredlength field based on edit context. Do not calculate unless field is null or zero.
var new_measured_length = null;

// On Insert
if ($editContext.editType == 'INSERT') {
    if (IsEmpty(measured_length) || measured_length <= 0) {
        new_measured_length = Length(Geometry($feature), unit_of_measure);
    } else {
        new_measured_length = measured_length;
    }
}

// On Update
if ($editContext.editType == 'UPDATE') {
    if (orig_measured_length != measured_length) {
        // measuredlength field has been manually updated. Pass it to any content containeds.
        new_measured_length = measured_length;
    } else if (IsEmpty(measured_length) || measured_length <= 0) {
        new_measured_length = Length(Geometry($feature), unit_of_measure);
    } else {
        // Never overwrite an existing valid measuredlength value, even if geometry is updated.
        return;
    }
}

// get ids of content objects
var results = get_content_ids($feature);
var edge_content_ids = results[0];
var junction_content_ids = results[1];

var contained_edges_contents = [];
if (Count(edge_content_ids) > 0){
	if (IsEmpty(contained_edge_sql) || contained_edge_sql == '1=1') {
		contained_edges_contents = Filter(contained_edge_fs, "globalid in @edge_content_ids");
	} else {
		contained_edges_contents = Filter(contained_edge_fs, "globalid in @edge_content_ids and " + contained_edge_sql);
	}
}

var contained_junction_contents = [];
if (Count(junction_content_ids) > 0){
	if (IsEmpty(contained_junction_sql) || contained_junction_sql == '1=1') {
		contained_junction_contents = Filter(contained_junction_fs, "globalid in @junction_content_ids");
	} else {
		contained_junction_contents = Filter(contained_junction_fs, "globalid in @junction_content_ids and " + contained_junction_sql);
	}
}
// build return payload
var edge_updates = [];
for (var contained in contained_edges_contents) {
    push(edge_updates, {
        'globalID': contained.globalid,
        'attributes': Dictionary(measured_length_field, new_measured_length)
    });
}


var junction_updates = [];
for (var contained in contained_junction_contents) {
    push(junction_updates, {
        'globalID': contained.globalid,
        'attributes': Dictionary(measured_length_field, new_measured_length)
    });
}


var edit_payload = [];

if (Count(edge_updates) > 0){
	
	Push(edit_payload,{
		'className': contained_edge_class,
        'updates': edge_updates
	});
}

if (Count(junction_updates) > 0){
	Push(edit_payload,{
		'className': contained_junction_class,
        'updates': junction_updates
	});
}

if (Count(edit_payload) == 0) {
    return {
        "result": {
            "attributes": Dictionary(measured_length_field, new_measured_length)
        }
    };
}
return {
    "result": {
        "attributes": Dictionary(measured_length_field, new_measured_length)
    },
    "edit": edit_payload
};
