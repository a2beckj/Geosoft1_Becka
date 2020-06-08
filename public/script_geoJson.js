// jshint esversion: 6

/**
* Lösung zu Aufgabe 5, Geosoft 1, SoSe 2020
* @author Judith Becka   Matr.Nr.: 426693
*/

//const MongoClient = require ('mongodb').MongoClient;
//const mongourl = "mongodb://localhost:27017/";

var map = L.map('map').setView([51.9606649, 7.6261347], 11);


// load OSM-Layer
var osmLayer =new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',   
{attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});

// add OSM-Layer to map
osmLayer.addTo(map);

// Set up the edit control
// Only allow a single shape to be drawn
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControlFull = new L.Control.Draw({
  draw: {
    rectangle: false,
    polyline: false,
    circlemarker: false,  
    circle: false,
    polygon: false,
    marker: true, 
      
  },
    edit: {
        featureGroup: drawnItems
    }
});
var drawControlEditOnly = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: false
});
map.addControl(drawControlFull);

map.on(L.Draw.Event.CREATED, function (e) {
    drawnItems.addLayer(e.layer);
    drawControlFull.remove(map);
    drawControlEditOnly.addTo(map)
    //console.log(layer.getLatLngs());
    updateText();
});
map.on(L.Draw.Event.DELETED, function(e) {
   if (drawnItems.getLayers().length === 0){
        drawControlEditOnly.remove(map);
        drawControlFull.addTo(map);
        updateText();
    };
});

/**
 * @desc This function takes the value from the deleting-inputfield and calls 
 * the actual deleting function with this value
 */
function deleteItem(){
  var id = document.getElementById('delete').value;
  deleteFromMongo(id);
}


/**
 * @desc This function deletes the item from the input field via the given id
 * @param {id} id - id that refers to the marker-Object
 */
function deleteFromMongo(id){
// attach to MongoDB and update locations
$.ajax({  url: "/item",       
        type: "DELETE",
        data: {_id: id},//geoJSON: marker.toGeoJSON()},
        success: function(){
                 console.log("Feature gelöscht");
        }
      })
} 

/**
* @description creates a geojson text from the the drawnItems
*/
function updateText(){

  var f = (drawnItems.toGeoJSON());
  
  var coords = f.features[0].geometry.coordinates;
 
  var GeoJSON_Point = {}; 
    // Type of GeoJson
    GeoJSON_Point.type = "Point"; 
    //coordinates of GeoJson
    GeoJSON_Point.coordinates = coords;
    
    // Convert GeoJson to string and fill input field
    document.getElementById("geojsontextarea").value = JSON.stringify(GeoJSON_Point);
  //document.getElementById("geojsontextarea").value = JSON.stringify(drawnItems.toGeoJSON());


}

/**
 * @description This function takes the adress from a given input field and gets the corresponding JSON 
 * by calling the developers here geocoding API
 */
function InputLocation(){
  
    // get value from input field
    var input = $("#adress").val();
    
    // The API I'm using is: https://developer.here.com/documentation/geocoder/dev_guide/topics/what-is.html
    $.ajax({  url: "https://geocode.search.hereapi.com/v1/geocode", 
              dataType: "jsonp",
              // token from token.js
              data: {q: input, apiKey: api_key},          
              type: "GET",
              async: false,
              success: InputLocation_callback  
            });
    }
  
    /**
     * @description This function is the callback-function and it places the coordinates from the input adress
     * in a circle on the map and zooms to that point by calling the function centerLeafletMapOnMarker()
     * @param {JS-Object} y - the JS-Object derived from the JSON from the API (by jQuery)
     */
  function InputLocation_callback(y){
    console.log(y);
    
    // extract coordinates and store them in variables
    var lat = y.items[0].position.lat;
    var lon = y.items[0].position.lng;
   
    // create a circleMarker on that position
    var circle_input = new L.circleMarker([lat, lon], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0,
      radius: 12
    });
  
    // add circle to the existing map
    map.addLayer(circle_input);
    // zoom to that circle
    //centerLeafletMapOnMarker(map, circle_input);

    var GeoJSON_Loc = {}; 
    // Type of GeoJson
    GeoJSON_Loc.type = "Point"; 
    //coordinates of GeoJson
    GeoJSON_Loc.coordinates = [lon, lat];
    
    // Convert GeoJson to string and fill input field
    document.getElementById("geojsontextarea").value = JSON.stringify(GeoJSON_Loc);           
     
  }

// access href-element from html
var el = document.getElementById('foo');
// on href-click, execute function
el.onclick = inputToMongo;


/**
 * @desc This function loads the input from the textarea into MongoDB
 */
function inputToMongo(){
  //access textarea
  var locations = JSON.parse(document.getElementById("geojsontextarea").value);
 
  // attach to server and post locations from textarea to MongoDB
  $.ajax({  url: "//localhost:3000/item",       
            type: "POST",
            data: locations,
            success: function(x){}
          })
}   


// Textarea
var y = document.getElementById("geojsontextarea");

/**
 * @description This function gets the users current Location
  */
 function getLocation_geojson(){
  if (navigator.geolocation) {
      // get the users current location and use it with the showPosition-function
      navigator.geolocation.getCurrentPosition(showPosition_geojson);
    } else {
      // if the browser can't access location; Error-Message
      y.innerHTML = "Geolocation is not supported by this browser.";
    }
}

/**
* @description This function takes the users current location, converts it to GeoJson and
* replaces the input field with this point
* @param {array} position - users current location
*/
function showPosition_geojson(position) {
    const pnt =[]
    // push coordinates into array
    pnt.push(position.coords.longitude, position.coords.latitude);
    console.log(pnt);
    // create marker on coordinates and make draggable
    var marker = L.marker([position.coords.latitude, position.coords.longitude], {draggable: true}).addTo(map);
  
    // Convert GeoJson to string and fill input field
    y.value = JSON.stringify(marker.toGeoJSON());
    // when marker is dragged, fill textarea with new location
    marker.on('dragend', function(ev){
    document.getElementById("geojsontextarea").value = JSON.stringify(marker.toGeoJSON());
})}