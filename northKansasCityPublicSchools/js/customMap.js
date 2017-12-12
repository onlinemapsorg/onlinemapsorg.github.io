
var northKansasCityPublicSchools = (function () {
	// initialize function
	var map;
	var elementary_boundaries_layer;
	var sixthgrade_boundaries_layer;
	var middleschool_boundaries_layer;
	var highschool_boundaries_layer;
	var autocomplete;
	var place;
	var searchControl = "false";
	var schoolChoiceControl = "None";
	
	var polygonListElementary = [];
	var polygonListSixthgrade = [];
	var polygonListMiddleschool = [];
	var polygonListHighschool = [];
	/*var schoolsList = [];*/
	
	var customGeocoder = [];
	var crossReferenceCustom = [];
	var customInput = document.getElementById("customInput");
	
	function initMap() {
		
		$.ajax({
			type: "GET",
			url: "https://onlinemapsorg.github.io/northKansasCityPublicSchools/data/convertcsv.json",
			datatype: "json",
			success: function(data) {
				var dataL = data.length;
				var i;
				for (i=0; i < dataL; i++) {
					if (i==0) {
						//do nothing
					} else {
						customGeocoder.push(data[i][0]);
						crossReferenceCustom.push(data[i]);
					}
				}
				console.log(customGeocoder);
				new Awesomplete(customInput, {
					list: customGeocoder,
					maxItems: 25,
					minChars: 2
				});
			},
			error: function(err) {
				console.log(err);
			}
		});
		
		document.getElementById("customInput").addEventListener("awesomplete-selectcomplete", function(event) {
			console.log(event);
		});
		// construct map
		map = new google.maps.Map(document.getElementById('map'), {
    		center: {lat: 39.21298, lng: -94.558956},
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
		sixthgrade_boundaries_layer = new google.maps.Data({map: map});
		middleschool_boundaries_layer = new google.maps.Data({map: map});
		highschool_boundaries_layer = new google.maps.Data({map: map});
		/*var schools_layer = new google.maps.Data({map: map});*/
		
	
		$.getJSON('data/final2/elementaryschools.geojson', function(data) {
			var features = data.features;
			var i;
			for (i=0; i < features.length; i++) {
				elementary_boundaries_layer.addGeoJson(data.features[i]);
				var testList = [];
				var testListInside = [];
				var testListInside2 = [];
				var f1 = features[i].geometry.coordinates;
				
				//construct single polygon
				if (f1.length == 1) {
					var firstTier;
					for (firstTier=0; firstTier < f1[0].length; firstTier++) {
						testList.push({lat: f1[0][firstTier][1], lng: f1[0][firstTier][0]});
					};
					var polygon = new google.maps.Polygon({
						paths: testList
					});
					
					polygonListElementary.push([features[i].properties.TERRITORY, polygon, features[i].properties.Phone, features[i].properties.Address1, features[i].properties.Address2, features[i].properties.TERRITORY2, features[i].properties.Phone2, features[i].properties.Address1_2, features[i].properties.Address2_2]);
					testList.length = 0;
				//construct polygon with hole
				} else if (f1.length > 1) {
					var firstTier;
					for (firstTier=0; firstTier < f1.length; firstTier++) {
						var secondTier;
						for (secondTier=0; secondTier < f1[firstTier].length; secondTier++) {
							if (firstTier == 0) {
								testList.push({lat: f1[firstTier][secondTier][1], lng: f1[firstTier][secondTier][0]});
							} else if (firstTier == 1) {
								testListInside.push({lat: f1[firstTier][secondTier][1], lng: f1[firstTier][secondTier][0]});
							} else if (firstTier == 2) {
								testListInside2.push({lat: f1[firstTier][secondTier][1], lng: f1[firstTier][secondTier][0]});
							}
						}
					}
					var polygon = new google.maps.Polygon({
						paths: [testList, testListInside, testListInside2]
					});
					polygonListElementary.push([features[i].properties.TERRITORY, polygon, features[i].properties.Phone, features[i].properties.Address1, features[i].properties.Address2, features[i].properties.TERRITORY2, features[i].properties.Phone2, features[i].properties.Address1_2, features[i].properties.Address2_2]);
					testList.length = 0;
					testListInside.length = 0;
					testListInside2.length = 0;
				}
			}
			//console.log(polygonListElementary);
  		});
  		
  		
  		$.getJSON('data/final2/sixthgrade.geojson', function(data) {
  			var features = data.features;
  			var i;
  			for (i=0; i < features.length; i++) {
  				sixthgrade_boundaries_layer.addGeoJson(data.features[i]);
  				var testList = []
  				var testListInside = [];
  				var testListInside2 = [];
  				var f1 = features[i].geometry.coordinates;
  				
  				//construct single polygon
  				if (f1.length == 1) {
  					var firstTier;
					for (firstTier=0; firstTier < f1[0].length; firstTier++) {
						testList.push({lat: f1[0][firstTier][1], lng: f1[0][firstTier][0]});
					};
					var polygon = new google.maps.Polygon({
						paths: testList
					});
					polygonListSixthgrade.push([features[i].properties.SixthGrade, polygon, features[i].properties.Phone, features[i].properties.Address1, features[i].properties.Address2]);
					testList.length = 0;
  				} else if (f1.length > 1) {
  					var firstTier;
					for (firstTier=0; firstTier < f1.length; firstTier++) {
						var secondTier;
						for (secondTier=0; secondTier < f1[firstTier].length; secondTier++) {
							if (firstTier == 0) {
								testList.push({lat: f1[firstTier][secondTier][1], lng: f1[firstTier][secondTier][0]});
							} else if (firstTier == 1) {
								testListInside.push({lat: f1[firstTier][secondTier][1], lng: f1[firstTier][secondTier][0]});
							} else if (firstTier == 2) {
								testListInside2.push({lat: f1[firstTier][secondTier][1], lng: f1[firstTier][secondTier][0]});
							}
						}
					}
					var polygon = new google.maps.Polygon({
						paths: [testList, testListInside, testListInside2]
					});
					polygonListSixthgrade.push([features[i].properties.SixthGrade, polygon, features[i].properties.Phone, features[i].properties.Address1, features[i].properties.Address2]);
					testList.length = 0;
					testListInside.length = 0;
					testListInside2.length = 0;
  				}
  			}
  			//console.log(polygonListSixthgrade);
  		});
  		
  		
  		$.getJSON('data/final2/highschools.geojson', function(data) {
  			var features = data.features;
  			var i;
  			for (i=0; i < features.length; i++) {
  				middleschool_boundaries_layer.addGeoJson(data.features[i]);
  				var testList = []
  				var testListInside = [];
  				var testListInside2 = [];
  				var f1 = features[i].geometry.coordinates;
  				
  				//construct single polygon
  				if (f1.length == 1) {
  					var firstTier;
					for (firstTier=0; firstTier < f1[0].length; firstTier++) {
						testList.push({lat: f1[0][firstTier][1], lng: f1[0][firstTier][0]});
					};
					var polygon = new google.maps.Polygon({
						paths: testList
					});
					polygonListMiddleschool.push([features[i].properties.MS, polygon, features[i].properties.PhoneMS, features[i].properties.Address1MS, features[i].properties.Address2MS]);
					testList.length = 0;
  				} else if (f1.length > 1) {
  					var firstTier;
					for (firstTier=0; firstTier < f1.length; firstTier++) {
						var secondTier;
						for (secondTier=0; secondTier < f1[firstTier].length; secondTier++) {
							if (firstTier == 0) {
								testList.push({lat: f1[firstTier][secondTier][1], lng: f1[firstTier][secondTier][0]});
							} else if (firstTier == 1) {
								testListInside.push({lat: f1[firstTier][secondTier][1], lng: f1[firstTier][secondTier][0]});
							} else if (firstTier == 2) {
								testListInside2.push({lat: f1[firstTier][secondTier][1], lng: f1[firstTier][secondTier][0]});
							}
						}
					}
					var polygon = new google.maps.Polygon({
						paths: [testList, testListInside, testListInside2]
					});
					polygonListMiddleschool.push([features[i].properties.MS, polygon, features[i].properties.PhoneMS, features[i].properties.Address1MS, features[i].properties.Address2MS]);
					testList.length = 0;
					testListInside.length = 0;
					testListInside2.length = 0;
  				}
  			}
  			//console.log(polygonListMiddleschool);
  		});
  		
  		$.getJSON('data/final2/highschools.geojson', function(data) {
  			var features = data.features;
  			var i;
  			for (i=0; i < features.length; i++) {
  				highschool_boundaries_layer.addGeoJson(data.features[i]);
  				var testList = []
  				var testListInside = [];
  				var testListInside2 = [];
  				var f1 = features[i].geometry.coordinates;
  				
  				//construct single polygon
  				if (f1.length == 1) {
  					var firstTier;
					for (firstTier=0; firstTier < f1[0].length; firstTier++) {
						testList.push({lat: f1[0][firstTier][1], lng: f1[0][firstTier][0]});
					};
					var polygon = new google.maps.Polygon({
						paths: testList
					});
					polygonListHighschool.push([features[i].properties.HS, polygon, features[i].properties.PhoneHS, features[i].properties.Address1HS, features[i].properties.Address2HS]);
					testList.length = 0;
  				} else if (f1.length > 1) {
  					var firstTier;
					for (firstTier=0; firstTier < f1.length; firstTier++) {
						var secondTier;
						for (secondTier=0; secondTier < f1[firstTier].length; secondTier++) {
							if (firstTier == 0) {
								testList.push({lat: f1[firstTier][secondTier][1], lng: f1[firstTier][secondTier][0]});
							} else if (firstTier == 1) {
								testListInside.push({lat: f1[firstTier][secondTier][1], lng: f1[firstTier][secondTier][0]});
							} else if (firstTier == 2) {
								testListInside2.push({lat: f1[firstTier][secondTier][1], lng: f1[firstTier][secondTier][0]});
							}
						}
					}
					var polygon = new google.maps.Polygon({
						paths: [testList, testListInside, testListInside2]
					});
					polygonListHighschool.push([features[i].properties.HS, polygon, features[i].properties.PhoneHS, features[i].properties.Address1HS, features[i].properties.Address2HS]);
					testList.length = 0;
					testListInside.length = 0;
					testListInside2.length = 0;
  				}
  			}
  			//console.log(polygonListHighschool);
  		});
		
		/*
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
        				document.getElementById("info02").innerHTML = "School Address: no information";
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
		*/
	
		elementary_boundaries_layer.setStyle(function(feature){
			var name = feature.getProperty('name');
			var color;
			if (name == "purple") {
				color = "#9B59B6";
			} else if (name == "green") {
				color = "#28B463";
			} else if (name == "red") {
				color = "#EC7063";
			} else if (name == "blue") {
				color = "#5D6D7E";
			} else {
				color = "#17202A";
			}
  			return {
  				fillColor: color,
  				fillOpacity: 0.5,
  				clickable: false,
  				strokeColor: 'black',
  				strokeOpacity: 1,
  				strokeWeight: 1,
  				visible: false
  			};
		});
		
		sixthgrade_boundaries_layer.setStyle(function(feature){
			var name = feature.getProperty('color');
			var color;
			if (name == "purple") {
				color = "#9B59B6";
			} else if (name == "green") {
				color = "#28B463";
			} else if (name == "red") {
				color = "#EC7063";
			} else if (name == "blue") {
				color = "#5D6D7E";
			} else {
				color = "#17202A";
			}
  			return {
  				fillColor: color,
  				fillOpacity: 0.5,
  				clickable: false,
  				strokeColor: 'black',
  				strokeOpacity: 1,
  				strokeWeight: 1,
  				visible: false
  			};
		});
		
		middleschool_boundaries_layer.setStyle(function(feature){
			var name = feature.getProperty('color');
			var color;
			if (name == "purple") {
				color = "#9B59B6";
			} else if (name == "green") {
				color = "#28B463";
			} else if (name == "red") {
				color = "#EC7063";
			} else if (name == "blue") {
				color = "#5D6D7E";
			} else {
				color = "#17202A";
			}
  			return {
  				fillColor: color,
  				fillOpacity: 0.5,
  				clickable: false,
  				strokeColor: 'black',
  				strokeOpacity: 1,
  				strokeWeight: 1,
  				visible: false
  			};
		});
		
		highschool_boundaries_layer.setStyle(function(feature){
			var name = feature.getProperty('color');
			var color;
			if (name == "purple") {
				color = "#9B59B6";
			} else if (name == "green") {
				color = "#28B463";
			} else if (name == "red") {
				color = "#EC7063";
			} else if (name == "blue") {
				color = "#5D6D7E";
			} else {
				color = "#17202A";
			}
  			return {
  				fillColor: color,
  				fillOpacity: 0.5,
  				clickable: false,
  				strokeColor: 'black',
  				strokeOpacity: 1,
  				strokeWeight: 1,
  				visible: false
  			};
		});
		
		/*
		schools_layer.setStyle({
			//TODO
			clickable: true,
			visible: true
		});
		*/
	
		// add layers to map
		elementary_boundaries_layer.setMap(map);
		sixthgrade_boundaries_layer.setMap(map);
		middleschool_boundaries_layer.setMap(map);
		highschool_boundaries_layer.setMap(map);
		/*schools_layer.setMap(map);*/
	
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
			searchControl = "false";
					
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
        	
        	document.getElementById("theSchool").innerHTML = "";
        	document.getElementById("theSchoolPhone").innerHTML = "";
        	document.getElementById("theSchoolAddress1").innerHTML = "";
        	document.getElementById("theSchoolAddress2").innerHTML = "";
        	document.getElementById("theSchool2").innerHTML = "";
        	document.getElementById("theSchoolPhone2").innerHTML = "";
        	document.getElementById("theSchoolAddress12").innerHTML = "";
        	document.getElementById("theSchoolAddress22").innerHTML = "";
        	
        	if (schoolChoiceControl == "None") {
        		document.getElementById("theSchool").innerHTML = "You have not designated a school choice, please choose one of the school scenarios and try searching again";
        		searchControl = "none";
        	} else if (schoolChoiceControl == "Elementary") {
        		var i;
  				for (i=0; i < polygonListElementary.length; i++) {
  					var result = google.maps.geometry.poly.containsLocation(place.geometry.location, polygonListElementary[i][1]);
  					if (result == true) {
  						document.getElementById("theSchool").innerHTML = "The address you entered is within <b>" + polygonListElementary[i][0] + ".</b>";
  						if (polygonListElementary[i][2] != "null") {
  							document.getElementById("theSchoolPhone").innerHTML = polygonListElementary[i][2];
  						} else if (polygonListElementary[i][2] == "null") {
  							document.getElementById("theSchoolPhone").innerHTML = "No phone number listed.";
  						}
  						document.getElementById("theSchoolAddress1").innerHTML = polygonListElementary[i][3];
  						document.getElementById("theSchoolAddress2").innerHTML = polygonListElementary[i][4];
  						
						if (polygonListElementary[i][6] != "null") {
							document.getElementById("theSchool2").innerHTML = "The address you entered is also within <b>" + polygonListElementary[i][5] + ".</b>";
							document.getElementById("theSchoolPhone2").innerHTML = polygonListElementary[i][6];
							document.getElementById("theSchoolAddress12").innerHTML = polygonListElementary[i][7];
							document.getElementById("theSchoolAddress22").innerHTML = polygonListElementary[i][8];
						}
  						searchControl = "true";
  					}
  				}
        	} else if (schoolChoiceControl == "SixthGrade") {
        		var i;
  				for (i=0; i < polygonListSixthgrade.length; i++) {
  					var result = google.maps.geometry.poly.containsLocation(place.geometry.location, polygonListSixthgrade[i][1]);
  					if (result == true) {
  						document.getElementById("theSchool").innerHTML = "The address you entered is within <b>" + polygonListSixthgrade[i][0] + ".</b>";
  						if (polygonListSixthgrade[i][2] != "null") {
  							document.getElementById("theSchoolPhone").innerHTML = polygonListSixthgrade[i][2];
  						} else if (polygonListSixthgrade[i][2] == "null") {
  							document.getElementById("theSchoolPhone").innerHTML = "No phone number listed.";
  						}
  						document.getElementById("theSchoolAddress1").innerHTML = polygonListSixthgrade[i][3];
  						document.getElementById("theSchoolAddress2").innerHTML = polygonListSixthgrade[i][4];
  						searchControl = "true";
  					}
  				}
        	} else if (schoolChoiceControl == "MiddleSchool") {
        		var i;
  				for (i=0; i < polygonListMiddleschool.length; i++) {
  					var result = google.maps.geometry.poly.containsLocation(place.geometry.location, polygonListMiddleschool[i][1]);
  					if (result == true) {
  						document.getElementById("theSchool").innerHTML = "The address you entered is within <b>" + polygonListMiddleschool[i][0] + ".</b>";
  						document.getElementById("theSchoolPhone").innerHTML = polygonListMiddleschool[i][2];
  						document.getElementById("theSchoolAddress1").innerHTML = polygonListMiddleschool[i][3];
  						document.getElementById("theSchoolAddress2").innerHTML = polygonListMiddleschool[i][4];
  						searchControl = "true";
  					}
  				}
        	} else if (schoolChoiceControl == "HighSchool") {
        		var i;
  				for (i=0; i < polygonListHighschool.length; i++) {
  					var result = google.maps.geometry.poly.containsLocation(place.geometry.location, polygonListHighschool[i][1]);
  					if (result == true) {
  						document.getElementById("theSchool").innerHTML = "The address you entered is within <b>" + polygonListHighschool[i][0] + ".</b>";
  						document.getElementById("theSchoolPhone").innerHTML = polygonListHighschool[i][2];
  						document.getElementById("theSchoolAddress1").innerHTML = polygonListHighschool[i][3];
  						document.getElementById("theSchoolAddress2").innerHTML = polygonListHighschool[i][4];
  						searchControl = "true";
  					}
  				}
        	}
			
			if (searchControl == "false") {
  				document.getElementById("theSchool").innerHTML = "Oops! The address you have entered is not within the school district(s). Try entering another address.";
  				map.setCenter(place.geometry.location);
  				map.setZoom(15);
  			} else if (searchControl == "true") {
  				map.setCenter(place.geometry.location);
  				map.setZoom(15);
  			} else if (searchControl == "none") {
  				// do nothing
  			}
			$('#popUpModal').modal('show');
		};
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

	
	
	function clickedAddDataButtonOne(source) {
		var box = document.getElementById(source);
		var active = box.classList.contains('btn-primary');
		if (active == true) {
			//remove data
			elementary_boundaries_layer.setStyle(function(feature){
				var name = feature.getProperty('color');
				var color;
				if (name == "purple") {
					color = "#9B59B6";
				} else if (name == "green") {
					color = "#28B463";
				} else if (name == "red") {
					color = "#EC7063";
				} else if (name == "blue") {
					color = "#5D6D7E";
				} else {
					color = "#17202A";
				}
				return {
  					fillColor: color,
  					fillOpacity: 0.5,
  					clickable: false,
  					strokeColor: 'black',
  					strokeOpacity: 1,
  					strokeWeight: 1,
  					visible: false
  				};
			});
			//remove active class
			box.classList.remove('btn-primary');
			box.classList.add('btn-default');
			schoolChoiceControl = "None";
		} else if (active == false) {
			//add data boxOne
			elementary_boundaries_layer.setStyle(function(feature){
				var name = feature.getProperty('color');
				var color;
				if (name == "purple") {
					color = "#9B59B6";
				} else if (name == "green") {
					color = "#28B463";
				} else if (name == "red") {
					color = "#EC7063";
				} else if (name == "blue") {
					color = "#5D6D7E";
				} else {
					color = "#17202A";
				}
				return {
  					fillColor: color,
  					fillOpacity: 0.5,
  					clickable: false,
  					strokeColor: 'black',
  					strokeOpacity: 1,
  					strokeWeight: 1,
  					visible: true
  				};
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
					sixthgrade_boundaries_layer.setStyle({
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
			//remove active class boxThree, try
			var box3 = document.getElementById("buttonThree");
			var active3 = box3.classList.contains("btn-primary");
			if (active3 == true) {
				box3.classList.remove("btn-primary");
				box3.classList.add("btn-default");
				try {
					//remove boxThree data
					middleschool_boundaries_layer.setStyle({
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
			//remove active class boxFour, try
			var box4 = document.getElementById("buttonFour");
			var active4 = box4.classList.contains("btn-primary");
			if (active4 == true) {
				box4.classList.remove("btn-primary");
				box4.classList.add("btn-default");
				try {
					//remove boxThree data
					highschool_boundaries_layer.setStyle({
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
			sixthgrade_boundaries_layer.setStyle(function(feature){
				var name = feature.getProperty('color');
				var color;
				if (name == "purple") {
					color = "#9B59B6";
				} else if (name == "green") {
					color = "#28B463";
				} else if (name == "red") {
					color = "#EC7063";
				} else if (name == "blue") {
					color = "#5D6D7E";
				} else {
					color = "#17202A";
				}
				return {
  					fillColor: color,
  					fillOpacity: 0.5,
  					clickable: false,
  					strokeColor: 'black',
  					strokeOpacity: 1,
  					strokeWeight: 1,
  					visible: false
  				};
			});
			//remove active class
			box.classList.remove('btn-primary');
			box.classList.add('btn-default');
			schoolChoiceControl = "None";
		} else if (active == false) {
			//add boxTwo data
			sixthgrade_boundaries_layer.setStyle(function(feature){
				var name = feature.getProperty('color');
				var color;
				if (name == "purple") {
					color = "#9B59B6";
				} else if (name == "green") {
					color = "#28B463";
				} else if (name == "red") {
					color = "#EC7063";
				} else if (name == "blue") {
					color = "#5D6D7E";
				} else {
					color = "#17202A";
				}
				return {
  					fillColor: color,
  					fillOpacity: 0.5,
  					clickable: false,
  					strokeColor: 'black',
  					strokeOpacity: 1,
  					strokeWeight: 1,
  					visible: true
  				};
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
			//remove active class boxThree, try
			var box3 = document.getElementById("buttonThree");
			var active3 = box3.classList.contains("btn-primary");
			if (active3 == true) {
				box3.classList.remove("btn-primary");
				box3.classList.add("btn-default");
				try {
					//remove boxThree data
					middleschool_boundaries_layer.setStyle({
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
			//remove active class boxFour, try
			var box4 = document.getElementById("buttonFour");
			var active4 = box4.classList.contains("btn-primary");
			if (active4 == true) {
				box4.classList.remove("btn-primary");
				box4.classList.add("btn-default");
				try {
					//remove boxThree data
					highschool_boundaries_layer.setStyle({
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
			schoolChoiceControl = "SixthGrade";
		}
	};
	
	function clickedAddDataButtonThree(source) {
		var box = document.getElementById(source);
		var active = box.classList.contains('btn-primary');
		if (active == true) {
			//remove data
			middleschool_boundaries_layer.setStyle(function(feature){
				var name = feature.getProperty('color');
				var color;
				if (name == "purple") {
					color = "#9B59B6";
				} else if (name == "green") {
					color = "#28B463";
				} else if (name == "red") {
					color = "#EC7063";
				} else if (name == "blue") {
					color = "#5D6D7E";
				} else {
					color = "#17202A";
				}
				return {
  					fillColor: color,
  					fillOpacity: 0.5,
  					clickable: false,
  					strokeColor: 'black',
  					strokeOpacity: 1,
  					strokeWeight: 1,
  					visible: false
  				};
			});
			//remove active class
			box.classList.remove('btn-primary');
			box.classList.add('btn-default');
			schoolChoiceControl = "None";
		} else if (active == false) {
			//add boxThreee data
			middleschool_boundaries_layer.setStyle(function(feature){
				var name = feature.getProperty('color');
				var color;
				if (name == "purple") {
					color = "#9B59B6";
				} else if (name == "green") {
					color = "#28B463";
				} else if (name == "red") {
					color = "#EC7063";
				} else if (name == "blue") {
					color = "#5D6D7E";
				} else {
					color = "#17202A";
				}
				return {
  					fillColor: color,
  					fillOpacity: 0.5,
  					clickable: false,
  					strokeColor: 'black',
  					strokeOpacity: 1,
  					strokeWeight: 1,
  					visible: true
  				};
			});
			//add active class boxThree
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
			//remove active class boxTwo, try
			var box3 = document.getElementById("buttonTwo");
			var active3 = box3.classList.contains("btn-primary");
			if (active3 == true) {
				box3.classList.remove("btn-primary");
				box3.classList.add("btn-default");
				try {
					//remove boxTwo data
					sixthgrade_boundaries_layer.setStyle({
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
			//remove active class boxFour, try
			var box4 = document.getElementById("buttonFour");
			var active4 = box4.classList.contains("btn-primary");
			if (active4 == true) {
				box4.classList.remove("btn-primary");
				box4.classList.add("btn-default");
				try {
					//remove boxThree data
					highschool_boundaries_layer.setStyle({
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
			schoolChoiceControl = "MiddleSchool";
		}
	};
	
	function clickedAddDataButtonFour(source) {
		var box = document.getElementById(source);
		var active = box.classList.contains('btn-primary');
		if (active == true) {
			//remove data
			highschool_boundaries_layer.setStyle(function(feature){
				var name = feature.getProperty('color');
				var color;
				if (name == "purple") {
					color = "#9B59B6";
				} else if (name == "green") {
					color = "#28B463";
				} else if (name == "red") {
					color = "#EC7063";
				} else if (name == "blue") {
					color = "#5D6D7E";
				} else {
					color = "#17202A";
				}
				return {
  					fillColor: color,
  					fillOpacity: 0.5,
  					clickable: false,
  					strokeColor: 'black',
  					strokeOpacity: 1,
  					strokeWeight: 1,
  					visible: false
  				};
			});
			//remove active class
			box.classList.remove('btn-primary');
			box.classList.add('btn-default');
			schoolChoiceControl = "None";
		} else if (active == false) {
			//add boxFour data
			highschool_boundaries_layer.setStyle(function(feature){
				var name = feature.getProperty('color');
				var color;
				if (name == "purple") {
					color = "#9B59B6";
				} else if (name == "green") {
					color = "#28B463";
				} else if (name == "red") {
					color = "#EC7063";
				} else if (name == "blue") {
					color = "#5D6D7E";
				} else {
					color = "#17202A";
				}
				return {
  					fillColor: color,
  					fillOpacity: 0.5,
  					clickable: false,
  					strokeColor: 'black',
  					strokeOpacity: 1,
  					strokeWeight: 1,
  					visible: true
  				};
			});
			//add active class boxFour
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
			//remove active class boxTwo, try
			var box3 = document.getElementById("buttonTwo");
			var active3 = box3.classList.contains("btn-primary");
			if (active3 == true) {
				box3.classList.remove("btn-primary");
				box3.classList.add("btn-default");
				try {
					//remove boxTwo data
					sixthgrade_boundaries_layer.setStyle({
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
			//remove active class boxThree, try
			var box4 = document.getElementById("buttonThree");
			var active4 = box4.classList.contains("btn-primary");
			if (active4 == true) {
				box4.classList.remove("btn-primary");
				box4.classList.add("btn-default");
				try {
					//remove boxThree data
					middleschool_boundaries_layer.setStyle({
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
			schoolChoiceControl = "HighSchool";
		}
	};
	
	return {
		initMap: initMap,
		clickedAddDataButtonOne: clickedAddDataButtonOne,
		clickedAddDataButtonTwo: clickedAddDataButtonTwo,
		clickedAddDataButtonThree: clickedAddDataButtonThree,
		clickedAddDataButtonFour: clickedAddDataButtonFour
	};
})();















$(document).ready(function() {
	northKansasCityPublicSchools.initMap();
	$('#myModal').modal('show');
	northKansasCityPublicSchools.clickedAddDataButtonOne("buttonOne");
});




