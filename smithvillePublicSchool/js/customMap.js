
var nixaPublicSchoolLocator = (function () {
	// initialize function
	var map;
	var elementary_boundaries_layer;
	var autocomplete;
	var place;
	var searchControl = false;

	var polygonListElementary = [];
	var schoolsList = [];
	var elementaryAdds = [];
	
	function initMap() {
		// construct map
		map = new google.maps.Map(document.getElementById('map'), {
    		center: {lat: 39.3869, lng: -94.581},
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
		elementary_boundaries_layer = new google.maps.Data({map: map});
		var schools_layer = new google.maps.Data({map: map});
		
	
		$.getJSON('data/school_districts.geojson', function(data) {
			var features = data.features;
			var i;
			for (i=0; i < features.length; i++) {
				elementary_boundaries_layer.addGeoJson(data.features[i]);
				var testList = [];
				var testListInside = [];
				var testListInside2 = [];
				var f1 = features[i].geometry.coordinates;
				
				// construct single polygon
				if (f1.length == 1) {
					// construct simple polygon
					if (f1[0].length == 1) {
						var i1;
						for (i1=0; i1 < f1[0].length; i1++) {
							var i2;
							for (i2=0; i2 < f1[0][i1].length; i2++) {
								testList.push({lat: f1[0][i1][i2][1], lng: f1[0][i1][i2][0]});
							}
						}
						var polygon = new google.maps.Polygon({
							paths: testList
						});
						polygonListElementary.push([features[i].properties.name, polygon]);
						testList.length = 0;
					// construct polygon with hole
					} else if (f1[0].length > 1) {
						var i1;
						for (i1=0; i1 < f1[0].length; i1++) {
							var i2;
							for (i2=0; i2 < f1[0][i1].length; i2++) {
								// construct polygon outside
								if (i1 == 0) {
									testList.push({lat: f1[0][i1][i2][1], lng: f1[0][i1][i2][0]});
								// construct polygon inside
								} else if (i1 == 1) {
									testListInside.push({lat: f1[0][i1][i2][1], lng: f1[0][i1][i2][0]});
								} else if (i1 == 2) {
									testListInside2.push({lat: f1[0][i1][i2][1], lng: f1[0][i1][i2][0]});
								}
							}
						}
						var polygon = new google.maps.Polygon({
							paths: [testList, testListInside, testListInside2]
						});
						polygonListElementary.push([features[i].properties.name, polygon]);
						testList.length = 0;
						testListInside.length = 0;
					}
				// construct multi polygon
				} else if (f1.length > 1) {
					var firstTier;
					//for each polygon
					for (firstTier=0; firstTier < f1.length; firstTier++) {
						var secondTier = 0;
						var ib;
						//for each array inside polygon
						for (ib=0; ib < f1[firstTier][0].length; ib++) {
							var thirdTier;
							// for each item in array
							for (thirdTier = 0; thirdTier < 2; thirdTier++) {
								testList.push({lat: f1[firstTier][secondTier][thirdTier][1], lng: f1[firstTier][secondTier][thirdTier][0]});
							}
						}
						if (firstTier == 0) {
							var polygon = new google.maps.Polygon({
								paths: testList
							});
							polygonListElementary.push([features[i].properties.name, polygon]);
							testList.length = 0;
						} else if (firstTier == 1) {
							var polygon1 = new google.maps.Polygon({
								paths: testList
							});
							polygonListElementary.push([features[i].properties.name, polygon1]);
							testList.length = 0;
						} else if (firstTier == 2) {
							var polygon2 = new google.maps.Polygon({
								paths: testList
							});
							polygonListElementary.push([features[i].properties.name, polygon2]);
							testList.length = 0;
						}
					}
				}
			}
			console.log(polygonListElementary);
  		});
	
		$.getJSON('data/school_points.geojson', function(data) {
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
        			if (facility == null) {
        				document.getElementById("info01").innerHTML = "School Name: no information";
        			} else {
        				document.getElementById("info01").innerHTML = facility;
        			}
        			if (address == null) {
        				document.getElementById("info02").innerHTML = "School Addres: no information";
        			} else {
        				document.getElementById("info02").innerHTML = address;
        			}
        			if (phone == null || phone == 0) {
        				document.getElementById("info03").innerHTML = "School Phone: no information";
        			} else {
        				document.getElementById("info03").innerHTML = phone;
        			}
					//document.getElementById("info04").innerHTML = email;
        			$('#schoolsModal').modal('show');
        		});
      		};
		});
	
		elementary_boundaries_layer.setStyle({
  			fillColor: '#2980B9',
  			fillOpacity: 0.5,
  			clickable: false,
  			strokeColor: 'black',
  			strokeOpacity: 1,
  			strokeWeight: 1,
  			visible: true
		});
	
		schools_layer.setStyle({
			//TODO
			clickable: true,
			visible: true
		});
	
		// add layers to map
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
        
			var i;
  			for (i=0; i < polygonListElementary.length; i++) {
  				var result = google.maps.geometry.poly.containsLocation(place.geometry.location, polygonListElementary[i][1]);
  				if (result == true) {
  					document.getElementById("theSchool").innerHTML = "The address you entered is within <b>" + polygonListElementary[i][0] + " School District</b>";
  					searchControl = true;
  				}
  			}
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
	
	return {
		initMap: initMap
	};
})();

$(document).ready(function() {
	nixaPublicSchoolLocator.initMap();
	$('#myModal').modal('show');
});




