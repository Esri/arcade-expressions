// Assigned To: CommunicationsJunction
// Type: Calculation
// Name: Junction - Associate Line On Structure
// Description: Attach or Contain junction in structure. Generates connection points at a vertex when within a distance of a structure junction.
// Subtypes: Connection Point
// Field: containerGUID
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation

// The field the rule is assigned to
// ** Implementation Note: Adjust only if Container ID field name differs. This rule will exit if this field is empty or null.
//    If containerguid has valid guid, this rule will add feature as content to guid feature
var assigned_to_field = $feature.containerGUID;

// Limit the rule to specific asset type.
// ** Implementation Note: This rule uses a list of asset types and exits if not valid. Add to list to limit rule to specific asset types.
var valid_asset_types = [1, 2, 3];

// The class name of the container feature
// ** Implementation Note: This is just the class name and should not be fully qualified. Adjust this only if class name differs.
var container_class = "StructureJunction";

// ************* End User Variables Section *************

if (Count(valid_asset_types) > 0 && IndexOf(valid_asset_types, $feature.assettype) == -1) {
    return assigned_to_field;
}

if (IsEmpty(assigned_to_field)){
      return assigned_to_field;
}

var associationType = $feature.containerType;
if (IsEmpty(associationType)){
      return assigned_to_field;
}

var edit_payload = [{
    'className': container_class,
    'updates': [{
        'globalID': assigned_to_field,
        'associationType': associationType
    }]
}];

return {"result": null, "edit": edit_payload};