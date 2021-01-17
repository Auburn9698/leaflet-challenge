// Store USGS URL for weekly data:
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryURL, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    console.log(data)
    createFeatures(data.features);
});

// Function for circle color:
function circleColor(mag) {
  if (mag < 1) {
    return "lightgray"
  }
  else if (mag < 2) {
    return "lightblue"
  }
  else if (mag < 3) {
    return "lightgreen"
  }
  else if (mag < 4) {
    return "yellow"
  }
  else if (mag < 5) {
    return "orange"
  } 
  else if (mag < 6) {
    return "red"
  }
  else if (mag < 7) {
    return "maroon"
  }
  else {
    return "white"
  }
}

// Function for circle size:
function circleSize(magnitude) {
    return magnitude * 10000
};

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
          return L.circle(latlng, {
            radius: circleSize(feature.properties.mag),
            fillColor: circleColor(feature.properties.mag),
            fillOpacity: .5,
            color: "#000000",
            weight: .5,
          });
        },
        onEachFeature: onEachFeature
      });
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  };
  
function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });
  
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Light Map": lightmap
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      "Earthquake locations": earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [36.998, -109.0452],
        zoom: 5,
        layers: [lightmap, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  };