// This rule will split intersecting roads at their intersection and the address ranges will be updated to reflect where the split occured

//Define any fields to be copied from the centerline when split (lower case)
var centerline_field_names = ["rclnguid", "discrpagid", "rangeprefixleft", "fromleft", "toleft", "parityleft", "rangeprefixright", "fromright", "toright", "parityright", "fullname", "fedroute", "fedrtetype", "afedrte", "afedrtetype", "stroute", "strtetype", "astrte", "astrtetype", "ctyroute", "onewaydir", "roadlevel", "inwater", "roadclass", "countryleft", "countryright", "stateleft", "stateright", "countyleft", "countyright","munileft", "muniright", "zipleft", "zipright", "msagleft", "msagright", "esnleft", "esnright"]

// This function calculates a new from and to address based on the percentage along the line the split occurs
function newToFrom(from, to, percent) {
    if (from == null || to == null) return [null, null];

    var range = Abs(to - from);
    if (range < 2) return [from, to];

    var val = percent * range;
    var newVal = 0;

    if ((Floor(val) % 2) == 0) newVal = Floor(val);
    else if ((Ceil(val) % 2) == 0) newVal = Ceil(val);
    else newVal = Floor(val) - 1;

    if (newVal == range) newVal -= 2;

    if (from > to) return [from - newVal, from - newVal - 2];
    else return [from + newVal, from + newVal + 2];
}

// If the road was created from a split its id will have a prefix of '::'
// Don't process any futher splits to prevent getting in an infinite loop
var id = $feature.centerlineid;
if (Left(id, 2) == "::") return id;

// Get the object id, centerline id and geometry from the road
var oid = $feature.OBJECTID;
var geom = Geometry($feature);

// Get all the intersecting roads
var intersectingRoads = Intersects(FeatureSetByName($datastore, "RoadCenterline"), geom);
var adds = [];
var updates = [];

// Loop through each intersecting road
for (var road in intersectingRoads) {
    // Continue to the next road if the intersecting road is the same or geometry is the same
    if (oid == road.OBJECTID || Equals(geom, road)) continue;

    // Cut the intersecting road and continue if the result of the cut is 0 features
    var newRoads = Cut(road, geom);
    if (Count(newRoads) == 0) continue;

    var validCut = true;
    var geometries = []

    // Loop through collection of lines and check that it was a valid cut in the middle of a segment
    for (var i in newRoads) {
        if (newRoads[i] == null || Length(newRoads[i]) == 0) {
            validCut = false;
            continue;
        }

        // Handle multipart geometries
        var allParts = MultiPartToSinglePart(newRoads[i]);
        for (var p in allParts) {
            geometries[Count(geometries)] = allParts[p];
        }
    }

    // Process the cut if valid
    if (validCut) {

        // Get the address range of the intersecting road
        var fromRight = road.fromright;
        var toRight = road.toright;
        var fromLeft = road.fromleft;
        var toLeft = road.toleft;

        var firstGeometry = null;
        var secondGeomArray = [];
        var firstPoint = Geometry(road).paths[0][0];

        // Loop through each geometry in the cut
        // Store the geometry including the first vertex of the orginal road as the first geometry
        // Collect all other geometries in an array
        for (var i in geometries) {
            if (Equals(firstPoint, geometries[i].paths[0][0])) {
                firstGeometry = geometries[i];
            } else {
                secondGeomArray[Count(secondGeomArray)] = geometries[i];
            }
        }

        // Merge all other geometries as the second geometry
        var secondGeometry = Union(secondGeomArray);

        // Calculate the new address ranges based on the intersection location along the line
        var geometryPercent = Length(firstGeometry, 'feet') / (Length(firstGeometry, 'feet') + Length(secondGeometry, 'feet'));
        var newToFromLeft = newToFrom(fromLeft, toLeft, geometryPercent)
        var newToFromRight = newToFrom(fromRight, toRight, geometryPercent)

        // Store an update for the intersecting road with the first geometry from the cut and the new right to and left to value 
  var attributes = {}
  if (newToFromRight[0] != null) attributes['toright'] = newToFromRight[0];
  if (newToFromLeft[0] != null) attributes['toleft'] = newToFromLeft[0];
        updates[Count(updates)] = {
            'objectID': road.OBJECTID,
            'attributes': attributes,
            'geometry': firstGeometry
        }

        // Store an add for a new road with the second geometry from the cut and the new right from and left from value 
        var featureAttributes = Dictionary(Text(road))['attributes'];
        var newAttributes = {};
        for (var k in featureAttributes) {
            if (Lower(k) == "fromright" && newToFromRight[1] != null) {
                newAttributes['fromright'] = newToFromRight[1];
            } else if (Lower(k) == "fromleft" && newToFromLeft[1] != null) {
                newAttributes['fromleft'] = newToFromLeft[1];
            } else if (IndexOf(centerline_field_names, Lower(k)) > -1 && featureAttributes[k] != null) {
                newAttributes[k] = featureAttributes[k];
            } else {
    continue;
   }
        }
  // Store a reference to the original id of the road for the split
        newAttributes['centerlineid'] = "::" + road.centerlineid;
        adds[Count(adds)] = {
            'attributes': newAttributes,
            'geometry': secondGeometry
        }
    }
}

// Return the original road centerline id
// Using the edit parameter return the list of updates and adds for the split roads
return {
    'result': id,
    'edit': [{'className': 'RoadCenterline', 'adds': adds, 'updates': updates}]
};