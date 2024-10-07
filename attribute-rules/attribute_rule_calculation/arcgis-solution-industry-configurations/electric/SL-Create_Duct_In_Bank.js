// Assigned To: StructureLine
// Type: Calculation
// Name: Create Ducts In Duct Bank-SL
// Description: Generates ducts inside duct banks based on the ductshigh and ductswide fields, also sets the measured length
// Subtypes: Wire Duct Bank
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// Related Rules: Some rules rely on additional rules for execution. If this rule works in conjunction with another, they are listed below:
//    - None

// Duplicated in: This rule may be implemented on other classes, they are listed here to aid you in adjusting those rules when a code change is required.
//    - None

// *************       User Variables       *************
Expects($feature, 'assettype', 'maximumcapacity', 'measuredlength');
// Limit the rule to specific asset types.
// ** Implementation Note: This rule uses a list of asset types and exits if not valid. Add to list to limit rule to specific asset types.
var valid_asset_types = [81];

// Auto-assign port numbers
// ** Implementation Note: If set to true, this will auto assign from/to port numbers to ducts if connected to two empty identical Knockouts.
var assign_port_numbers = true;

// The class name of wire ducts
// ** Implementation Note: This value does not need to change if using the industry data model.
var edge_obj_class = "StructureEdgeObject";

// The class name of knock outs
// ** Implementation Note: This value does not need to change if using the industry data model.
var point_class = "StructureJunction";

// Get Duct count from maximum capacity field
// ** Implementation Note: This value does not need to change if using the industry data model.
var duct_count = $feature.maximumcapacity;

// Wire Duct settings. Set Asset Group and Asset type of Ducts. Set from and to port number fields.
// ** Implementation Note: These values do not need to change if using the industry data model.
var duct_AG = 101;
var duct_AT = 41;
var duct_from_port_num = 'fromport';
var duct_to_port_num = 'toport';
var wire_duct_sql = "ASSETGROUP = " + duct_AG + " and ASSETTYPE = " + duct_AT;

// Knock out settings. Set Asset Group and Asset Type of Knockout. Set duct count field names.
// ** Implementation Note: Knock out sql is used to detect if created duct bank has been snapped to a Knock Out.
//    Duct count fields are used to determine if Knock Out has enough duct ports to accept created duct bank.
var knock_out_sql = "AssetGroup = 130 and AssetType = 371";
var knock_out_duct_wide_field = 'ductcountwide';
var knock_out_duct_high_field = 'ductcounthigh';

// The unit of measure used to calculate length
// ** Implementation Note: Options for Unit of Measure: https://developers.arcgis.com/arcade/function-reference/geometry_functions/#units-reference
var unit_of_measure = 'feet';
// ************* End User Variables Section *************

// *************       Functions            *************

// monikerize FeatureSetByName function
var get_features_switch_yard = FeatureSetByName;

// get "StructureJunction" feature that intersects with input point geometry. filter using knock_out_sql. returns Point type or null
function get_snapped_point(point_geo) {
    var fs = get_features_switch_yard($datastore, point_class, ["globalid", "assetgroup", "assettype", knock_out_duct_high_field, knock_out_duct_wide_field], false);
    var snapped_feats = Intersects(fs, Point(point_geo));
    var snapped_feat = First(Filter(snapped_feats, knock_out_sql));
    if (!IsEmpty(snapped_feat)) {
        return snapped_feat;
    }
    return null;
}

// get used ports at knockout by checking all snapped wire ducts. returns Array
function get_used_ports(point) {
    var used_ports = [];

    // get ports used by non-spatial edges
    var from_edges = get_connected_edges(point.globalID, 'from');
    for (var feat in from_edges) {
        if (feat[duct_from_port_num] != null) {
            push(used_ports, feat[duct_from_port_num]);
        }
    }
    var to_edges = get_connected_edges(point.globalID, 'to');
    for (var feat in to_edges) {
        if (feat[duct_to_port_num] != null) {
            push(used_ports, feat[duct_to_port_num]);
        }
    }
    return used_ports;
}

// Find the lowest number not in array. Returns Number
function next_avail(arr) {
    if (Count(arr) == 0) {
        return 1;
    }
    var sorted_arr = sort(arr);
    for (var i in sorted_arr) {
        if (i + 1 == sorted_arr[i]) {
            if (i + 1 == Count(sorted_arr)) {
                return i + 2;
            }
            continue;
        }
        return i + 1;
    }
}

// get lookup for from -> to port numbers
// example height = 2, width = 3  ->  {"1": 3, "2": 2, "3": 1, "4": 6, "5": 5, "6": 4}
function get_port_lookup(height, width) {
    var array = [];
    var counter = 1;
    var lookup_dict = {};
    for (var j = 0; j < height; j++) {
        var new_row = [];
        for (var k = 0; k < width; k++) {
            new_row[k] = counter;
            counter++;
        }
        array[j] = new_row;
    }

    for (var idx in array) {
        var rev_row = Reverse(array[idx]);
        for (var i in array[idx]) {
            lookup_dict[Text(array[idx][i])] = rev_row[i];
        }
    }
    return lookup_dict;
}

// Get all connected global ids using associations table
function get_connected_ids(container_guid, from_to) {
    var contained_ids = [];
    if (from_to == 'all') {
        var asst = '(4, 6)';
    } else if (from_to == 'from') {
        var asst = '(4)';
    } else if (from_to == 'to') {
        var asst = '(6)';
    } else {
        return contained_ids;
    }
    // Using the associations table to get child global ids. Cannot use FeatureSetByAssociation because we only have the guid
    var assoc_fs = get_features_switch_yard($datastore, 'UN_5_Associations', ['TOGLOBALID'], false);
    // Need to check for STATUS 'deleted' states. Record is only removed on validation.
    var filtered_fs = Filter(assoc_fs, "fromglobalid = @container_guid and ASSOCIATIONTYPE in " + asst + " and STATUS in (0, 8, 16, 24, 32, 40, 48, 56)");
    for (var feat in filtered_fs) {
        push(contained_ids, feat['TOGLOBALID']);
    }
    return contained_ids;
}

// Get number of non-spatial ducts connected to knockout
function get_connected_edges(knockout_id, from_to) {
    var contained_ids = get_connected_ids(knockout_id, from_to);
    if (Count(contained_ids) < 1) {
        return [];
    }
    // need to filter contained_ids to wire ducts only
    var duct_edge_fs = get_features_switch_yard($datastore, edge_obj_class, [duct_from_port_num, duct_to_port_num], false);
    var filtered_fs = Filter(duct_edge_fs, "globalid in @contained_ids and " + wire_duct_sql);
    return filtered_fs;
}

// construct payload to create associations of edge ducts to knockout
function create_tags(un_adds, tag, globalid, association) {
    var conn = {
        "fromClass": point_class,
        "fromGlobalID": globalid,
        "toClass": edge_obj_class,
        "toGlobalID": tag + ".globalid",
        "associationType": association
    };
    push(un_adds, conn);
}

function count_fs(fs) {
    var row_count = 0;
    for (var feat in fs) {
        row_count += 1;
    }
    return row_count;
}

// ************* End Functions Section ******************

// Limit the rule to valid subtypes
if (!Includes(valid_asset_types, $feature.assettype)) {
    return;
}
// Require a value for duct count
if (IsEmpty(duct_count) || duct_count == 0) {
    return {'errorMessage': 'A value is required for the content count field'};
}

// Get the start and end vertex of the line
var assigned_line_geo = Geometry($feature);
var vertices = assigned_line_geo['paths'][0];
var from_point = vertices[0];
var to_point = vertices[-1];

// Get the snapped feature.
var from_snapped_feat = get_snapped_point(from_point);
if (IsEmpty(from_snapped_feat)) {
    return {'errorMessage': 'A duct bank must start at a knock out'};
}

// Get count of available duct ports in a knockout. Check using height and width of knockout from attribute fields.
// Account for ducts that may already be snapped to knockout.
var height_from = DefaultValue(from_snapped_feat[knock_out_duct_high_field], 0);
var width_from = DefaultValue(from_snapped_feat[knock_out_duct_wide_field], 0);
var from_duct_count = width_from * height_from;
var from_duct_occupied = count_fs(get_connected_edges(from_snapped_feat.globalid, 'all'));
if (from_duct_count - from_duct_occupied < duct_count) {
    return {'errorMessage': 'A duct bank has more ducts than the knock out at the start of the line can support.'};
}

var to_snapped_feat = get_snapped_point(to_point);
if (IsEmpty(to_snapped_feat)) {
    return {'errorMessage': 'A duct bank must end at a knock out'};
}
var height_to = DefaultValue(to_snapped_feat[knock_out_duct_high_field], 0);
var width_to = DefaultValue(to_snapped_feat[knock_out_duct_wide_field], 0);
var to_duct_count = width_to * height_to;
var to_duct_occupied = count_fs(get_connected_edges(to_snapped_feat.globalid, 'all'));
if (to_duct_count - to_duct_occupied < duct_count) {
    return {'errorMessage': 'A duct bank has more ducts than the knock out at the end of the line can support.'};
}

// ************* Create Payload *****************
// special logic if both knockouts are empty and same dimensions H x W
var port_lookup = null;
if (from_duct_occupied + to_duct_occupied < 1) {
    if (height_from == height_to && width_from == width_to) {
        port_lookup = get_port_lookup(height_from, width_from);
    }
}

// handle port numbers. used_ports variables are arrays containing integers
if (assign_port_numbers) {
    var from_knockout_used_ports = get_used_ports(from_snapped_feat);
    var to_knockout_used_ports = get_used_ports(to_snapped_feat);
}

var length_value = $feature.measuredlength;
// Only calculate if field is null or zero
if (IsEmpty(length_value) || length_value == 0) {
    length_value = Length(assigned_line_geo, unit_of_measure);
}

// Create payload to add new wire duct edges
var edge_attributes = {};
var edge_adds = [];
var un_adds = [];

for (var j = 0; j < duct_count; j++) {
    var fromport_value = null;
    var toport_value = null;
    if (assign_port_numbers) {
        fromport_value = next_avail(from_knockout_used_ports);
        push(from_knockout_used_ports, fromport_value);
        if (port_lookup != null) {
            toport_value = port_lookup[Text(fromport_value)];
        } else {
            toport_value = next_avail(to_knockout_used_ports);
        }
        push(to_knockout_used_ports, toport_value);
    }
    edge_attributes = {
        'AssetGroup': duct_AG,
        'AssetType': duct_AT,
        'measuredlength': length_value,
    };
    edge_attributes[duct_from_port_num] = fromport_value;
    edge_attributes[duct_to_port_num] = toport_value;
    var add_payload = {
        'tag': 'edgeduct' + Text(j),
        'attributes': edge_attributes,
        'associationType': 'content'
    };
    push(edge_adds, add_payload);
    create_tags(un_adds, 'edgeduct' + Text(j), from_snapped_feat.globalid, "junctionEdgeFrom");
    create_tags(un_adds, 'edgeduct' + Text(j), to_snapped_feat.globalid, "junctionEdgeTo");
}

var knockout_updates = [
    {
        'globalID': from_snapped_feat.globalid,
        'attributes': {
            'usedcapacity': Count(from_knockout_used_ports),
            'availablecapacity': from_duct_count - Count(from_knockout_used_ports)
        }
    },
    {
        'globalID': to_snapped_feat.globalid,
        'attributes': {
            'usedcapacity': Count(to_knockout_used_ports),
            'availablecapacity': to_duct_count - Count(to_knockout_used_ports)
        }
    }
];

var edit_payload = [{
    'className': edge_obj_class,
    'adds': edge_adds
}, {
    'className': point_class,
    'updates': knockout_updates
}, {
    'className': '^UN_Association',
    'adds': un_adds
}];

return {
    'result': {
        'attributes':
            {
                'usedcapacity': 0,
                'availablecapacity': duct_count,
                'measuredlength': length_value
            }
    },
    "edit": edit_payload
};