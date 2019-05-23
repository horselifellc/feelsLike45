// namespacing our app; everything lives in the ccApp object
const ccApp = {};
ccApp.locationArray = [];
ccApp.markerArray= [];
// makes a new map object, centred on Metro Hall at zoom level 15
ccApp.myMap = L.map('mapid').setView([43.646029, -79.389133], 15);

// adds our map to the page
ccApp.initMap = function() {
  // adds the tile layer to our map: the tiles are the visual appearance
  // we're using mapbox for the tiles, which requires an access token
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZGVyZWttdXJyIiwiYSI6ImNqdnlsd3UyeTBoOTE0Ym1pcnh1b203M3IifQ.SxW-l7DgfF6E9VZGX8pnvg'
  }).addTo(ccApp.myMap);

  // adds a popup to the marker -- again, we'll want to add all the popups in a separate function
  ccApp.getData();

};


ccApp.addPopup = function() {
	for(let i = 0; i < ccApp.markerArray.length; i++){
		const popupString = `<h5 class="popupName">${ccApp.locationArray[i].locationName}</h5> <h6 class="popupAddress">${ccApp.locationArray[i].locationAddress}</h6>`;
		ccApp.markerArray[i].bindPopup(popupString);
	}
}

ccApp.addMarkers = function() {
  ccApp.locationArray.forEach((object) => {
    ccApp.markerArray.push(L.marker([object.locationLat, object.locationLon]));
  })
  
  ccApp.markerArray.forEach( (marker) => {
	marker.addTo(ccApp.myMap);
  }); 
  ccApp.addPopup();
}


ccApp.getData = function() {
  return $.ajax({
    url: `http://app.toronto.ca/opendata//ac_locations/locations.json?v=1.00`,
    dataType: 'json',
    method: 'GET'
  }).then( (coolingCentres) => { 
    // for each object in our dataset, we pull the relevant parts and make a new clean array
    coolingCentres.forEach( (info) => { 

      // each index in the array in an object with the location information
      ccApp.locationArray.push({
        locationName: info.locationName + " " + info.locationDesc,
        locationAddress: info.address,
        locationPhone: info.phone,
        locationNotes: info.notes,
        locationLat: info.lat,
        locationLon: info.lon
      });
    });
    ccApp.addMarkers();
  });

}


// once the document is ready, call the init functions to start the app
$(document).ready(function () {
  ccApp.initMap();
  // ccApp.getData();
});