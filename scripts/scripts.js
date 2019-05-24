// namespacing our app; everything lives in the ccApp object
const ccApp = {};
ccApp.neighbourhoodArray =[
	{
		neighbourhood: "East York",
		lat: 43.691162,
    lon: -79.328819,
    id: 0
	},
	{
		neighbourhood: "Etobicoke",
		lat: 43.643852,
    lon: -79.565060,
    id: 1
	},
	{
		neighbourhood: "North York",
		lat: 43.767719,
    lon: -79.412819,
    id: 2
	},
	{
		neighbourhood: "Scarborough",
		lat: 43.769409,
    lon: -79.263742,
    id: 3
	},
	{
		neighbourhood: "Toronto Centre",
		lat: 43.646006,
    lon: -79.389362,
    id: 4
	},
	{
		neighbourhood: "York",
		lat: 43.689440,
    lon: -79.476442,
    id: 5
	},
	{
		neighbourhood: "Select All",
		lat: 43.646006,
		lon: -79.389362,
		id: 6
	}
];

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
	 

  // call our getData function to make our ajax call
  ccApp.getData();
};

// ajax call to get data
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
		locationLon: info.lon,
		locationID: ccApp.getLocationID(info)
	  });
	});
	
	  console.log(ccApp.locationArray);
    // now that we have data we can use it to add the markers to our map
    ccApp.addMarkers();
    // and add the list of locations to the sidebar
    ccApp.addLocationList();
  });
}

ccApp.getLocationID = function(location) {
	if(location.lat < 43.666911 && location.lat > 43.611111){ //toronto centre lat
		if (location.lon > -79.491209 && location.lon < -79.280279) { //toronto centre lon
			return 4;
		} 
	} else if (location.lat < 43.815341 && location.lat > 43.673583) { //scarb lat
		if (location.lon > -79.340697 && location.lon < -79.105042) { //scarb lon
			return 3;
		}
	}   
	// return neighbourhoodID;
}

// add a marker to the map for every location
ccApp.addMarkers = function() {
  ccApp.locationArray.forEach((object) => {
    ccApp.markerArray.push(L.marker([object.locationLat, object.locationLon]));
  })
  
  ccApp.markerArray.forEach( (marker) => {
	marker.addTo(ccApp.myMap);
  }); 
  // now that the markers are in place, we call our add popup function
  ccApp.addPopup();
}

// bind the popup labels to every marker on the map	
ccApp.addPopup = function() {
	for(let i = 0; i < ccApp.markerArray.length; i++){
		let popupString = 
			`<h4 class="popupName">${ccApp.locationArray[i].locationName}</h4> 
			<h5 class="popupAddress">${ccApp.locationArray[i].locationAddress}</h5>`;
			if (ccApp.locationArray[i].locationPhone){
				popupString += `<h5 class="popupPhone">${ccApp.locationArray[i].locationPhone}</h5>`
			}
			if (ccApp.locationArray[i].locationNotes) {
				popupString += `<h5 class="popupNotes">${ccApp.locationArray[i].locationNotes}</h5>`
			}
			;
		ccApp.markerArray[i].bindPopup(popupString);
	}
}

// add the list of locations to our sidebar
ccApp.addLocationList = function() {
  // for each item in the location array, make a string containing that location's information
  ccApp.locationArray.forEach( (object) => {
	  let locationString = `<li class="neighbourID${object.locationID}" >`;
    locationString += `<h3>${object.locationName}</h3>`;
    locationString += `<p>${object.locationAddress}</p>`;
    if (object.locationPhone) {
      locationString += `<p>${object.locationPhone}</p>`;
    };
    if (object.locationNotes) {
      locationString += `<p>${object.locationNotes}</p>`;
    };
    locationString += `</li>`;
    // append that code to our page in the neighbourhood list
    $('#locationList').append(locationString);
  });
}

//Selects from the neighbourhood array, eventually will connect to lat/long properties 
// called in document ready 
ccApp.neighbourhoodDropdown = function () {
	ccApp.neighbourhoodArray.forEach((item)=>{
    // each option in the menu has the name of the neighbourhood, and that neighbourhood's ID number (same as the index in its array)
		let dropDown = `<option value = ${item.id}> ${item.neighbourhood}</option>`;
    $(`#nabeSelector`).append(dropDown);
  });
  // now that the dropdown is made, call the event handler
  ccApp.registerEvents();
}

// event handler for neighbourhood drop down
ccApp.registerEvents = function () {
  $('#nabeSelector').on('change', function () {
    // grab the value of the menu that's changed
    // the value is the index of that object in its array
    let userSelection = $(this).val();
    // pass that value to a function that actually changes the map view
	ccApp.changeMapView(userSelection);
	
	ccApp.filterLocationList (userSelection); 
  });
}

//matches the selected ID to the IDs appended based on lat/long, filters the list below the dropdown menu 
ccApp.filterLocationList = function(locationID){
	$(`li`).removeClass(`visuallyHidden`);
	if(locationID != 6){
		$(`li`).not(`.neighbourID${locationID}`).addClass(`visuallyHidden`);
	} 
}


// function to change where the map is centred
ccApp.changeMapView = function (mapFocus) {
  // a new variable to hold the target latitude & longitude
  // that lat & lon are found in our neighbourhood array, using the index passed in from registerEvents()
  const latlng = L.latLng(ccApp.neighbourhoodArray[mapFocus].lat, ccApp.neighbourhoodArray[mapFocus].lon);
  // call the setView method on our myMap object, using the latitude & longitude and zooming out a bit
  ccApp.myMap.setView(latlng, 13);
}

	
// once the document is ready, call the init functions to start the app
$(document).ready(function () {
  ccApp.initMap();
  ccApp.neighbourhoodDropdown();
});
