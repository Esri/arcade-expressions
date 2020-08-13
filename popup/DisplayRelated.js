// Type: Pop up
// Name: Display last inspection record
// Description: This rule retrieves the most current record by a date field related to the $feature.  This does not rely on relationship classes, but a query on another layer
// Sample Data: Included in the DisplayRelated.gdb.zip
// Set up:  Create a new expression in a pop up

var primary_key = $feature.assetid;

if (IsEmpty(primary_key)) {
    return "Asset does not have an ID";
}

var related_class_name = "Inspection";
var related_fs = FeatureSetByName($datastore, "Inspection", ["globalid", "inspectiondate", "fkey", 'Condition'], false);
var related_record = OrderBy(Filter(related_fs, "fkey = @primary_key"), "inspectiondate desc");

if (IsEmpty(related_record)) {
    return "No Related Records";
}

var last_inspection = first(related_record)
if (IsEmpty(last_inspection)) {
    return "No Related Records";
}

var timeNow = now();
var datehrs = Round(DateDiff(timeNow, last_inspection['inspectiondate'], 'hours'), 2);
var datedays = Round(DateDiff(timeNow, last_inspection['inspectiondate'], 'days'), 2);
var datemins = Round(DateDiff(timeNow, last_inspection['inspectiondate'], 'minutes'), 2);

return {
    'condition': last_inspection['Condition'],
    'days': datedays,
    'hours': datehrs,
    'minutes': datemins
}
