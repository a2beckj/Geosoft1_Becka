// jshint esversion: 6

/**
* Lösung zu Aufgabe 4, Geosoft 1, SoSe 2020
* @author Judith Becka   Matr.Nr.: 426693
*/

// load map
var map2 = L.map('map2').setView([51.9606649, 7.6261347], 11);

// load OSM-Layer
var osmLayer =new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',   
{attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});

// add OSM-Layer to map
osmLayer.addTo(map2);


/**
 * @description This function gets the users current Location
  */
 
function getLocation(){
  if (navigator.geolocation) {
      // get the users current location and use it with the showPosition-function
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      // if the browser can't access location; Error-Message
      y.innerHTML = "Geolocation is not supported by this browser.";
    }
}

// initialize global array to storde coordinates of user's current location
//var pnt =[]

/**
* @description This function fills the pnt-array with the users coordinates, creates a marker on that 
* location and zooms onto that marker by calling the function centerLeafletMapOnMarker(). After that
* it calls the function busstops().
* @param {array} position - users current location
*/
function showPosition(position) {
  const pnt =[]
  // push coordinates into array
  pnt.push(position.coords.longitude, position.coords.latitude);
  console.log(pnt);
  // create marker on coordinates
  var marker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(map2);
  // zoom to that marker
  centerLeafletMapOnMarker(map2, marker);
  console.log(pnt);
  // call function busstops().
  busstops(pnt);
}

/**
   * time
   * @desc takes a second-value (as in seconds elapsed from jan 01 1970) of the time and returns the corresponding time.
   * source: https://stackoverflow.com/a/35890816
   * @param seconds time in milliseconds
   */
  function time(seconds) {
    seconds = parseInt(seconds); //ensure the value is an integer
    var ms = seconds*1000;
    var time = new Date(ms).toISOString().slice(11, -5);
    return time + " GMT";
  }


/**
 * @description This function gets the busstops of Münster by attaching to the API.
 */
function busstops(pnt){

  //clears the existing table except the head row
  var table = document.getElementById("myTable");
  for(var i = table.rows.length - 1; i > 0; i--){
      table.deleteRow(i);
  }

var url = "https://rest.busradar.conterra.de/prod/haltestellen";
fetch(url)
.then(function(response){
  //console.log(response.text);
  return response.json();
})
.then(function(json){
 // initialize output array
 var narr =[];
  
 // for every busstop do the following:
 for (i=0; i< json.features.length; i++ ){
     // get name of busstop
     var lagebez = json.features[i].properties.lbez;
     //get id of busstop
     var lageid = json.features[i].properties.nr;
     //get coordinates of busstop
     var coords = json.features[i].geometry.coordinates;
     //get distance of busstop
     var distance = dist(pnt, coords);
     //get direction of busstop
     var direction = direc(pnt, coords);
     //save all the data above in a single array
     var inarr = [lagebez, lageid, coords, distance, direction];
     //push the array into the output array
     narr.push(inarr);
 }
    console.log(narr);
 
    // for every busstop do the following:
    for (i=0; i<narr.length; i++){
    // extract latitude in a variable
    var lat = narr[i][2][1];
    // exctract longitude in a variable
    var lon = narr[i][2][0];
   
    // create pop-up Text
    var popupText = ("<b>"+narr[i][0]+"</b><br> Entfernung: "+ narr[i][3]+" m <br> Richtung: "+narr[i][4])

   
    // create circles on the coordinates of the busstations
    var circle = new L.circle([lat, lon], {
      color: 'black',
      fillColor: 'green',
      fillOpacity: 0.5,
      radius: 4
    });

    // add those circles to the existing map
    map2.addLayer(circle);
   
    // attach the pop-up to the circles     
    circle.bindPopup(popupText);
    }
    narr.sort(
      function(a,b) {
      return a[3] - b[3];
      });
    
    var stops = narr.slice(0,5);
    console.log(stops);
    lines(stops); 
})

.catch(function(error){
  console.log("Fehler");
})
//table(closestStop);
}


function lines(busstops){
  
  
  //let o = inicall;
  var w = [];
  //console.log(busstations)
  for (i=0; i<busstops.length; i++){
    console.log(busstops.length);
    var busid = busstops[i][1];
    let busline = busstops[i];
    
    //console.log(busid);
    var url = "https://rest.busradar.conterra.de/prod/haltestellen"+"/"+busid+"/abfahrten?sekunden="+1200;
    //console.log(url);
    fetch(url)
    .then(function(response){
      //console.log(response.text);
      return response.json();
    })
    .then(function(json){
      //console.log(json.length);
      let arr = [];
      for (j=0; j < json.length; j++){
          var d = time(json[j].tatsaechliche_abfahrtszeit)
          arr.push(json[j].linienid, d);
          //console.log(arr);
         
      }
     
      busline.push(arr);
      console.log(busline);
      table(busline);
      
      
    })
    .catch(function(error){
      console.log("Fehler");
    })
    //console.log(w);
    //w.push(busline);
    //console.log(w);
   
    
  }
  //w.push(busline);
  //table(w);
  //console.log(w);
  //table(w);
}


function table(busstop){
  console.log(busstop)

  //clears the existing table except the head row
  var table = document.getElementById("myTable");
  /*for(var i = table.rows.length - 1; i > 0; i--){
      table.deleteRow(i);
  }*/


    // Dynamically create table with required values
    //for (j = 0; j < busstop.length; j++){
      //console.log(busstop[j]);
        // console.log(result\[j]);
        //console.log(JSON.stringify(result[j]));

        var table = document.getElementById("myTable"); // connect to table in html
        var row = table.insertRow(-1); // attach new row below existing

        // insert cells in new row
        var Stop = row.insertCell(0);
        var D = row.insertCell(1);
        var Dir = row.insertCell(2);
        var Bus = row.insertCell(3);

        // insert required values into new cells
        Stop.innerHTML = busstop[0];
        D.innerHTML = busstop[3];
        Dir.innerHTML = busstop[4];
        Bus.innerHTML = busstop[5];
        
    }
  //}

/*
function lines(buslines){

  buslines.sort(
    function(a,b) {
    return a[3] - b[3];
    });
  
    // save the closest 5 busstops in the global array   
    const closestStop = buslines[0];
    console.log(closestStop);
    var busid = closestStop[1];
    console.log(busid);
    
   
    //console.log(busid);
    var url = "https://rest.busradar.conterra.de/prod/haltestellen"+"/"+busid+"/abfahrten?sekunden="+1500;
    console.log(url);
    fetch(url)
    .then(function(response){
      //console.log(response.text);
      return response.json();
    })
    .then(function(json){
      console.log(json.length);
      let arr = [];
      for (j=0; j < json.length; j++){
            //var utcSeconds = 1234567890;
            var d = time(json[j].tatsaechliche_abfahrtszeit); // The 0 there is the key, which sets the date to the epoch
            //d.setUTCSeconds(utcSeconds);
            console.log(d);
          arr.push(json[j].linienid, d);
         console.log(arr);
      }
     
      closestStop.push(arr);
      table(closestStop);
      
    })
    .catch(function(error){
      console.log("Fehler");
    })
    //table(closestStop);
  }
  

function table(busstop){
  //clears the existing table except the head row
  var table = document.getElementById("myTable");
  for(var i = table.rows.length - 1; i > 0; i--){
      table.deleteRow(i);
  } 

  //var table = document.getElementById("myTable"); // connect to table in html
  var row = table.insertRow(-1); // attach new row below existing

  // insert cells in new row
  var name = row.insertCell(0); 
  var D = row.insertCell(1);
  var Dir = row.insertCell(2);
  var li = row.insertCell(3);

  // insert required values into new cells
  name.innerHTML = busstop[0];
  D.innerHTML = busstop[3];
  Dir.innerHTML = busstop[4];
  li.innerHTML = busstop[5];
}
*/


/**
 * @description This function zooms to a markers current extend
 * @param {Leaflet Map} map - a given leaflet Map
 * @param {a Laeflet Marker} marker - a given Leaflet Marker
 */
function centerLeafletMapOnMarker(map, marker) {
  // get coordinates of Marker
  var latLngs = [ marker.getLatLng() ];
  // define bounds according to the coordinates
  var markerBounds = L.latLngBounds(latLngs);
  // zoom to that bounds
  map.fitBounds(markerBounds);
}


function displayFromMongo(mapid, dragging){

    $.ajax({  url: "//localhost:3000/item",  
              //dataType: "jsonp",     
              type: "GET",
                  
                  success: function(y){
                      console.log(y);

                    for (i=0; i<y.length; i++){
                        console.log(y[i]);
                        if (y[i].type == "Point"){
                            var coordsPoint_lat = JSON.parse(y[i].coordinates[0]);
                            var coordsPoint_lon = JSON.parse(y[i].coordinates[1]);
                            var featureId = (y[i]);
                            console.log(featureId);
                            console.log([coordsPoint_lon, coordsPoint_lat]);
                            var marker = L.marker([coordsPoint_lon, coordsPoint_lat], {draggable: dragging});
                            mapid.addLayer(marker);
                            marker.on('drag', function(ev){
                              document.getElementById("geojsontextarea").value = JSON.stringify(marker.toGeoJSON())
                              updateToMongo();
                            })

                        }
                        else if (y[i].type == "Feature"){
                          //console.log(y[i].features.length);
                          //for (j=0; j<y[i].features.length; j++){
                              var coords_lat = JSON.parse(y[i].geometry.coordinates[0]);
                              var coords_lon = JSON.parse(y[i].geometry.coordinates[1]);
                              var featureId =(y[i]);
                              console.log(featureId);
                              console.log([coords_lon, coords_lat]);
                              //var coords = y[i].features[j].geometry.coordinates;
                             //console.log(coords);
                              var marker = L.marker([coords_lon, coords_lat], {draggable: dragging});
                              console.log(marker);
                              mapid.addLayer(marker);
                              marker.on('drag', function(ev){
                                document.getElementById("geojsontextarea").value = JSON.stringify(marker.toGeoJSON())
                                updateToMongo();
                              })
                          }
                      

                        else if (y[i].type == "FeatureCollection"){
                            //console.log(y[i].features.length);
                            for (j=0; j<y[i].features.length; j++){
                                var coords_lat = JSON.parse(y[i].features[j].geometry.coordinates[0]);
                                var coords_lon = JSON.parse(y[i].features[j].geometry.coordinates[1]);
                                var featureId =(y[i]);
                                console.log(featureId);
                                console.log([coords_lon, coords_lat]);
                                //var coords = y[i].features[j].geometry.coordinates;
                               //console.log(coords);
                                var marker = L.marker([coords_lon, coords_lat], {draggable: dragging});
                                console.log(marker);
                                mapid.addLayer(marker);
                                marker.on('drag', function(ev){
                                  document.getElementById("geojsontextarea").value = JSON.stringify(marker.toGeoJSON())
                                  updateToMongo();
                                })
                            }
                        }
                        else {console.log("keine Koordinate")}
                    }}
                  
                })
            }
          
map2.addEventListener('click', function(ev) {
        lat = ev.latlng.lat;
        lng = ev.latlng.lng;
        console.log(lng, lat);
        busstops([lng, lat]);
             });


function updateToMongo(){
  //console.log(marker);

  var locations = JSON.parse(document.getElementById("geojsontextarea").value);
  //console.log(locations);

  console.log("keinError");
  $.ajax({  url: "//localhost:3000/item",       
            type: "PUT",
            data: locations,
            success: function(){
              

              console.log("Feature aktualisiert");
            }
          })
}  

  


/**
 * @description This function takes the input coordinates from an oringin and a destination as arrays
 * and calculates the distance from the origin point to that destination point
 * @param {array} origin - the single point that is the origin to other points
 * @param {array} dest - a single point to which the distance has to be calculated to
 * @return {number} d - the distance
  */

var dist = function(origin, dest){

    //get coordinates of point
    var lon1 = origin[0];
    var lat1 = origin[1];
    var lon2 = dest[0];
    var lat2 = dest[1];

    //degrees to radiants
    var R = 6371e3; // metres
    var φ1 = lat1 * (Math.PI/180);
    var φ2 = lat2 * (Math.PI/180);
    var φ3 = lon1 * (Math.PI/180);
    var φ4 = lon2 * (Math.PI/180);
    var Δφ = (lat2-lat1) * (Math.PI/180);
    var Δλ = (lon2-lon1) * (Math.PI/180);

    //calculate distances
    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    //distance
    var d = Math.round(R * c);

    return d;
}


/**
 * @description This function takes the input coordinates from an oringin and a destination as arrays
 * and calculates the direction from the origin point to that destination point as string (e.g N/S/SE etc.)
 * @param {array} origin - the single point that is the origin to other points
 * @param {array} dest - a single point to which the direction has to be calculated to
 * @return {string} text - the direction in text format (e.g. "N"/"SE" etc.)
  */

var direc = function(origin, dest){

    //get coordinates of point
    var lon1 = origin[0];
    var lat1 = origin[1];
    var lon2 = dest[0];
    var lat2 = dest[1];

    //degrees to radiants
    var R = 6371e3; // metres
    var φ1 = lat1 * (Math.PI/180);
    var φ2 = lat2 * (Math.PI/180);
    var φ3 = lon1 * (Math.PI/180);
    var φ4 = lon2 * (Math.PI/180);
    var Δφ = (lat2-lat1) * (Math.PI/180);
    var Δλ = (lon2-lon1) * (Math.PI/180);

    //bearing
    var y = Math.sin((φ4-φ3) * Math.cos(φ2));
    var x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(φ4-φ3);
    var brng = Math.atan2(y,x)*180/Math.PI;

    //avoid negative bearing
    if (brng < 0) {
        brng += 360;
    }

    //direction derived from bearing
    switch(true){
        case (brng < 22.5):
            var text = "N";
            break;
        case (brng < 67.5):
            text = "NE";
            break;
        case (brng < 112.5):
            text = "E";
            break;
        case (brng < 157.5):
            text = "SE";
            break;
        case (brng < 202.5):
            text = "S";
            break;
        case (brng < 247.5):
            text = "SW";
            break;
        case (brng < 292.5):
            text = "W";
            break;
        case (brng < 337.5):
            text = "NW";
            break;
        case (brng < 360):
            text = "N";
        }

        return text
    }

