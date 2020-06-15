

// jshint esversion: 6

/**
* Lösung zu Aufgabe 5, Geosoft 1, SoSe 2020
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
* @description This function gets the busstops of Münster by attaching to the API and calculates the closest 5 bussops 
* to a specific position
* @param {array} pnt - the position that the calcualtions are based on
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

// sort busstops by distance to the users location
narr.sort(
  function(a,b) {
  return a[3] - b[3];
  });

// only take the 5 clostest busstops into consideration
var stops = narr.slice(0,5);

// get buslines by bussops
lines(stops); 
})

// if can't access data
.catch(function(error){
console.log("Fehler");
})
}

/**
*@desc This function determines the next lines departuring from the clostest busstops
*@param {array} busstops - The closest 5 busstops to users position
*/
function lines(busstops){
// for every busstop do the following
for (i=0; i<busstops.length; i++){

var busid = busstops[i][1];
let busline = busstops[i];

// access data from API to get buslines that depart from busstop
var url = "https://rest.busradar.conterra.de/prod/haltestellen"+"/"+busid+"/abfahrten?sekunden="+1200;

fetch(url)
.then(function(response){
  return response.json();
})
.then(function(json){
  let arr = [];
  for (j=0; j < json.length; j++){
      var d = time(json[j].tatsaechliche_abfahrtszeit)
      // attach lines and departuretime from busstop
      arr.push(json[j].linienid, d);             
  }
  busline.push(arr);
  // create table for each busstop
  table(busline);
})
// if can't access data
.catch(function(error){
  console.log("Fehler");
})    
}
}

/**
*@desc This function creates the table with closest busstops and further information
*@param {array} busstop - The busstop that that table row is created from
*/

function table(busstop){
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

/**
* @desc This function displays data from MongoDB on Leaflet Map
* @param {id} mapid The map that the data should be displayed on
* @param {boolean} dragging define wheather dragging markers is enabled or not
*/
function displayFromMongoMap2(mapid, dragging){
//connect to data in MongoDB
$.ajax({  url: "//localhost:3000/item",       
          type: "GET",
          success: function(y){
            console.log(y)
                  // for every Object in the data do the following
                  for (i=0; i<y.length; i++){
                    // if data is a point
                    if (y[i].type == "Point"){
                        var coordsPoint_lat = JSON.parse(y[i].coordinates[0]);
                        var coordsPoint_lon = JSON.parse(y[i].coordinates[1]);
                        let id = y[i]._id;
                        // create marker
                        var marker = L.marker([coordsPoint_lon, coordsPoint_lat], {draggable: dragging, id: y[i]._id});
                        // add marker to map
                        mapid.addLayer(marker);
                                                
                        // create marker event thar marker can be dragged
                        marker.on('drag', function(ev){
                          
                          document.getElementById("geojsontextarea").value = JSON.stringify(marker.toGeoJSON());
                          
                          // Update marker in MongoDB
                          updateToMongo(marker);
                        })
                    }
                    // if data is a featurePoint
                    else if (y[i].type == "Feature"){
                      
                        var coords_lat = JSON.parse(y[i].geometry.coordinates[0]);
                        var coords_lon = JSON.parse(y[i].geometry.coordinates[1]);
                        let id1 = y[i]._id;
                        // create marker
                        var marker = L.marker([coords_lon, coords_lat], {draggable: dragging, id: y[i]._id});
                        // add marker to map
                        mapid.addLayer(marker);
                         
                        // create marker event thar marker can be dragged
                        marker.on('drag', function(ev){
                          document.getElementById("geojsontextarea").value = JSON.stringify(marker.toGeoJSON());
                          
                          //update marker in MongoDB
                          updateToMongo(marker);
                          })
                      }
                    // if data is a featureCollection
                    else if (y[i].type == "FeatureCollection"){
                        // for every feature in featureCollection do the following
                        for (j=0; j<y[i].features.length; j++){
                            var coords_lat = JSON.parse(y[i].features[j].geometry.coordinates[0]);
                            var coords_lon = JSON.parse(y[i].features[j].geometry.coordinates[1]);
                            let id2 = y[i]._id;
                            // create marker
                            
                            const marker = L.marker([coords_lon, coords_lat], {draggable: dragging, id: y[i]._id});
                            // add marker to map
                            mapid.addLayer(marker);
                                                      
                            // create marker event that marker can be dragged
                            marker.on('drag', function(ev){
                              
                              document.getElementById("geojsontextarea").value = JSON.stringify(marker.toGeoJSON())
                              // update marker in MongoDB
                              updateToMongo(marker);
                            })
                        }
                    }
                    // if object is invalid
                    else {console.log("keine Koordinate")}
                }} 
        })
}

// on click on marker, calculate new clostest busstops and buslines
map2.addEventListener('click', function(ev) {
    lat = ev.latlng.lat;
    lng = ev.latlng.lng;
   
    busstops([lng, lat]);
         });


/**
* @desc This function takes updated Markerlocations from textarea and replaces them in MongoDB
* @param {Leaflet marker} marker - marker that has to be updated
*/
function updateToMongo(marker){
// attach to MongoDB and update locations
$.ajax({  url: "/item",       
        type: "PUT",
        data: {_id: marker.options.id, geoJSON: marker.toGeoJSON()},
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

