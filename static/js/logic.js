// Define streetmap and darkmap layers
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });
// Create our map, giving it the streetmap and earthquakes layers to display on load
var map = L.map("mapid",
    {
        center: [0.000, -30.00],
        zoom: 1
    });
streetmap.addTo(map);
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";
// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    console.log(data);
    function mapStyle(features) {
        var style =
        {
            fillColor: markerColor(features.geometry.coordinates[2]),
            radius: markerSize(features.properties.mag),
            opacity: 1,
            weight: 1
        };
        return style;
    }
    // This will make our marker's size proportionate to its magnitude
    function markerSize(mag) {
        return mag * 3;
    }
    //This will make our marker's color dependent on the depth 
    function markerColor(depth) {
        if (depth <= 0) {
            return "limegreen";
        }
        else if (depth <= 20) {
            return "yellowgreen";
        }
        else if (depth <= 40) {
            return "orange";
        }
        else if (depth <= 60) {
            return "darkorange";
        }
        else if (depth <= 80) {
            return "red";
        }
        else if (depth <= 100) {
            return "chocolate";
        }
        else {
            return "darkred";
        };
    }
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
    L.geoJSON(data,
        {
            pointToLayer: function (features, latlng) {
                return L.circleMarker(latlng)
            },
            style: mapStyle,
            onEachFeature: onEachFeature
        }).addTo(map);
    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        var limits = [0, 1, 2, 3, 4, 5, 6, 7];
        var colors = ["limegreen", "yellowgreen", "orange", "darkorange", "red","chocolate", "darkred"];
        var labels = [];

        // Add min & max
        var legendInfo = "<h1>Depth of Earthquake</h1>" +
            "<div class=\"labels\">" +
            "<div class=\"min\">" + limits[0] + "</div>" +
            "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
            "</div>";

        div.innerHTML = legendInfo;

        limits.forEach(function (limit, index) {
            labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };
    // Adding legend to the map
    legend.addTo(map);
});