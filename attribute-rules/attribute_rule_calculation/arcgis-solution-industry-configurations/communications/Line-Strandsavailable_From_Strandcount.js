// Assigned To: CommunicationsLine
// Type: Calculation
// Name: Line - Strandsavailable From Strandcount
// Description: Populates strandsavailable field using strandcount field when a Cable is created
// Subtypes: All
// Field: strandsavailable
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - Line - Create Strands In Cable: Strands created are set with a strandstatus of available by default. The cable needs to have the
//                                      strandsavailable value set accordingly.

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
// ** Implementation Note: Adjust this value only if the field name for Strands Available differs
var strands_available = $feature.strandsavailable;

// The strand count field which is set a Cable is created.
// ** Implementation Note: Adjust this value only if the field name for Strand Count differs
var strand_count = $feature.strandcount;

// Limit the rule to valid asset groups/subtypes
// ** Implementation Note: Instead of recreating this rule for each subtype, this rule uses a list of subtypes and exits if not valid
//    If you have added Asset Groups, they will need to be added to this list.
var valid_asset_groups = [1, 3, 4, 5, 6, 7, 9];

// ************* End User Variables Section *************

if (IndexOf(valid_asset_groups, $feature.assetgroup) == -1) {
    return strands_available;
}

return strand_count;
