// This rule will split intersecting roads at their intersection and the address ranges will be updated to reflect where the split occured

// Define the Road Centerline fields
var centerlineid_field = "centerlineid";
var precenterlineid_field = "precenterlineid"
var fromleft_field = "fromleft";
var fromright_field = "fromright";
var toleft_field = "toleft";
var toright_field = "toright";

//Define any fields to be copied from the centerline when split (lower case)
var centerline_field_names = ["rclnguid", "discrpagid", "rangeprefixleft", "fromleft", "toleft", "parityleft", "rangeprefixright", "fromright", "toright", "parityright", "fullname", "fedroute", "fedrtetype", "afedrte", "afedrtetype", "stroute", "strtetype", "astrte", "astrtetype", "ctyroute", "onewaydir", "roadlevel", "inwater", "roadclass", "countryleft", "countryright", "stateleft", "stateright", "countyleft", "countyright","munileft", "muniright", "zipleft", "zipright", "msagleft", "msagright", "esnleft", "esnright"]

// Check if the line feature is used to manual split the intersecting road and not be added to the layer
// Otherwsie don't run the rule if the road was added by this rule from a previous insert
var manualSplit = false;
if (!HasKey($feature, precenterlineid_field)) return;
if ($feature[precenterlineid_field] == "Manual Split") {
    manualSplit = true;
}
else if (!IsEmpty($feature[precenterlineid_field]))
{
    return;
}

// Get the global id and geometry from the road
var globalid = $feature.globalid;
var geom = Geometry($feature);

var adds = [];
var updates = [];
var deletes = [];

var segments = [];

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

// This function splits a road using another road and returns an array of 2 geometries
// If a valid split does not occur return 2 geometries it returns null
function splitRoad(road, splitRoad) {
    // Cut the intersecting road and return if the result of the cut is 0 features
    var newRoads = Cut(road, splitRoad);
    if (Count(newRoads) < 2) return;

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
            Push(geometries, allParts[p]);
        }
    }

    // Process the cut if valid
    if (validCut) {

        var firstGeometry = null;
        var secondGeomArray = [];
        var firstPoint = road.paths[0][0];

        // Loop through each geometry in the cut
        // Store the geometry including the first vertex of the orginal road as the first geometry
        // Collect all other geometries in an array
        for (var i in geometries) {
            if (Equals(firstPoint, geometries[i].paths[0][0])) {
                firstGeometry = geometries[i];
            } else {
                Push(secondGeomArray, geometries[i]);
            }
        }

        // Merge all other geometries as the second geometry
        var secondGeometry = Union(secondGeomArray);
        return [firstGeometry, secondGeometry];
    }
    return;
}

// This function breaks the feature at all intersections with other roads in the dataset and populates an array of geometries
function breakRoadAtIntersections(geom, intersectingRoads) {
    // Test if a split occured
    var splitOccured = false;
    for (var i in intersectingRoads) {
        var geometries = splitRoad(geom, intersectingRoads[i]);
        if (IsEmpty(geometries)) continue;

        // If the two geometries are returned from the split process each to see if the can be split again
        splitOccured = true;
        breakRoadAtIntersections(geometries[0], intersectingRoads);
        breakRoadAtIntersections(geometries[1], intersectingRoads);
        break;
    }
    // If no split occured add the geometry to the segments array
    if (!splitOccured) {
        Push(segments, geom);
    }
}

var intersectingRoads = []
for (var road in Intersects(FeatureSetByName($datastore, "RoadCenterline"), geom)) {
    if (globalid == road.globalid || Equals(geom, Geometry(road))) continue;
    Push(intersectingRoads, road);
}
if (manualSplit) {
    Push(deletes, {'globalID': globalid})
    Push(segments, geom);
}
else {
    breakRoadAtIntersections(geom, intersectingRoads);
}

for (var i in segments) {
    // Update the geometry of the original feature to be the first segment from the array
    if (i == 0) {
        geom = segments[i];
    }
    else {
        // Store an add for a new road for each additional segment and copy the attributes from the original feature
        var featureAttributes = Dictionary(Text($feature))['attributes'];
        var newAttributes = {};
        for (var k in featureAttributes) {
            if (IndexOf(centerline_field_names, Lower(k)) > -1 && featureAttributes[k] != null) {
                newAttributes[k] = featureAttributes[k];
            } else {
                continue;
            }
        }
        // Update the precenterlineid field attribute so this rule is not re-run for this new segment
        newAttributes[precenterlineid_field] = "New";
        Push(adds, {
            'attributes': newAttributes,
            'geometry': segments[i]
        })
    }
}

// Split the roads using the new feature segments
for (var r in intersectingRoads) {
    var road = intersectingRoads[r];
    for (var i in segments) {
        var geometries = splitRoad(Geometry(road), segments[i]);
        if (IsEmpty(geometries)) continue;

        var firstGeometry = geometries[0];
        var secondGeometry = geometries[1];

        // Get the address range of the intersecting road
        var fromRight = road[fromright_field];
        var toRight = road[toright_field];
        var fromLeft = road[fromleft_field];
        var toLeft = road[toleft_field];

        // Calculate the new address ranges based on the intersection location along the line
        var geometryPercent = Length(firstGeometry, 'feet') / (Length(firstGeometry, 'feet') + Length(secondGeometry, 'feet'));
        var newToFromLeft = newToFrom(fromLeft, toLeft, geometryPercent)
        var newToFromRight = newToFrom(fromRight, toRight, geometryPercent)

        // Store an update for the intersecting road with the first geometry from the cut and the new right to and left to value
        var attributes = {}
        if (newToFromRight[0] != null) attributes[toright_field] = newToFromRight[0];
        if (newToFromLeft[0] != null) attributes[toleft_field] = newToFromLeft[0];
        Push(updates, {
            'globalID': road.globalid,
            'attributes': attributes,
            'geometry': firstGeometry
        })

        // Store an add for a new road with the second geometry from the cut and the new right from and left from value
        var featureAttributes = Dictionary(Text(road))['attributes'];
        var newAttributes = {};
        for (var k in featureAttributes) {
            if (Lower(k) == fromright_field && newToFromRight[1] != null) {
                newAttributes[fromright_field] = newToFromRight[1];
            } else if (Lower(k) == fromleft_field && newToFromLeft[1] != null) {
                newAttributes[fromleft_field] = newToFromLeft[1];
            } else if (IndexOf(centerline_field_names, Lower(k)) > -1 && featureAttributes[k] != null) {
                newAttributes[k] = featureAttributes[k];
            } else {
                continue;
            }
        }
        newAttributes[precenterlineid_field] = road[centerlineid_field];
        Push(adds, {
            'attributes': newAttributes,
            'geometry': secondGeometry
        })

        break;
    }
}

// Using the edit parameter return the list of updates and adds for the split roads and add alias names
return {
    "result": {
        "geometry": geom
    },
    'edit': [
        {'className': 'RoadCenterline', 'adds': adds, 'updates': updates, 'deletes': deletes}
    ]
};