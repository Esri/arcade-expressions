// This rule will populate the edited features field with a value from an intersecting feature

var popup = `<!DOCTYPE html>
<html>
   <head>
      <style>
         #wrapper {
            position:absolute;
         }
         #tip {
            background-color:white;
            border:1px solid blue;
            display: none;
            position:absolute;
         }
      </style>
   </head>
   <body>
      <div id='wrapper'>
         <canvas id='ductbank'></canvas>
         <canvas id='tip' width=100 height=25></canvas>
      </div>
      <script>
         var width_from = {{ko_from_width}};
         var height_from = {{ko_from_height}};
         var width_to = {{ko_to_width}};
         var height_to = {{ko_to_height}};
         var from_duct_info = {{ko_from_duct_info}};
         var to_duct_info =  {{ko_to_duct_info}};
         //var from_duct_info = {"1":{"fill":1,"display":"Object ID: 416 : 6""},"2":{"fill":1,"display":"Object ID: 417 : 6""},"3":{"fill":1,"display":"Object ID: 418 : 6""},"4":{"fill":1,"display":"Object ID: 419 : 6""},"5":{"fill":1,"display":"Object ID: 420 : 6""},"6":{"fill":1,"display":"Object ID: 421 : 6""},"7":{"fill":1,"display":"Object ID: 422 : 6""},"8":{"fill":1,"display":"Object ID: 423 : 6""},"9":{"fill":1,"display":"Object ID: 424 : 6""},"10":{"fill":1,"display":"Object ID: 425 : 6""},"11":{"fill":1,"display":"Object ID: 426 : 6""},"12":{"fill":1,"display":"Object ID: 427 : 6""},"13":{"fill":1,"display":"Object ID: 428 : 6""},"14":{"fill":1,"display":"Object ID: 429 : 6""},"15":{"fill":1,"display":"Object ID: 430 : 6""},"16":{"fill":1,"display":"Object ID: 431 : 6""},"17":{"fill":1,"display":"Object ID: 432 : 6""},"18":{"fill":1,"display":"Object ID: 433 : 6""},"19":{"fill":1,"display":"Object ID: 434 : 6""},"20":{"fill":1,"display":"Object ID: 435 : 6""},"21":{"fill":1,"display":"Object ID: 436 : 6""},"22":{"fill":1,"display":"Object ID: 437 : 6""},"23":{"fill":1,"display":"Object ID: 438 : 6""},"24":{"fill":1,"display":"Object ID: 439 : 6""},"25":{"fill":1,"display":"Object ID: 440 : 6""},"26":{"fill":1,"display":"Object ID: 441 : 6""},"27":{"fill":1,"display":"Object ID: 442 : 6""},"28":{"fill":1,"display":"Object ID: 443 : 6""},"29":{"fill":1,"display":"Object ID: 444 : 6""},"30":{"fill":1,"display":"Object ID: 445 : 6""},"31":{"fill":1,"display":"Object ID: 446 : 6""},"32":{"fill":1,"display":"Object ID: 447 : 6""},"33":{"fill":1,"display":"Object ID: 448 : 6""},"34":{"fill":1,"display":"Object ID: 449 : 6""},"35":{"fill":1,"display":"Object ID: 450 : 6""},"36":{"fill":1,"display":"Object ID: 451 : 6""}};
         //var to_duct_info = {'2': {'fill': 0, 'display': 'dffftext'}, '6': {'fill': 1, 'display': 'blasdfh'}};
       
         // spacing
         var width_spacing = 60;
         var height_spacing = 40;
         var width_offset = 15;
         var height_offset = 15;
         // start values
         var y_val = 25;
         var x_start = 25;
         var largest_x = 0;
         // spacing between layouts
         var from_to_spacing = 50;
         // details
         var circle_radius = 10;
         var fill_color = 'blue';
         var fill_color_cable = 'red';
         var outline_color = 'black';
         var outline_width = 2;
         var txt_color = 'black'

         function draw_layout(wide, high, draw, duct_info) {
             var header_y = y_val;
             var ko_idx = 1
             for (high_idx = 0; high_idx < high; high_idx++) {
                 y_val = y_val + height_spacing + height_offset;
                 for (wide_idx = 0; wide_idx < wide; wide_idx++) {
                     x_val = wide_idx * width_spacing + width_offset + x_start;
                     largest_x = largest_x < x_val ? x_val : largest_x;
                     if (draw == false) {
                         continue;
                     }
                     ctx.beginPath();
                     ctx.arc(x_val, y_val, circle_radius, 0, 2 * Math.PI);
                     if (ko_idx.toString() in duct_info) {
                         if (duct_info[ko_idx.toString()]['fill'] === 1) {
                             ctx.fillStyle = fill_color;
                             ctx.fill();
                         }
                         if (duct_info[ko_idx.toString()]['fill'] === 2) {
                             ctx.fillStyle = fill_color_cable;
                             ctx.fill();
                         }
                         if ('display' in duct_info[ko_idx.toString()]) {
                             ctx.fillStyle = txt_color;
                             ctx.font = '12px arial';
                             var txt = duct_info[ko_idx.toString()]['display']
                             var txt_width = ctx.measureText(txt).width;
                             var lineheight = 15;
                             var lines = txt.split('_split_');
                             //var x = x_val - (txt_width/2); 
                             var x = x_val - circle_radius *2; 
                             var y = y_val + circle_radius *2 + 3;
                             for (var j = 0; j<lines.length; j++){
                                ctx.fillText(lines[j], x, y + (j*lineheight) );
                             }
                              //ctx.fillText(txt, x_val - (txt_width/2), y_val + circle_radius *2 + 5 );
                              circles.push({
                                 x: x_val,
                                 y: y_val,
                                 r: circle_radius+ 5,
                                 tip: duct_info[ko_idx.toString()]['display']
                             });
                         }
                     }
                     ctx.lineWidth = outline_width;
                     ctx.strokeStyle = outline_color;
                     ctx.stroke();
                     ko_idx++;
                 }
             }
             ctx.fillStyle = txt_color;
             ctx.font = '24px arial';
             var txt = wide + ' x ' + high;
             var txt_width = ctx.measureText(txt).width;
             ctx.fillText(txt, width_offset + x_val / 2 - txt_width / 2 - circle_radius + x_start/2, header_y + 30);
         }

         var elem = document.getElementById('ductbank');
         var ctx = elem.getContext('2d');
         var tipCanvas = document.getElementById('tip');
         var tipCtx = tipCanvas.getContext('2d');
         //var canvasOffset = elem.offset();
         var offsetX = elem.left;
         var offsetY = elem.top;
         
         // loop through and build height
         draw_layout(width_from, height_from, false);
         y_val = y_val + from_to_spacing;
         draw_layout(width_to, height_to, false);
         elem.height = y_val + from_to_spacing;
         elem.width = largest_x + 25;
         // reset variables
         y_val = 25;
         largest_x = 0;
         // draw the ducts
         var circles = [];
         draw_layout(width_from, height_from, true, from_duct_info);
         y_val = y_val + from_to_spacing;
         draw_layout(width_to, height_to, true, to_duct_info);

         elem.onmousemove = function (e) {
             mouseX = parseInt(e.clientX);
             mouseY = parseInt(e.clientY);
             // Put your mousemove stuff here
             var hit = false;
             for (var i = 0; i < circles.length; i++) {
                 var circle = circles[i];
                 var dx = mouseX - circle.x - circle_radius/2;
                 var dy = mouseY - circle.y - circle_radius/2;
                 if (dx < circle.r && dx>=0 && dy  < circle.r && dy >=0 ) {
                     
                     //console.log(dx + ':' + dy)
                     tipCanvas.style.display = 'block';
                     tipCanvas.style.left = (circle.x+ 10) + 'px';
                     tipCanvas.style.top = (circle.y -12) + 'px';
                     tipCtx.clearRect(0, 0, tipCanvas.width, tipCanvas.height);
                     //                  tipCtx.rect(0,0,tipCanvas.width,tipCanvas.height);
                     tipCtx.fillText(circle.tip, 5, 15);
                     hit = true;
                 }
             }
             if (!hit) {
                  console.log(dx + ':' + dy)
                 tipCanvas.style.display = 'none';

             }

         }
      </script>
   </body>
</html>`
// Function to check if a bit is in an int value
function has_bit(num, test_value) {
    // num = number to test if it contains a bit
    // test_value = the bit value to test for
    // determines if num has the test_value bit set
    // Equivalent to num AND test_value == test_value

    // first we need to determine the bit position of test_value
    var bit_pos = -1;
    for (var i=0; i < 64; i++) {
        // equivalent to test_value >> 1
        var test_value = Floor(test_value / 2);
        bit_pos++
        if (test_value == 0)
            break;
    }
    // now that we know the bit position, we shift the bits of
    // num until we get to the bit we care about
    for (var i=1; i <= bit_pos; i++) {
        var num = Floor(num / 2);
    }

    if (num % 2 == 0) {
        return false
    }
    else {
       return true
    }

}

var duct_count_high = 'ductcounthigh';
var duct_count_wide = 'ductcountwide';

// Create feature set to the intersecting class using the GDB Name
var intersecting_featset = FeatureSetByName($datastore, 'StructureJunction', [duct_count_high, duct_count_wide], true);
// Start point
var geom = Geometry($feature)
var start_point = geom['paths'][0][0];
// End Point
var end_point = geom['paths'][-1][1];
var knockout_sql = 'ASSETGROUP = 110 AND ASSETTYPE = 363'
var starting_knockout = First(Filter(Intersects(intersecting_featset, start_point), knockout_sql));
var ending_knockout = First(Filter(Intersects(intersecting_featset, end_point), knockout_sql));

var content_rows = FeatureSetByAssociation($feature, 'content');
var global_ids = [];
var i = 0;
for (var content_row in content_rows) {
    if (content_row.globalid == $feature.globalid) {
        continue;
    }
    global_ids[i++] = content_row.globalid;
}
var struct_line_fs = FeatureSetByName($datastore, 'StructureLine', ["OBJECTID","DUCTDIAMETER","FROMPORT","TOPORT", "GLOBALID", "ASSOCIATIONSTATUS", "AssetGroup", "AssetType"], true);

var duct_features = Filter(struct_line_fs, "globalid IN @global_ids");
var from_port_duct_details = {};
var to_port_duct_details = {};
var Comm_line_fs = FeatureSetByName($datastore, 'CommunicationsLine', ["OBJECTID","AssetID", "AssetGroup", "AssetType"], true);

for (var duct_feat in duct_features){
    var display = "" + duct_feat['OBJECTID'] + "-" + duct_feat['DUCTDIAMETER'] + 'in';
    var fill = 1;
    if(has_bit(duct_feat['ASSOCIATIONSTATUS'], 1)){
        var cable_content_rows = FeatureSetByAssociation(duct_feat, 'content');
        var global_ids = [];
        var i = 0;
        for (var content_row in cable_content_rows) {
            if (content_row.globalid == duct_feat.globalid) {
                continue;
            }
            global_ids[i++] = content_row.globalid;
        }
        var cable_features = Filter(Comm_line_fs, "globalid IN @global_ids");
        for (var cable_feature in cable_features){
            display = display + '_split_Cable - ' + cable_feature.objectid;
        }
        fill = 2;
    }
    from_port_duct_details[Text(duct_feat['FROMPORT'])] = {'fill': fill, 'display': display}
    to_port_duct_details[Text(duct_feat['TOPORT'])] = {'fill': fill, 'display': display}
}
// Check to make sure there was an intersected feature, if not, return the original value

if (starting_knockout != null) {
    var from_duct_info = {};
    popup = Replace(popup,'{{ko_from_width}}', starting_knockout[duct_count_high])
    popup = Replace(popup,'{{ko_from_height}}', starting_knockout[duct_count_wide])
    var duct_idx = 1;
    for (var wide_idx =0; wide_idx < starting_knockout[duct_count_wide]; wide_idx++)
    {
        for (var high_idx  =0; high_idx < starting_knockout[duct_count_high]; high_idx++)
        {
            if (HasKey(from_port_duct_details, Text(duct_idx)))
            {
                from_duct_info[Text(duct_idx)] = from_port_duct_details[Text(duct_idx)]
            }
            duct_idx += 1;
        }
    }
    popup = Replace(popup,'{{ko_from_duct_info}}', Text(from_duct_info))
}

if (ending_knockout != null) {
    var to_duct_info = {};
    popup = Replace(popup,'{{ko_to_width}}', ending_knockout[duct_count_high])
    popup = Replace(popup,'{{ko_to_height}}', ending_knockout[duct_count_wide])
    var duct_idx = 1;
    for (var wide_idx =0; wide_idx < ending_knockout[duct_count_wide]; wide_idx++)
    {
        for (var high_idx  =0; high_idx < ending_knockout[duct_count_high]; high_idx++)
        {
              if (HasKey(to_port_duct_details, Text(duct_idx)))
            {
                to_duct_info[Text(duct_idx)] = to_port_duct_details[Text(duct_idx)]
            }
            duct_idx += 1;
        }
    }
    popup = Replace(popup,'{{ko_to_duct_info}}', Text(to_duct_info))
}

return Text(popup)
