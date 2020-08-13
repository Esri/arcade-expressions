// Assigned To: CommunicationsLine
// Type: Calculation
// Name: Line - Strandcount From Content
// Description: Calculates number of Strand features contained within feature
// Subtypes: All
// Field: strandcount
// Trigger: Update
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - Line - Strand Attributes For Container: Operates in conjunction to maintain strand count attributes

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
// ** Implementation Note: Adjust this value only if the field name for Strand Count differs
var assigned_to_field = $feature.strandcount;

// Limit the rule to valid asset groups/subtypes
// ** Implementation Note: Instead of recreating this rule for each subtype, this rule uses a list of subtypes and exits if not valid
//    If you have added Asset Groups, they will need to be added to this list.
var valid_asset_groups = [1, 3, 4, 5, 6, 7, 9];

// The class name of the content Strands
// ** Implementation Note: This is just the class name and should not be fully qualified. Adjust this only if class name differs.
var line_class = "CommunicationsLine";

// The sql query for Strand asset group
// ** Implementation Note: This value does not need to change if using the industry data model
var strand_sql = 'assetgroup = 8';

// Call the strands class using FeatureSetByName function.
// ** Implementation Note: In the industry data model this is CommunicationsLine. Used to count number of strands contained in Cable.
var feature_set = FeatureSetByName($datastore, "CommunicationsLine", ["globalid"], false);


// ************* End User Variables Section *************

// *************       Functions            *************

function get_content_feature_ids(feature) {
    // Query to get all the content associations
    var associations = FeatureSetByAssociation(feature, "content");
    // If there is no content, exit the function
    if (Count(associations) == 0) {
        return null;
    }
    // loop over all associated records to get a list of the associated classes and the IDs of the features
    var associated_ids = {};
    associated_ids[line_class] = [];
    for (var row in associations) {
        if (HasKey(associated_ids, row.className) == false) {
            associated_ids[row.className] = [];
        }
        associated_ids[row.className][Count(associated_ids[row.className])] = row.globalId;
    }
    //return a dict by class name with GlobalIDs of features
    return associated_ids;
}

// Function to check if a bit is in an int value
function has_bit(num, test_value) {
    // num = number to test if it contains a bit
    // test_value = the bit value to test for
    // determines if num has the test_value bit set
    // Equivalent to num AND test_value == test_value

    // first we need to determine the bit position of test_value
    var bit_pos = -1;
    for (var i=0; i < 64; i++) {
        // equivalent to test_value >> 1
        var test_value = Floor(test_value / 2);
        bit_pos++
        if (test_value == 0)
            break;
    }
    // now that we know the bit position, we shift the bits of
    // num until we get to the bit we care about
    for (var i=1; i <= bit_pos; i++) {
        var num = Floor(num / 2);
    }

    if (num % 2 == 0) {
        return false
    }
    else {
       return true
    }
}

function get_features_counts_by_query(associated_ids, sql){
    // Count number of content features of cable that are strands.
    var global_ids = associated_ids[line_class];
    var fcnt = Count(Filter(feature_set, sql + " AND globalid IN @global_ids"));
    // Return the features
    return fcnt;
}

// ************* End Functions Section *****************

// Limit the rule to valid subtypes
if (Count(valid_asset_groups) > 0 && IndexOf(valid_asset_groups, $feature.assetgroup) == -1) {
    return assigned_to_field;
}

var association_status = $feature.ASSOCIATIONSTATUS;
// Only features with an association status of container(bit 1) need to be evaluated
if (IsEmpty(association_status) || has_bit(association_status,1) == false){
    return assigned_to_field;
}

var associated_ids = get_content_feature_ids($feature);
if (IsEmpty(associated_ids) || Text(associated_ids[line_class]) == '[]') {
    return 0;
}

return {"result": get_features_counts_by_query(associated_ids,strand_sql)};
