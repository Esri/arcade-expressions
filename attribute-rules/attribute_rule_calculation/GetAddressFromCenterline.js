// This rule will calculate an address number for a point based on nearest road centerline

// Centerline attribute field names
var fromleft = "FROMLEFT"
var toleft = "TOLEFT"
var fromright = "FROMRIGHT"
var toright = "TORIGHT"
var fullname = "FULLNAME"

// Site Address Point fields to calculate
var percent_field = "PERCENTALONG"   // percent along centerline where site address lies
var offdir_field = "OFFDIR"          // side of centerline where site address lies
var fullname_field = "FULLNAME"      // name of closest centerline
var address_field = "ADDRESSNUM"     // address number calculated based on where site address lies

// The Road Centerline feature set
var line_class = FeatureSetByName($datastore, "RoadCenterline", [fromleft, toleft, fromright, toright, fullname], true);


// *************       Functions            *************

function find_closest_line() {
    // Find closest line segment to $feature. Limit search to specific radius.
    var candidates = Intersects(line_class, Buffer($feature, 1000, "feet"));
    //var candidates = line_class;

    var shortest = [1e10, null];
    for (var line in candidates) {
        var d = Distance($feature, line)
        if (d < shortest[0]) shortest = [d, line]
    }
    return shortest[-1]
}

function closest_point_info(point_feature, line_feature) {
    /*
        finds the closest point on line_feature from point_feature

        Args:
            point_feature: Point Geometry
            line_feature: Line Geometry

        Returns: dictionary
            {distance: number,    // distance from point_feature to closest point
             coordinates: array,  // the coordinate pair of the closest point
             isVertex: bool,      // if the closest point is a vertex of line_feature
             lineSide: text}      // side of the line that point_feature is on based

    */

    var point_feature = Geometry(point_feature);
    var line_feature = Geometry(line_feature);
    var vertices = line_feature["paths"]
    var x = point_feature["x"];
    var y = point_feature["y"];

    // Loop through each part of the geometry and each segment, tracking the shortest distance
    var shortest = [1e10];
    for (var i in vertices) {
        var part = vertices[i];
        var previous = part[0];
        for (var j = 1; j < Count(part); j++) {
            var current = part[j];
            var result = pDistance(x, y, previous["x"], previous["y"], current["x"], current["y"]);
            if (result[0] < shortest[0]) shortest = result
            previous = current;
        }

    }

    // Couldn't find anything
    if (Count(shortest) == 1) return null

    return {"distance": shortest[0],
            "coordinates": shortest[1],
            "isVertex": shortest[2],
            "lineSide": shortest[3]}
}

function pDistance(x, y, x1, y1, x2, y2) {
  // adopted from https://stackoverflow.com/a/6853926
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;
  var is_vertex = true;
  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    is_vertex = false;
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return [Sqrt(dx * dx + dy * dy), [xx, yy], is_vertex, side_of_line(x,y,x1,y1,x2,y2)];
}

function side_of_line(x, y, x1, y1, x2, y2) {
    // get side of line segment that a point (x, y) is on based on the direction of segment [[x1, y1], [x2, y2]]
    // adopted from https://math.stackexchange.com/a/274728
    var d = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1)
    if (d < 0) {
        return 'left'
    } else if (d > 0) {
        return 'right'
    } else {
        return null
    }
}

function intersect_distance_along(intersect_geometry, line, unit){
    // Loop through the segments of the line. Handle multipart geometries.
    var distance_along_line = 0;
    for (var part in Geometry(line).paths) {
        var segment = Geometry(line).paths[part];

        // Loop through the points in the segment
        for (var i in segment) {
            if (i == 0) continue;

            // Construct a 2-point line segment from the current and previous point
            var first_point = segment[i-1];
            var second_point = segment[i]
            var two_point_line = Polyline({'paths': [[[first_point.x, first_point.y], [second_point.x, second_point.y]]], 'spatialReference' : first_point.spatialReference});

            // Test if the  point intersects the 2-point line segment
            if (Intersects(intersect_geometry, two_point_line)) {
                // Construct a 2-point line segment using the previous point and the address point
                var last_segment = Polyline({'paths': [[[first_point.x, first_point.y], [intersect_geometry.x, intersect_geometry.y]]], 'spatialReference' : first_point.spatialReference});
                // Add to the total distance along the line and break the loop
                distance_along_line += Length(last_segment, unit);
                return distance_along_line
            }
            // Add to the toal distance along the line
            distance_along_line += Length(two_point_line, unit);
        }
    }

    return null;
}

function create_point(coordinates, spatial_ref) {
    // create point geometry from coordinates [x, y]
    return Point({"x": coordinates[0], "y": coordinates[1], "spatialReference": spatial_ref})
}


function get_addr_num(road, percent_along, dir) {
    // This function will return the address number of the new site address point
    // It determines this based on the from and to address range on the intersecting road and the direction of the offset
    // If direction is null, defaults to left offset
    var addr_num = null;
    if (IsEmpty(dir)) dir = 'left';
    var from = road[fromleft];
    var to = road[toleft];
    if (Lower(dir) == 'right') {
        var from = road[fromright];
        var to = road[toright];
    }
    if (from == null || to == null) return null;
    var val = percent_along * (to - from);
    var addr_num = 0;

    if ((Floor(val) % 2) == 0) addr_num = Floor(val);
    else if ((Ceil(val) % 2) == 0) addr_num = Ceil(val);
    else addr_num = Floor(val) - 1;

    return from + addr_num;
}

// ************* End Functions Section ******************


// find closest line to $feature
var closest_line = find_closest_line();
if (closest_line == null) return

// find info about the closest point on the closest line to $feature
var data = closest_point_info($feature, closest_line);
if (data == null) return

// calculate the distance along of closest point
var closest_point = create_point(data["coordinates"], Geometry($feature)["spatialReference"])
var distance_along = intersect_distance_along(closest_point, closest_line, "feet")
if (distance_along == null) return {
    "errorMessage": "could not calculate distance along"
}
var percent_along = distance_along / Length(closest_line, "feet")

// calculate address number
var address_num = get_addr_num(closest_line, percent_along, data["lineSide"])

// return result to update attributes of $feature
return {
    "result": {
        "attributes":
            Dictionary(
                percent_field, percent_along,
                offdir_field, data["lineSide"],
                address_field, address_num,
                fullname_field, closest_line[fullname]
            )
    }
}