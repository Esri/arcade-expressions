// This rule will create a new site address point when an address point is created along a road
// The site address point will be offset from the road by the distance and direction defined in the address point feature template

// This function will return the new point offset perpendicularly from a 2-point line segment at a specified distance
// Positive distance is to the left of the line. Negative distance is to the right of the line 

function offsetPoint(firstPoint, secondPoint, fromPoint, dist) {
    var x1 = firstPoint.x;
    var y1 = firstPoint.y;
    var x2 = secondPoint.x;
    var y2 = secondPoint.y;
    var x3 = fromPoint.x;
    var y3 = fromPoint.y;

    var a = y1 - y2;
    var b = x2 - x1;

    var norm = Sqrt(a*a + b*b);
    a = a / norm;
    b = b / norm;

    return [x3 + a * dist, y3 + b * dist]
}

// This function will return the address number of the new site address point
// It determines this based on the from and to address range on the intersecting road and the direction of the offset
function getAddrNum(road, percentAlong, dir) {
    var addrNum = null;
    var from = road.fromLeft;
    var to = road.toLeft;    
    if (Lower(dir) == 'right') {
        var from = road.fromRight;
        var to = road.toRight;    
    }
    if (from == null || to == null) return null;
    var val = percentAlong * (to - from);
    var addrNum = 0;
    
    if ((Floor(val) % 2) == 0) addrNum = Floor(val);
    else if ((Ceil(val) % 2) == 0) addrNum = Ceil(val);
    else addrNum = Floor(val) - 1;
    
    return from + addrNum;
}

// This function will return the intersected features geometry, the segment intersected and the distance along the line
function IntersectingLineSegmentDistance(sourceGeometry, intersectGeometry, interestedLines){
    // Loop through the intersecting lines and find the segment of the line
    for (var line in interestedLines) {
  var distanceAlongLine = 0;
        // Loop through the segments of the line. Handle multipart geometries
        for (var part in Geometry(line).paths) {
            var segment = Geometry(line).paths[part];

            // Loop through the points in the segment
            for (var i in segment) {
                if (i == 0) continue;

                // Construct a 2-point line segment from the current and previous point
                var firstPoint = segment[i-1];
                var secondPoint = segment[i]
                var twoPointLine = Polyline({ 'paths' : [[[firstPoint.x, firstPoint.y], [secondPoint.x, secondPoint.y]]], 'spatialReference' : firstPoint.spatialReference});

                // Test if the  point intersects the 2-point line segment
                if (Intersects(intersectGeometry, twoPointLine)) {
                    // Construct a 2-point line segment using the previous point and the address point
                    var lastSegment = Polyline({ 'paths' : [[[firstPoint.x, firstPoint.y], [sourceGeometry.x, sourceGeometry.y]]], 'spatialReference' : firstPoint.spatialReference});
                    // Add to the total distance along the line and break the loop
                    distanceAlongLine += Length(lastSegment);
                    return [line, twoPointLine, distanceAlongLine]
                }
                // Add to the toal distance along the line
                distanceAlongLine += Length(twoPointLine);
            }
        }
    }
    return null;
}

// Get the object id and geometry of the feature
var oid = $feature.OBJECTID;
var id = $feature.addressptid
var geom = Geometry($feature);

// Get the distance and direction defined in the address point feature template/
// If none specified defaults to 0 and Left
var dist = 0;
if ($feature.offdist != null) dist = $feature.offdist;
var dir = 'Left';
if ($feature.offdir != null) dir = $feature.offdir; 
if (Lower(dir) == 'right') dist *= -1

// Get the number of site address points and increment value from the address point feature template
// Defaults to 1 and 0 respectively
var numpoints = 1;
if ($feature.numpoints != null) numpoints = $feature.numpoints;
var increment = 0;
if ($feature.incrementval != null) increment = $feature.incrementval;
var captureMethod = $feature.capturemeth;
    
// Find any intersecting roads with the address point
// If no roads intersect buffer the source point to handle cases where road isn't exactly snapped to line and try again
// If no roads intersect the the buffer return an error message and prevent the address point from being created
var intersectGeometry = geom;
var intersectingRoads = Intersects(FeatureSetByName($datastore, "RoadCenterline"), intersectGeometry);
if (Count(intersectingRoads) == 0) {
 intersectGeometry = Buffer(geom, 5, 'feet');
 intersectingRoads = Intersects(FeatureSetByName($datastore, "RoadCenterline"), intersectGeometry);
 if (Count(intersectingRoads) == 0) return {
  "errorMessage": "Address Point must intersect at least one Road Centerline"
 };
}

// If the results are empty return an error message. This will occur if a point is created along a true curve.
// Prevent the address point from being created.
var results = IntersectingLineSegmentDistance(geom, intersectGeometry, intersectingRoads)
if (IsEmpty(results)) return {
    "errorMessage": "Failed to create the Address Point. This can occur when attempting to create an Address Point along a true curve segment. The Densify or Generalize tools can be used to convert the curve segment to a straight line segment."
}
var intersectingRoad = results[0];
var twoPtSegment = results[1];
var distanceAlongLine = results[2];

// Construct a new point geometry offset perpendicularly from the road
var xy = offsetPoint(twoPtSegment.paths[0][0], twoPtSegment.paths[0][1], geom, dist)
var newPoint = Point({ 'x' : xy[0], 'y' : xy[1], 'z' : 0, 'spatialReference' : geom.spatialReference });

// Get the new address number of the site address point based on the distance along the road and direction of the offset
var percentAlong = distanceAlongLine / Length(intersectingRoad);
var addrnum = getAddrNum(intersectingRoad, percentAlong, dir)

// Create an array of 1 or more new site address point as specified
// Store the related address point id, the calculated address number, the intersecting road name and set the status to Pending
var adds = []
for(var i=0; i<numpoints; i++) {
 adds[Count(adds)] = {
    'attributes': {
     'addressptid' : id, 'status': 'Pending', addrnum : addrnum, fullname : intersectingRoad.fullname, capturemeth : captureMethod
    },
    'geometry': newPoint
   }
 addrNum += increment;
}

// Return the original address point id
// Using the edit parameter create 1 or more new site address points
return {
    'result' : id,
    'edit': [{
        'className': 'SiteAddressPoint',
        'adds': adds
    }]
}