
var nixaPublicSchoolLocator = (function () {
	// initialize function
	var map;
	var intermediate_boundary_layer;
	var elementary_boundaries_layer;
	var autocomplete;
	var place;
	var schoolChoiceControl = "None";
	var searchControl = false;

	var polygonListElementary = [];
	var polygonListIntermediate = [];
	var schoolsList = [];
	var intermediateAdds = [];
	var elementaryAdds = [];
	
	function initMap() {
		// construct map
		map = new google.maps.Map(document.getElementById('map'), {
    		center: {lat: 37.025, lng: -93.32},
    		zoom: 12,
    		minZoom: 11,
    		zoomControl: true,
    		zoomControlOptions: {
    			position: google.maps.ControlPosition.RIGHT_BOTTOM
    		},
    		mapTypeControl: true,
    		mapTypeControlOptions: {
    			style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
    			position: google.maps.ControlPosition.BOTTOM_CENTER
    		},
    		scaleControl: false,
    		streetViewControl: false,
    		rotateControl: false,
    		fullscreenControl: false
		});
	
	
		// construct new data layers
		var schooldistrict_projected_layer = new google.maps.Data({map: map});
		intermediate_boundary_layer = new google.maps.Data({map: map});
		elementary_boundaries_layer = new google.maps.Data({map: map});
		var schools_layer = new google.maps.Data({map: map});
		
	
		// add geojsons to corresponding data layers
		$.getJSON('data/schooldistrict_projected.geojson', function(data) {
			var features = schooldistrict_projected_layer.addGeoJson(data);
		});
	
		$.getJSON('data/intermediate_boundaries.geojson', function(data) {
			var features = data.features;
			var i;
			for (i=0; i < features.length; i++) {
				intermediate_boundary_layer.addGeoJson(data.features[i]);
				var testList = [];
				var f1 = features[i].geometry.coordinates;
				var i1;
				for (i1 = 0; i1 < features[i].geometry.coordinates.length; i1++) {
					var f2 = f1[i1];
					var i2;
					for (i2 = 0; i2 < f2.length; i2++) {
						testList.push({lat: f1[i1][i2][1], lng: f1[i1][i2][0]});
					}
				};
			
				var polygon = new google.maps.Polygon({
					paths: testList
				});
				polygonListIntermediate.push([features[i].properties.SchoolName, polygon]);
				testList.length = 0;
			};
		});
	
		$.getJSON('data/elementary_boundaries.geojson', function(data) {
			var features = data.features;
			var i;
			for (i=0; i < features.length; i++) {
				elementary_boundaries_layer.addGeoJson(data.features[i]);
				var testList = [];
				var f1 = features[i].geometry.coordinates[0];
				var f2 = features[i].geometry.coordinates[1];
				console.log(f2);
				var i1;
				for (i1 = 0; i1 < features[i].geometry.coordinates[0].length; i1++) {
					var f2 = f1[i1];
					var i2;
					for (i2 = 0; i2 < f2.length; i2++) {
						testList.push({lat: f1[i1][i2][1], lng: f1[i1][i2][0]});
					}
				};
			
				var polygon = new google.maps.Polygon({
					paths: testList
				});
				polygonListElementary.push([features[i].properties.SchoolName, polygon]);
				testList.length = 0;
			};
  		});
	
		$.getJSON('data/schools_v2.geojson', function(data) {
			var features = data.features;
			var i;
			for (i=0; i < features.length; i++) {
				var location = {lat: features[i].geometry.coordinates[1], lng: features[i].geometry.coordinates[0]};
				var marker = new google.maps.Marker({
					position: location,
					map: map
				});
				var cf = features[i].properties;
				schoolsList.push([marker, cf.Facility, cf.Address, cf.BGrade, cf.Phone, cf.SchEmail]);
				attachMarkerListener(marker, cf.Facility, cf.Address, cf.Phone, cf.SchEmail, location);
			};
		
			function attachMarkerListener(marker, facility, address, phone, email, location) {
        		marker.addListener('click', function() {
          			document.getElementById("info01").innerHTML = facility;
					document.getElementById("info02").innerHTML = address;
					document.getElementById("info03").innerHTML = phone;
					document.getElementById("info04").innerHTML = email;
        			$('#schoolsModal').modal('show');
        		});
      		};
		});
	
	
		// set layer styles
		schooldistrict_projected_layer.setStyle({
  			fillColor: '#C0392B',
  			fillOpacity: 0.1,
  			clickable: false,
  			strokeColor: 'black',
  			strokeOpacity: 0.5,
  			strokeWeight: 0.5,
  			visible: true
		});
	
		intermediate_boundary_layer.setStyle({
  			fillColor: '#45B39D',
  			fillOpacity: 0.5,
  			clickable: false,
  			strokeColor: 'black',
  			strokeOpacity: 1,
  			strokeWeight: 1,
  			visible: false
		});
	
		elementary_boundaries_layer.setStyle({
  			fillColor: '#2980B9',
  			fillOpacity: 0.5,
  			clickable: false,
  			strokeColor: 'black',
  			strokeOpacity: 1,
  			strokeWeight: 1,
  			visible: false
		});
	
		schools_layer.setStyle({
			//TODO
			clickable: true,
			visible: true
		});
	
		// add layers to map
		schooldistrict_projected_layer.setMap(map);
		intermediate_boundary_layer.setMap(map);
		elementary_boundaries_layer.setMap(map);
		schools_layer.setMap(map);
	
		// setup address check
		autocomplete = new google.maps.places.Autocomplete(document.getElementById('formOne'));
		autocomplete.addListener('place_changed', onPlaceChanged);
		document.getElementById('formOne').onkeypress = function(e) {
    		var event = e || window.event;
    		var charCode = event.which || event.keyCode;

    		if ( charCode == '13' ) {
      			// Enter pressed
      			onPlaceChanged();
    		}
		};
	
		var markers = [];
		function onPlaceChanged() {
			searchControl = false;
		
			place = autocomplete.getPlace();
			// Clear out the old markers.
        	markers.forEach(function(marker) {
            	marker.setMap(null);
        	});
        	markers = [];
        
        	if (!place.geometry) {
            	console.log("Returned place contains no geometry");
            	return;
        	}
        	var icon = {
            	url: place.icon,
            	size: new google.maps.Size(71, 71),
            	origin: new google.maps.Point(0, 0),
            	anchor: new google.maps.Point(17, 34),
            	scaledSize: new google.maps.Size(25, 25)
        	};

        	// Create a marker for each place.
        	markers.push(new google.maps.Marker({
            	map: map,
            	icon: icon,
            	title: place.name,
            	position: place.geometry.location
        	}));
        
        	console.log(place.geometry.location.lat());
        	console.log(place.geometry.location.lng());
			if (schoolChoiceControl == "None") {
				document.getElementById("theSchool").innerHTML = "Please choose a school scenario, then try entering your address again.";
			} else if (schoolChoiceControl == "Elementary") {
				var i;
  				for (i=0; i < polygonListElementary.length; i++) {
  					var result = google.maps.geometry.poly.containsLocation(place.geometry.location, polygonListElementary[i][1]);
  					if (result == true) {
  						document.getElementById("theSchool").innerHTML = "The address you entered is within <b>" + polygonListElementary[i][0] + " School District</b>";
  						searchControl = true;
  					}
  				};
			} else if (schoolChoiceControl == "Intermediate") {
				var j;
  				for (j=0; j < polygonListIntermediate.length; j++) {
  					var result2 = google.maps.geometry.poly.containsLocation(place.geometry.location, polygonListIntermediate[j][1]);
  					if (result2 == true) {
  						document.getElementById("theSchool").innerHTML = "The address you entered is within <b>" + polygonListIntermediate[j][0] + " School District</b>";
  						searchControl = true;
  					}
  				};
			};
			if (searchControl == false) {
  				document.getElementById("theSchool").innerHTML = "Oops! The address you have entered is not within the school district(s). Try entering another address.";
  				map.setCenter(place.geometry.location);
  				map.setZoom(15);
  			} else if (searchControl == true) {
  				map.setCenter(place.geometry.location);
  				map.setZoom(15);
  			}
			$('#popUpModal').modal('show');
		};
	};

	function clickedAddDataButtonOne(source) {
		var box = document.getElementById(source);
		var active = box.classList.contains('btn-primary');
		if (active == true) {
			//remove data
			elementary_boundaries_layer.setStyle({
  				fillColor: '#2980B9',
  				fillOpacity: 0.5,
  				clickable: false,
  				strokeColor: 'black',
  				strokeOpacity: 1,
  				strokeWeight: 1,
  				visible: false
			});
			//remove active class
			box.classList.remove('btn-primary');
			box.classList.add('btn-default');
			schoolChoiceControl = "None";
		} else if (active == false) {
			//add data boxOne
			elementary_boundaries_layer.setStyle({
  				fillColor: '#2980B9',
  				fillOpacity: 0.5,
  				clickable: false,
  				strokeColor: 'black',
  				strokeOpacity: 1,
  				strokeWeight: 1,
  				visible: true
			});
			//add active class boxOne
			box.classList.remove('btn-default');
			box.classList.add('btn-primary');
		
			//remove active class boxTwo, try
			var box2 = document.getElementById("buttonTwo");
			var active2 = box2.classList.contains("btn-primary");
			if (active2 == true) {
				box2.classList.remove("btn-primary");
				box2.classList.add("btn-default");
				try {
					//remove boxTwo data
					intermediate_boundary_layer.setStyle({
  						fillColor: '#45B39D',
  						fillOpacity: 0.5,
  						clickable: false,
  						strokeColor: 'black',
  						strokeOpacity: 1,
  						strokeWeight: 1,
  						visible: false
					});
				} catch (err) {
					console.log("Found an error");
				}
			}
			schoolChoiceControl = "Elementary";
		}
	};

	function clickedAddDataButtonTwo(source) {
		var box = document.getElementById(source);
		var active = box.classList.contains('btn-primary');
		if (active == true) {
			//remove data
			intermediate_boundary_layer.setStyle({
  				fillColor: '#45B39D',
  				fillOpacity: 0.5,
  				clickable: false,
  				strokeColor: 'black',
  				strokeOpacity: 1,
  				strokeWeight: 1,
  				visible: false
			});
			//remove active class
			box.classList.remove('btn-primary');
			box.classList.add('btn-default');
			schoolChoiceControl = "None";
		} else if (active == false) {
			//add boxTwo data
			intermediate_boundary_layer.setStyle({
  				fillColor: '#45B39D',
  				fillOpacity: 0.5,
  				clickable: false,
  				strokeColor: 'black',
  				strokeOpacity: 1,
  				strokeWeight: 1,
  				visible: true
			});
			//add active class boxTwo
			box.classList.remove('btn-default');
			box.classList.add('btn-primary');
		
			//remove active class boxOne, try
			var box2 = document.getElementById("buttonOne");
			var active2 = box2.classList.contains("btn-primary");
			if (active2 == true) {
				box2.classList.remove("btn-primary");
				box2.classList.add("btn-default");
				try {
					//remove boxOne data
					elementary_boundaries_layer.setStyle({
  						fillColor: '#2980B9',
  						fillOpacity: 0.5,
  						clickable: false,
  						strokeColor: 'black',
  						strokeOpacity: 1,
  						strokeWeight: 1,
  						visible: false
					});
				} catch (err) {
					console.log("Found an error");
				}
			}
			schoolChoiceControl = "Intermediate";
		}
	};
	
	return {
		initMap: initMap,
		clickedAddDataButtonOne: clickedAddDataButtonOne,
		clickedAddDataButtonTwo: clickedAddDataButtonTwo
	};
})();

$(document).ready(function() {
	nixaPublicSchoolLocator.initMap();
	$('#myModal').modal('show');
});




