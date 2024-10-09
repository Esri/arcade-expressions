// This rule will create a new unique id when a road centerline is created
// This will also copy related road alias names for any roads that were added as a result of a split

// Define the leading text and the delimiter for the ID
var prefix = "RD"
var join_char = "-"

// Define any fields to be copied from the road name aliases table (lower case)
var alias_field_names = ["roadpremod", "roadpredir", "roadpretype", "roadpretypesep", "roadname", "roadtype", "roadpostdir", "roadpostmod", "fullname", "municipality"]

// If the road was created from a split its oirginal id will have a prefix of '::'
// We will use this to find the original road and its related alias road names
if (Left($feature.centerlineid, 2) == "::" || IsEmpty($feature.centerlineid)) {
    var id = Concatenate([prefix, NextSequenceValue("CenterlineID")], join_char)
    
    // If the centerlineid is not set return the new id
    if (IsEmpty($feature.centerlineid)) return id;
   
    // Find the original ID of the road that was split
    var original_id = Mid($feature.centerlineid, 2, Count($feature.centerlineid) - 2);
    if (IsEmpty(original_id)) return id;
    
    // Find all the related road alias names for the split road
    // Store an add for every road alias and related it to the new road that was added after the cut
    var adds = []
    var roadNameAliases = Filter(FeatureSetByName($datastore, "AliasRoadName"), "centerlineid = '" + original_id + "'");
    for (var roadNameAlias in roadNameAliases) {
        var featureAttributes = Dictionary(Text(roadNameAlias))['attributes'];
        var newAttributes = {};
        for (var k in featureAttributes) {
            if (IndexOf(alias_field_names, Lower(k)) > -1 && featureAttributes[k] != null) {
                newAttributes[k] = featureAttributes[k];
            } else {
                continue;
            }
        }
        newAttributes['centerlineid'] = id
        adds[Count(adds)] = {
            'attributes': newAttributes
        }
    }
    
    // Using the edit parameter return the list of updates and adds for the intersecting roads and a list of adds for related road alias names
    return {
        'result': id,
        'edit': [{'className': 'AliasRoadName', 'adds': adds}]
    };
}
else {
   return $feature.centerlineid
}