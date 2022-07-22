/*
Description:  This rule finds the closet line and draws a line to the closest point on it.  This can be used in a water or sewer network to draw the service line.

*/
function find_closest_line() {
   var line_class = FeatureSetByName($datastore, "line", ["objectid"], true);
   //var candidates = Intersects(line_class, Buffer($feature, 500, "miles"));
   var candidates = line_class;

   var shortest = [1e10, null];
   for (var line in candidates) {
      var d = Distance($feature, line)
      if (d < shortest[0]) shortest = [d, line]
   }

   return shortest[-1]
}

function point_and_distance(point_feature, other_feature) {
	/*
		finds the closest point from point_feature to other_feature

		Args:
			point_feature: Point Geometry
			other_feature: Point/Line/Polygon Geometry

		Returns: dictionary
			{distance: number,               // distance from point_feature to closest point
			 point: geometry,  // the coordinate pair of the closest point
			 isVertex: bool}                 // if the closest point is a vertex of other_feature

	*/

	var point_feature = Geometry(point_feature);
	var other_feature = Geometry(other_feature);

	var shape = TypeOf(other_feature);
	var vertices;
	if (shape == 'Point') {
		return {"distance": Distance(point_feature, other_feature),
		        "coordinates": [other_feature["x"], other_feature["y"]],
				"isVertex": true}
	}

	else if (shape == 'Multipoint') {
	    var points = other_feature["points"];
	    var shortest = [1e10, null];
	    for (var i in points) {
	       var p = points[i]
	       var dist = Distance(point_feature, p);
	       if (dist < shortest[0]) shortest = [dist, [p["x"], p["y"]]]
	    }
	    return {"distance": shortest[0],
		        "coordinates": shortest[1],
				"isVertex": true}
	}

    else if (shape == 'Polyline') vertices = other_feature["paths"]
	else if (shape == 'Polygon') vertices = other_feature["rings"]
	else return null

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
	        "isVertex": shortest[2]}

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
  return [Sqrt(dx * dx + dy * dy), [xx, yy], is_vertex];
}

function create_line(start, end_coordinates) {
    var geo = Geometry(start);
    return Polyline({"paths": [[[geo["x"], geo["y"]], end_coordinates]], "spatialReference": geo["spatialReference"]})

}


var closest = find_closest_line();
if (closest == null) return null

var data = point_and_distance($feature, closest);
if (data == null) return null

var lateral = create_line($feature, data["coordinates"]);

return {"result": null,
        "edit": [{
            "className": "lateral", "adds": [{"geometry": lateral}]
        }
        ]
}