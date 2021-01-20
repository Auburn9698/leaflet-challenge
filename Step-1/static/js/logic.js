// Store USGS URL for weekly data:
var quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(quakeURL, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    console.log(data)
    createFeatures(data.features);
});



faultlines = new L.LayerGroup();
 d3.json(platesURL, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  console.log(data.features);
  L.geoJSON(data ,{
      color : "orange"
      })
      .addTo(faultlines);
});


// Function for circle color:
function circleColor(depth) {
  if (depth < 0) {
    return "MidnightBlue"
  }
  else if (depth < 2) {
    return "MediumBlue"
  }
  else if (depth < 4) {
    return "RoyalBlue"
  }
  else if (depth < 6) {
    return "DodgerBlue"
  }
  else if (depth < 8) {
    return "SkyBlue"
  } 
  else if (depth < 10) {
    return "LightSkyBlue"
  }
  else if (depth < 12) {
    return "LightBlue"
  }
  else {
    return "white"
  }
};

// Function for circle size:
function circleSize(magnitude) {
    return magnitude * 20000
};

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p><p> Magnitude:" +  feature.properties.mag + ",  Depth: " + feature.geometry.coordinates[2] + "</p>");
    }
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
          return L.circle(latlng, {
            radius: circleSize(feature.properties.mag),
            fillColor: circleColor(feature.geometry.coordinates[2]),
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
  
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "dark-v10",
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
      "Light Map": lightmap, 
      "Night Mode": darkmap

    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      "Earthquake locations": earthquakes,
      "Faultlines": faultlines
    };
  
    // Create our default map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [36.998, -109.0452], // Four Corners, USA.
        zoom: 5,
        layers: [lightmap, earthquakes, faultlines]
    });

    // Now for our legend:
    var legend = L.control({ position: 'bottomright', background: "#F0FFFF" });
    legend.onAdd = function(myMap) {

        var div = L.DomUtil.create('div', 'info legend'),
            depths = [-2,0, 2, 4, 6, 8, 10, 12],
            labels = [];

        // Loop through our depth intervals and generate a label with a colored square for each interval
        for (var i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<b style="background:' + circleColor(depths[i] + 1) + '">&nbsp;&nbsp;&nbsp;&nbsp;</b> ' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
    
  };
