// namespacing our app; everything lives in the ccApp object
const ccApp = {};

// adds our map to the page
ccApp.initMap = function() {
  // makes a new map object, centred on Metro Hall at zoom level 15
  const mymap = L.map('mapid').setView([43.646029, -79.389133], 15);

  // adds a new marker at the same lat & lon -- we'll want to move this to a separate function that adds all the markers
  const marker = L.marker([43.646029, -79.389133]).addTo(mymap);

  // adds the tile layer to our map: the tiles are the visual appearance
  // we're using mapbox for the tiles, which requires an access token
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZGVyZWttdXJyIiwiYSI6ImNqdnlsd3UyeTBoOTE0Ym1pcnh1b203M3IifQ.SxW-l7DgfF6E9VZGX8pnvg'
  }).addTo(mymap);

  // adds a popup to the marker -- again, we'll want to add all the popups in a separate function
  marker.bindPopup("<b>Metro Hall</b><br>55 John Street<br>Open 24 hours").openPopup();
};



ccApp.getData = function() {
  return $.ajax({
    url: `http://app.toronto.ca/opendata//ac_locations/locations.json?v=1.00`,
    dataType: 'json',
    method: 'GET'
  }).then((coolingCentres) => {


    let newArray = coolingCentres.map((info)=>{
      return info.locationName + " " + info.locationDesc + " " + info.address + " " + info.phone + " " + info.notes + " " + info.lat + " " + info.lon;  
    });

    console.log(newArray);

  })
}










// once the document is ready, call the init functions to start the app
$(document).ready(function () {
  ccApp.initMap();
  ccApp.getData();
});