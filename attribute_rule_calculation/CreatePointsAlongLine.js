// This rule will create n number of point features along a line at equidistant intervals. Optionally add endpoints.

// Number of midspan points to be created not including endpoints.
var midspan_points = 2
// Create endpoints. Default is true.
var create_endpoints = true;
// Point class name.
var point_class = "points"

// *************       Functions            *************

function drop_points_on_line(line, points_number) {
    var mispan = [];
    var distance_along_line = 0;
    var break_distance = Length(line) / (points_number + 1)

    // Handle multipart geometries.
    for (var part in Geometry(line).paths) {
        var line_part = Geometry(line).paths[part]

        // loop through segments of line
        for (var i in line_part) {
            if (i == 0) continue;

            // Construct a 2-point line segment from the current and previous point
            var first_point = line_part[i-1];
            var second_point = line_part[i]
            var two_point_line = Polyline({'paths': [[[first_point.x, first_point.y], [second_point.x, second_point.y]]], 'spatialReference' : first_point.spatialReference});
            var seg_length = Length(two_point_line);

            if (seg_length + distance_along_line < break_distance) {
                // Don't need to drop point along this segment. Add distance and continue.
                distance_along_line += seg_length;
                continue
            }
            if (seg_length + distance_along_line == break_distance) {
                // Break point is endpoint of segment
                push(mispan, Point(second_point))
                distance_along_line = 0
                continue
            }

            // Drop new points along segment. Account for segment being longer than break distance.
            for (var current_length = seg_length + distance_along_line; current_length>=break_distance; ) {
                var xy = get_xy_along_line(first_point.x, first_point.y, second_point.x, second_point.y, break_distance - distance_along_line)
                var new_point = Point({"x": xy[0], "y": xy[1], "spatialReference": first_point.spatialReference})
                push(mispan, new_point)
                if (Count(mispan) == points_number) {
                    return mispan
                }
                // reset values for next loop if remaining portion of segment is larger than break distance.
                current_length = Length(Polyline({"paths": [[new_point, [second_point.x, second_point.y]]], "spatialReference": second_point.spatialReference}))
                distance_along_line = 0
                first_point = new_point
            }
            // exit early if we hit the midspan number
            if (Count(mispan) == points_number) {
                return mispan
            }
            // current_length is less than break distance, set distance_along_line to current_length and move to next segment
            distance_along_line = current_length
        }
    }
    return mispan
}

function get_xy_along_line(x0, y0, x1, y1, d) {
    // get xy coordinates of point that is distance d from x0, y0 and along line ((x0, y0), (x1, y1))
    // adopted from https://math.stackexchange.com/a/1630886
    var full_length = Sqrt(Pow(x1 -x0, 2) + Pow(y1 - y0, 2))
    var t = d / full_length
    var xt = ((1-t) * x0) + (t * x1)
    var yt = ((1-t) * y0) + (t * y1)
    return [xt, yt]
}


function get_endpoints(line) {
    // return an array of Point objects
    var geom = Geometry(line)
    return [Point(geom["paths"][0][0]), Point(geom["paths"][0][-1])]
}

// ************* End Functions Section ******************

var new_points = [];

// create new midspan points
if (midspan_points > 0) {
    var points_array = drop_points_on_line($feature, midspan_points)
    for (var idx in points_array) {
        push(new_points, {
            'geometry': points_array[idx]
        })
    }
}

// create new endpoints
if (create_endpoints) {
    var points_array2 = get_endpoints($feature)
    for (var idx in points_array2) {
        push(new_points, {
            'geometry': points_array2[idx]
        })
    }
}

if (Count(new_points) == 0) {
    return
}

var edit_payload = [{
    'className': point_class,
    'adds': new_points
}]

return {
    "edit": edit_payload
}

