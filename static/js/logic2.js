// Selectable backgrounds of our map - tile layers:
// grayscale background.
function makethemap(data) {
  var graymap_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoibWFudWVsYW1hY2hhZG8iLCJhIjoiY2ppczQ0NzBtMWNydTNrdDl6Z2JhdzZidSJ9.BFD3qzgAC2kMoEZirGaDjA");

  // satellite background.
  var satellitemap_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoibWFudWVsYW1hY2hhZG8iLCJhIjoiY2ppczQ0NzBtMWNydTNrdDl6Z2JhdzZidSJ9.BFD3qzgAC2kMoEZirGaDjA");

  // outdoors background.
  var outdoors_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoibWFudWVsYW1hY2hhZG8iLCJhIjoiY2ppczQ0NzBtMWNydTNrdDl6Z2JhdzZidSJ9.BFD3qzgAC2kMoEZirGaDjA");
  // Add ocean bathymetry from Esri to show bottom topography
  var oceans = L.esri.basemapLayer("Oceans");

  // map object to an array of layers we created.
  // Geographic center of the United States is used to start
  if (earthquakeMap) { earthquakeMap.remove() }
  var earthquakeMap = L.map("earthquake_map", {
    center: [39.8283, -98.5795],
    zoom: 3,
    scrollWheelZoom: false,
    // layers: [graymap_background, satellitemap_background, outdoors_background]
    layers: [graymap_background, satellitemap_background, outdoors_background]
  });
  earthquakeMap.on('click', function () {
    if (earthquakeMap.scrollWheelZoom.enabled()) {
      earthquakeMap.scrollWheelZoom.disable();
    } else {
      earthquakeMap.scrollWheelZoom.enable();
    }
  });

  // adding one 'graymap' tile layer to the map.
  oceans.addTo(earthquakeMap);
  // oceans.addTo(map);
  // layers for two different sets of data, earthquakes and tectonicplates.
  var tectonicplates = new L.LayerGroup();
  var earthquakes = new L.LayerGroup();

  // base layers
  var baseMaps = {
    Satellite: satellitemap_background,
    Grayscale: graymap_background,
    LandOcean: oceans
  };

  // overlays 
  var overlayMaps = {
    "Tectonic Plates": tectonicplates,
    "Earthquakes": earthquakes
  };

  // control which layers are visible.
  L.control
    .layers(baseMaps, overlayMaps)
    .addTo(earthquakeMap);

  // retrieve earthquake geoJSON data.


  // console.dir(data);
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Define the color of the marker based on the magnitude of the earthquake.
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#ea2c2c";
      case magnitude > 4:
        return "#ea822c";
      case magnitude > 3:
        return "#ee9c00";
      case magnitude > 2:
        return "#eecc00";
      case magnitude > 1:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }


  L.geoJson(statesData, { style: style }).addTo(earthquakeMap);
  // define the radius of the earthquake marker based on its magnitude.

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 2;
  }

  // add GeoJSON layer to the map
  var tsunami_sum = 0;
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      // tsunami_sum=0;
      if (feature.properties.tsunami === 1) {
        tsunami_sum = tsunami_sum + 1;
        return L.marker(latlng)
      };
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function (feature, layer) {
      var eqEpoch = new Date(feature.properties.time); //Epoch time in msec from Jan 1, 1970
      var eqDate = "<br>" + eqEpoch.toLocaleString("en-US");
      // var eqDate= eqEpoch.toGMTString()+"<br>"+ eqEpoch.toLocaleString();
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place
        + "<br>DTG: " + eqDate);
    }

  }).addTo(earthquakes);

  earthquakes.addTo(earthquakeMap);

  // Add legend using code from Leaflets website
  var legend_eq = L.control({
    position: "bottomright"
  });


  legend_eq.onAdd = function () {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5, 6];
    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += " <legend_eq i style='background: " + colors[i] + "'></i> " + "Mag " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };


  legend_eq.addTo(earthquakeMap);

  // Add tsunami legend using code from Leaflets website
  var legend2 = L.control({
    position: "bottomleft"
  });


  legend2.onAdd = function () {
    var div = L
      .DomUtil
      .create("div", "info legend2");

    var colors = ["#ea2c2c"];
    div.innerHTML += "<style='background: " + colors + "'> " + "Tsunami conditions Pin markers = " + tsunami_sum;

    return div;
  };
  // legend2.addTo(earthquakeMap)
  if (tsunami_sum != 0) legend2.addTo(earthquakeMap);

  // retreive Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function (platedata) {

      L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
        .addTo(tectonicplates);

      // add the tectonicplates layer to the map.
      tectonicplates.addTo(earthquakeMap);
    });
  // load CDC data
  d3.json("https://data.cdc.gov/resource/bi63-dtpu.json", function (data) {
    console.dir(data)
  });

  // Load state boundaries and population density for heatmap
  d3.json("https://data.cdc.gov/resource/bi63-dtpu.json", function (data) {
    console.dir(data)
  });

  function getColor2(density) {
    switch (true) {
      case density > 1000:
        return "#ea2c2c";
      case density > 500:
        return "#ea822c";
      case density > 200:
        return "#ee9c00";
      case density > 100:
        return "#eecc00";
      case density > 50:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }
  // 
  function style(feature) {
    return {
      fillColor: getColor2(feature.properties.density),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }
  d3.json("https://leafletjs.com/examples/choropleth/us-states.js", function (statesData) {
    console.dir(statesData)
  });
  function getColor2(density) {
    switch (true) {
      case density > 1000:
        return "#ea2c2c";
      case density > 500:
        return "#ea822c";
      case density > 200:
        return "#ee9c00";
      case density > 100:
        return "#eecc00";
      case density > 50:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }
  // 
  function style(feature) {
    return {
      fillColor: getColor2(feature.properties.density),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }
  L.geoJson(statesData, { style: style }).addTo(earthquakeMap);

}
d3.json("/api/map/earthquake", makethemap);
d3.select("#refresh_button")
  .on("click", function () {
    console.log("Refreshing the map")
    d3.json("/api/map/earthquake/refresh", makethemap)
  })