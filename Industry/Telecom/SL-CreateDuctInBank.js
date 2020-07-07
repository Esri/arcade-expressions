// Assigned To: StructureLine
// Type: Calculation
// Name: Create ducts in duct bank
// Description: Generates ducts inside duct banks based on the ductshigh and ductswide fields
// Subtypes: Wire Duct Bank
// Field: assetid
// Trigger: Insert
// Exclude From Client: True
// Disable: False

// *************       User Variables       *************
// This section has the functions and variables that need to be adjusted based on your implementation
var valid_asset_types = [81];
// this will auto assign from/to port numbers to ducts
var assign_port_numbers = true;

var assigned_to_value = $feature.assetid;
var line_class = "StructureLine";
var point_class = "StructureJunction";
var duct_count = $feature.maximumcapacity;
// The Asset Group and Asset Type of the duct
var duct_AG = 101;
var duct_AT = 41;
var duct_from_port_num = 'fromport';
var duct_to_port_num = 'toport';
var wire_duct_sql = "ASSETGROUP = 101 and ASSETTYPE = 41";
var knock_out_sql = "AssetGroup = 110 and AssetType = 363";
var knock_out_duct_wide_field = 'ductcountwide';
var knock_out_duct_high_field = 'ductcounthigh';

function get_features_switch_yard(class_name, fields, include_geometry) {
    var class_name = Split(class_name, '.')[-1];
    var feature_set = null;
    if (class_name == "StructureJunction") {
        feature_set = FeatureSetByName($datastore, "StructureJunction", fields, include_geometry);
    } else if (class_name == 'Associations') {
        feature_set = FeatureSetByName($datastore, 'UN_5_Associations', fields, false);
    } else if (class_name == 'StructureLine') {
        feature_set = FeatureSetByName($datastore, 'StructureLine', fields, include_geometry)
    } else {
        feature_set = FeatureSetByName($datastore, "StructureJunction", fields, include_geometry);
    }
    return feature_set;
}

// ************* End User Variables Section *************

// *************       Functions            *************

// get "StructureJunction" feature that intersects with input point geometry. filter using knock_out_sql. returns Point type or null
function get_snapped_point(point_geo) {
    var fs = get_features_switch_yard(point_class, ["globalid", "assetgroup", "assettype", knock_out_duct_high_field, knock_out_duct_wide_field], false);
    var snapped_feats = Intersects(fs, Point(point_geo));
    var snapped_feat = First(Filter(snapped_feats, knock_out_sql));
    if (!IsEmpty(snapped_feat)) {
        return snapped_feat;
    }
    return null;
}

// get all wire ducts snapped to knockout. returns FeatureSet or null
function get_snapped_lines(point_geo, return_geo){
    var fs = get_features_switch_yard(line_class, [duct_from_port_num, duct_to_port_num], return_geo)
    var snapped_feats = Intersects(fs, point_geo);
    if (IsEmpty(snapped_feats)) {
        return null;
    }
    return Filter(snapped_feats, wire_duct_sql)
}

// get used ports at knockout by checking all snapped wire ducts. returns Array
function get_used_ports(point_geo){
    var used_ports = [];
    var existing_snapped_ducts = get_snapped_lines(point_geo, true);
    if (existing_snapped_ducts == null) {
        return used_ports;
    }
    for (var feat in existing_snapped_ducts) {
        var duct_from_pt = Geometry(feat)["paths"][0][0];
        var duct_to_pt = Geometry(feat)["paths"][0][-1];
        if (Intersects(duct_from_pt, point_geo)) {
            if (feat[duct_from_port_num] != null) {
                used_ports[Count(used_ports)] = feat[duct_from_port_num];
            }
        } else if (Intersects(duct_to_pt, point_geo)) {
            if (feat[duct_to_port_num] != null) {
                used_ports[Count(used_ports)] = feat[duct_to_port_num];
            }
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
        if (i+1 == sorted_arr[i]) {
            if (i+1 == Count(sorted_arr)) {
                return i+2
            }
            continue;
        }
        return i+1
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

// ************* End Functions Section ******************

// Limit the rule to valid subtypes
if (IndexOf(valid_asset_types, $feature.assettype) == -1) {
    return assigned_to_value;
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
var from_duct_occupied = Count(get_snapped_lines(from_point, false));
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
var to_duct_occupied = Count(get_snapped_lines(to_point, false));
if (to_duct_count - to_duct_occupied < duct_count) {
    return {'errorMessage': 'A duct bank has more ducts than the knock out at the end of the line can support.'};
}


// ************* Create Payload *****************
// special logic if both knockouts are empty and same dimensions H x W
var port_lookup = null;
if (from_duct_occupied + to_duct_occupied < 1) {
    if (height_from == height_to && width_from == width_to){
        port_lookup = get_port_lookup(height_from, width_from);
    }
}

// handle port numbers. used_ports variables are arrays containing integers
var from_knockout_used_ports = get_used_ports(from_point);
var to_knockout_used_ports = get_used_ports(to_point);

// Create payload to add new lines
var line_attributes = {};
var line_adds = [];

// Copy the line as text
var line_json = Text(assigned_line_geo);

for (var j = 0; j < duct_count; j++) {
    var content_shape = Dictionary(line_json);
    var fromport_value = null;
    var toport_value = null;
    if (assign_port_numbers) {
        fromport_value = next_avail(from_knockout_used_ports);
        from_knockout_used_ports[Count(from_knockout_used_ports)] = fromport_value;
        if (port_lookup != null) {
            toport_value = port_lookup[Text(fromport_value)];
        } else {toport_value = next_avail(to_knockout_used_ports);
        to_knockout_used_ports[Count(to_knockout_used_ports)] = toport_value;
        }
    }
    line_attributes = {
        'AssetGroup': duct_AG,
        'AssetType': duct_AT,
    };
    line_attributes[duct_from_port_num] = fromport_value;
    line_attributes[duct_to_port_num] = toport_value;
    line_adds[Count(line_adds)] = {
        'attributes': line_attributes,
        'geometry': Polyline(content_shape),
        'associationType': 'content'
    };
}
var edit_payload = [{'className': line_class, 'adds': line_adds}];

return {
    "result": assigned_to_value,
    "edit": edit_payload
};
