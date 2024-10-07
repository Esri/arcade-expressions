function buildServices() {


    /* ------------------ ----------- */
    /* ------------------ ----------- */
    /* ----------Run Main ----------- */
    /* ------------------ ----------- */
    /* ------------------ ----------- */

    var addsFittings = [];
    var addsService = [];
    var addsServicePoints = [];
    var updateAnchors = [];
    var c = 0;
    //query nearby buildings within 150ft buffer
    var fs = Filter(FeatureSetByName($datastore, "main.building"), "isconnected = 0");
    var buffered = intersects(fs, buffer($feature, 150));

     //loop through each building
    for (var f in buffered) {

        //find the shortest distance from build to the main
        var d = point_and_distance(f, $feature)

        //create the service connection
        var gStart = geometry(f)
        addsServicePoints[c] = {
            "geometry": geometry(f)
        }

        //create the fittings
        var pt = Point({
            x: d["coordinates"][0],
            y: d["coordinates"][1],
            z: 0,
            spatialReference: geometry($feature)["spatialReference"]
        });

        addsFittings[c] = {
            "geometry": pt
        }

        //create the service
        var serviceLine = create_line([pt["x"], pt["y"], 0], [gStart["x"], gStart["y"], 0], geometry($feature)["spatialReference"])
        addsService[c] = {
            "attributes": {
                "diameter": f.diameter
            },
            "geometry": serviceLine
        }
        //update the buildings
        updateAnchors[c++] = {
            "globalId": f.globalId,
            "attributes": {
                "isconnected": 1
            }
        }
    }

    return {
        "edit": [{
            //create the fitting point on the main pipe
            "className": "main.fitting",
            "adds": addsFittings
        }, {
            //create the service point at the end of the lateral
            "className": "main.serviceconnection",
            "adds": addsServicePoints
        }, {
            //create the lateral service line to the house
            "className": "main.service",
            "adds": addsService
        }, {
            //mark the house as connected
            "className": "main.building",
            "updates": updateAnchors
        }]
    }
}

function create_line(start, end_coordinates, sp) {
    var geo = Geometry(start);
    return Polyline({"paths": [[start, end_coordinates]], "spatialReference": sp})
}

function point_and_distance(point_feature, other_feature) {
    var point_feature = Geometry(point_feature);
    var other_feature = Geometry(other_feature);
    var shape = TypeOf(other_feature);
    var vertices;
    if (shape == 'Point') {
        return {
            "distance": Distance(point_feature, other_feature),
            "coordinates": [other_feature["x"], other_feature["y"]],
            "isVertex": true
        }
    } else if (shape == 'Multipoint') {
        var points = other_feature["points"];
        var shortest = [1e10, null];
        for (var i in points) {
            var p = points[i]
            var dist = Distance(point_feature, p);
            if (dist < shortest[0]) shortest = [dist, [p["x"], p["y"]]]
        }
        return {"distance": shortest[0], "coordinates": shortest[1], "isVertex": true}
    } else if (shape == 'Polyline') vertices = other_feature["paths"]
    else if (shape == 'Polygon') vertices = other_feature["rings"]
    else return null

    var x = point_feature["x"];
    var y = point_feature["y"];
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
    if (Count(shortest) == 1) return null
    return {"distance": shortest[0], "coordinates": shortest[1], "isVertex": shortest[2]}
}


function pDistance(x, y, x1, y1, x2, y2) {
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;
    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0)
        param = dot / len_sq;
    var xx, yy;
    var is_vertex = true;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        is_vertex = false;
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    var dx = x - xx;
    var dy = y - yy;
    return [Sqrt(dx * dx + dy * dy), [xx, yy], is_vertex];
}


return buildServices();