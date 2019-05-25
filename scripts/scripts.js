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
		neighbourhood: "Show All",
		lat: 43.646006,
		lon: -79.389362,
		id: 6
	}
];

ccApp.modal = document.getElementById('modal1');
ccApp.locationArray = [];
ccApp.markerArray= [];

// makes a new map object, centred on Metro Hall at zoom level 12
ccApp.myMap = L.map('mapid').setView([43.646029, -79.389133], 12);


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
        // each location needs to be sorted into which neighbourhood it falls into; here we call
        // the getLocationID which returns a neighbourhood ID we can use for sorting the list
        locationID: ccApp.getLocationID(info)
      });
    });
	    
    // now that we have data we can use it to add the markers to our map
    ccApp.addMarkers();

    // and add the list of locations to the sidebar
    ccApp.addLocationList();
  });
}

// this figures out which neighbourhood a particular location is inside, and returns a corresponding ID
ccApp.getLocationID = function(location) {
  // we check if the latitude & longitude of the 'location' object falls within one of six rectangles
  // those rectangles are defined by the latitude & longitude of its upper left and lower right corners
  // the rectangles roughly correspond with Toronto's six boroughs

  let locationID = 0;

	if(location.lat < 43.666911 && location.lat > 43.611111){ //toronto centre lat
		if (location.lon > -79.491209 && location.lon < -79.280279) { //toronto centre lon
			locationID = 4;
		} 
  }; 
  if (location.lat < 43.84663 && location.lat > 43.66759) { //scarb lat
		if (location.lon > -79.29641 && location.lon < -79.10003) { //scarb lon
			locationID = 3;
		} 
  }; 
  if (location.lat < 43.78962 && location.lat > 43.57013) { //etobicoke lat
		if (location.lon > -79.67475 && location.lon < -79.49519) { //etobicoke lon
			locationID = 1;
		}
  }; 
  if (location.lat < 43.82979 && location.lat > 43.72468) { //north york lat
		if (location.lon > -79.50103 && location.lon < -79.2892) { //north york lon
			locationID = 2;
		}
  }; 
  if (location.lat < 43.72394 && location.lat > 43.67901) { //east york lat
		if (location.lon > -79.39082 && location.lon < -79.28577) { //east york lon
			locationID = 0;
		}
  }; 
  if (location.lat < 43.72195 && location.lat > 43.67727) { //york lat
		if (location.lon > -79.49828 && location.lon < -79.38773) { //york lon
			locationID = 5;
		}
  };
  return locationID;
}

// add a marker to the map for every location
ccApp.addMarkers = function() {
  // work our way through our big location array
  ccApp.locationArray.forEach((object) => {
    // make a new more manageable marker array that, for each location, is a Leaflet.js marker object
    ccApp.markerArray.push(L.marker([object.locationLat, object.locationLon]));
  });
  
  // for each item in that marker array, add the Leaflet.js marker object to the map
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
				popupString += `<h5 class="popupPhone"><a href="tel:${ccApp.locationArray[i].locationPhone}">${ccApp.locationArray[i].locationPhone}</a></h5>`
			};
			if (ccApp.locationArray[i].locationNotes) {
				popupString += `<h5 class="popupNotes">${ccApp.locationArray[i].locationNotes}</h5>`
			};
		ccApp.markerArray[i].bindPopup(popupString);
	}
}

// add the list of locations to our sidebar
ccApp.addLocationList = function() {
  // for each item in the location array, make a string containing that location's information
  ccApp.locationArray.forEach( (object) => {
	  let locationString = `<li class="neighbourID${object.locationID}" >`;
    locationString += `<h3><a class="sidebarHeader" href="" data-lat="${object.locationLat}" data-lon="${object.locationLon}">${object.locationName}</a></h3>`;
    locationString += `<p>${object.locationAddress}</p>`;
    if (object.locationPhone) {
      locationString += `<p><a href="tel:${object.locationPhone}">${object.locationPhone}</a></p>`;
    };
    if (object.locationNotes) {
      locationString += `<p>${object.locationNotes}</p>`;
    };
    locationString += `</li>`;
    // append that code to our page in the neighbourhood list
    $('#locationList').append(locationString);
  });
  // now that we have the sidebar content added to the DOM, call function to set up its event handlers
  ccApp.makeSidebarHeadersClickable();
}

// event handler for sidebar content location names
ccApp.makeSidebarHeadersClickable = function () {
  // capture the click
  $('.sidebarHeader').on('click', function () {
    // prevent default behaviour - we don't want the page to refresh
    event.preventDefault();
    // set target lat & lon based on the clicked-on element's html data attributes
    let targetLat = $(this).attr('data-lat');
    let targetLon = $(this).attr('data-lon');
    // put those lat & lon values in a special data object that Leaflet wants
    const latlng = L.latLng(targetLat, targetLon);
    // call the flyTo method on our map using the lat & long methods to center the map on the clicked-on location
    ccApp.myMap.flyTo(latlng, 15);
  });
}

// builds our 'select neighbourhood' dropdown menu, using data from neighbourhoodArray - called in document ready 
ccApp.neighbourhoodDropdown = function () {
	ccApp.neighbourhoodArray.forEach((item)=>{
    // each option in the menu has the name of the neighbourhood, and that neighbourhood's ID number as its value (same as the index in its array)
		let dropDown = `<option value = ${item.id}> ${item.neighbourhood}</option>`;
    $(`#nabeSelector`).append(dropDown);
  });
  // assign 'show all', the last item, as the default selection, to match the initial map view
  $(`option[value=6]`).attr(`selected`, `true`);
  // now that the dropdown is made, call the event handler for it
  ccApp.registerEvents();
}

// event handler for neighbourhood drop down and clickable list elements
ccApp.registerEvents = function () {
  $('#nabeSelector').on('change', function () {
    // grab the value of the menu that's changed
    // the value is the index of that object in its array
    let userSelection = $(this).val();
      // if the user has chosen something other than the "please make a selection" empty default option
      if (userSelection !== "") {
        // pass that value to a function that actually changes the map view
        ccApp.changeMapView(userSelection);
        // also pass that value to a function to only display locations in that area in our list
        ccApp.filterLocationList (userSelection); 
      }
  });
}



//matches the selected ID to the IDs appended based on lat/long, filters the list below the dropdown menu 
ccApp.filterLocationList = function(locationID){
  // show every li in the list
  $(`li`).removeClass(`visuallyHidden`);
  // if the chosen menu item is not 'show all'
	if(locationID != 6){
    // hide every li in the list except ones whose class match the chosen category
		$(`li`).not(`.neighbourID${locationID}`).addClass(`visuallyHidden`);
	} 
}



// function to change where the map is centred
ccApp.changeMapView = function (mapFocus) {
  // a new variable to hold the target latitude & longitude
  // that lat & lon are found in our neighbourhood array, using the index passed in from registerEvents()
  const latlng = L.latLng(ccApp.neighbourhoodArray[mapFocus].lat, ccApp.neighbourhoodArray[mapFocus].lon);

  // if the user has selected 'show all', zoom the map out a bit more, otherwise zoom in a bit more
  if (mapFocus == `6`) {
    // call the setView method on our myMap object, pasing it the latitude & longitude and zoom value
    ccApp.myMap.flyTo(latlng, 11);
  } else {
    ccApp.myMap.flyTo(latlng, 13);
  };
}

// Ajax call to pull the weather information from Dark Sky
ccApp.getWeather = function () {
	return $.ajax({
		url: `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/f5578f7d9772b00d3c30f403b7a68de1/43.646006,-79.389362?units=si&exclude=hourly,daily,alerts,flags`,
		dataType: `json`,
		method: `GET`
	}).then((weather) => {
    // make a string that has the current conditions in it
    let currentTemp = `Current temperature: <span>${weather.currently.apparentTemperature} &deg; C</span>`;
    // append that string to the 'currentTemp' div in the page header
		$('.currentTemp').append(currentTemp);
	})
}

// controls show/hide of the info modal
ccApp.modalOptions = function(){
  // if user clicks outside of the modal, hide it
  window.addEventListener("click", function () {
    if (event.target === ccApp.modal) {
      $(`.modal-open`).addClass(`visuallyHidden`);
    }
  })
  // also if the user clicks the 'close' X button on the modal, close it
  $(`.close-modal`).on(`click`, function () {
    $(`.modal-open`).addClass(`visuallyHidden`);
  })

  // if the user clicks on the '?' icon, bring the modal back
  $(`.help`).on(`click`, function () {
    $(`.modal-open`).removeClass(`visuallyHidden`);
  })
}



// once the document is ready, call the init functions to start the app
$(document).ready(function () {
  ccApp.initMap();
  ccApp.neighbourhoodDropdown();
  ccApp.getWeather();
  ccApp.modalOptions();
});
