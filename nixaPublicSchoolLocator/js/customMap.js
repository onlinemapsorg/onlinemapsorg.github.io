
var nixaPublicSchoolLocator = (function () {
	// initialize function
	var map;
	var intermediate_boundary_layer;
	var elementary_boundaries_layer;
	var autocomplete;
	var place;

	var polygonListElementary = [];
	var polygonListIntermediate = [];
	var schoolsList = [];
	var intermediateAdds = [];
	var elementaryAdds = [];
	var schoolChoiceControl = "None";
	
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
	
	// add event handlers
	/*
	intermediate_boundary_layer.addListener('mouseover', function(event) {
  		intermediate_boundary_layer.revertStyle();
  		intermediate_boundary_layer.overrideStyle(event.feature, {strokeWeight: 8});
	});
	intermediate_boundary_layer.addListener('mouseout', function(event) {
  		intermediate_boundary_layer.revertStyle();
	});
	
	elementary_boundaries_layer.addListener('mouseover', function(event) {
  		elementary_boundaries_layer.revertStyle();
  		elementary_boundaries_layer.overrideStyle(event.feature, {strokeWeight: 8});
	});
	elementary_boundaries_layer.addListener('mouseout', function(event) {
  		elementary_boundaries_layer.revertStyle();
	});
	*/
		/*
		schools_layer.addListener('click', function(event) {
			console.log(event.feature.f);
			console.log(event.feature.f.Latitude);
			console.log(event.feature.f.Longitude);
			//TODO
			//map.setCenter(event.feature.getPosition());
		});
		*/
	
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
			var paras = document.getElementsByClassName('gonnaRemove');

			while(paras[0]) {
    			paras[0].parentNode.removeChild(paras[0]);
			}
		
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
        
        
			if (schoolChoiceControl == "None") {
				document.getElementById("theSchool").innerHTML = "Please choose a school scenario, then try entering your address again.";
			} else if (schoolChoiceControl == "Elementary") {
				var i;
  				for (i=0; i < polygonListElementary.length; i++) {
  					var result = google.maps.geometry.poly.containsLocation(place.geometry.location, polygonListElementary[i][1]);
  					if (result == true) {
  						map.setCenter(place.geometry.location);
						map.setZoom(15);
  						document.getElementById("theSchool").innerHTML = "The address you entered is within <b>" + polygonListElementary[i][0] + " School District</b>, below you can see the available schools for your scenario.";
  						var j;
  						for (j=0; j < schoolsList.length; j++) {
  							if (schoolsList[j][3] != "09" && schoolsList[j][3] != "07") {
  								var secondResult = google.maps.geometry.poly.containsLocation(schoolsList[j][0].position, polygonListElementary[i][1]);
  								if (secondResult == true) {
  									var para = document.createElement("p");
  									var node = document.createTextNode(schoolsList[j][1]);
  									para.appendChild(node);
  									para.classList.add("gonnaRemove");
  								
  									var para2 = document.createElement("p");
  									var node2 = document.createTextNode(schoolsList[j][2])
  									para2.appendChild(node2);
  									para2.classList.add("gonnaRemove");
  								
  									var para3 = document.createElement("p");
  									var node3 = document.createTextNode(schoolsList[j][4])
  									para3.appendChild(node3);
  									para3.classList.add("gonnaRemove");
  								
  									var para4 = document.createElement("p");
  									var node4 = document.createTextNode(schoolsList[j][5])
  									para4.appendChild(node4);
  									para4.classList.add("gonnaRemove");
  								
  									var br = document.createElement("br");
  									br.classList.add("gonnaRemove");
  									var hr = document.createElement("hr");
  									hr.classList.add("gonnaRemove");
  									var element = document.getElementById("schoolAppend");
  									element.appendChild(para);
  									element.appendChild(para2);
  									element.appendChild(para3);
  									element.appendChild(para4);
  									element.appendChild(br);
  									element.appendChild(hr);
  								}
  							}
  						};
  						break;
  					} else if (result == false) {
  						//document.getElementById("theSchool").innerHTML = "Oops! The address you have entered is not within the school district(s). Try entering another address.";
  					}
  				};
			} else if (schoolChoiceControl == "Intermediate") {
				var i;
  				for (i=0; i < polygonListIntermediate.length; i++) {
  					var result = google.maps.geometry.poly.containsLocation(place.geometry.location, polygonListIntermediate[i][1]);
  					if (result == true) {
  						map.setCenter(place.geometry.location);
						map.setZoom(15);
  						document.getElementById("theSchool").innerHTML = "The address you entered is within <b>" + polygonListIntermediate[i][0] + " School District</b>, below you can see the available schools for your scenario.";
  						var j;
  						for (j=0; j < schoolsList.length; j++) {
  							if (schoolsList[j][3] == "09" || schoolsList[j][3] == "07") {
  								var secondResult = google.maps.geometry.poly.containsLocation(schoolsList[j][0].position, polygonListIntermediate[i][1]);
  								if (secondResult == true) {
  									var para = document.createElement("p");
  									var node = document.createTextNode(schoolsList[j][1]);
  									para.appendChild(node);
  									para.classList.add("gonnaRemove");
  								
  									var para2 = document.createElement("p");
  									var node2 = document.createTextNode(schoolsList[j][2])
  									para2.appendChild(node2);
  									para2.classList.add("gonnaRemove");
  								
  									var para3 = document.createElement("p");
  									var node3 = document.createTextNode(schoolsList[j][4])
  									para3.appendChild(node3);
  									para3.classList.add("gonnaRemove");
  								
  									var para4 = document.createElement("p");
  									var node4 = document.createTextNode(schoolsList[j][5])
  									para4.appendChild(node4);
  									para4.classList.add("gonnaRemove");
  								
  									var br = document.createElement("br");
  									br.classList.add("gonnaRemove");
  									var hr = document.createElement("hr");
  									hr.classList.add("gonnaRemove");
  									var element = document.getElementById("schoolAppend");
  									element.appendChild(para);
  									element.appendChild(para2);
  									element.appendChild(para3);
  									element.appendChild(para4);
  									element.appendChild(br);
  									element.appendChild(hr);
  								}
  							}
  						};
  						break;
  					} else if (result == false) {
  						//document.getElementById("theSchool").innerHTML = "Oops! The address you have entered is not within the school district(s). Try entering another address.";
  					}
  				};
			};
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




