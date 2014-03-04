// Type of violence: 1 - state based, 2 - non-state based, 3 - one-sided
var openedInfoWindow = null;
function chooseColorForViolenceType(type_of_violence) {
    if (type_of_violence == 1) { 
	return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    }
    if (type_of_violence == 2) {
	return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    }
    if (type_of_violence == 3) {
	return "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
    }
}
var heatmap_data = [];

function addMarkerAndInfo(map, latLong, title, start_date, end_date, estimated_deaths, type_of_violence, total_deaths) {
    var iconString = chooseColorForViolenceType(type_of_violence);
    var weight_location = {
	location: latLong,
	weight: (estimated_deaths / total_deaths) * 10000
    };
    heatmap_data.push(weight_location);
    // var marker = new google.maps.Marker({
    // 	position: latLong,
    // 	map: map,
    // 	icon: iconString
    // });
    // content_string = title
    // if (start_date != null) {
    // 	content_string += "<br>" + start_date + "-";
    // } else {
    // 	content_string += "-";
    // }
    // if (end_date != null) {
    // 	content_string += end_date + "<br>";
    // } else { 
    // 	content_string += "<br>";
    // }
    // if (estimated_deaths != null) { 
    // 	content_string += "Estimated deaths: " + estimated_deaths + "<br>";
    // }
    // var infowindow = new google.maps.InfoWindow({
    // 	content: content_string
    // });
    // google.maps.event.addListener(marker, 'click', function() {
    // 	if (openedInfoWindow != null) {
    // 	    openedInfoWindow.close();
    // 	}
    // 	infowindow.open(map, marker);
    // 	openedInfoWindow = infowindow;
    // });
}
var lastCircleInfoWindow = null;
function addCircleClickHandler(map, circ, aid_amount) {
    var infowindow = new google.maps.InfoWindow({
	content: aid_amount + " million dollars",
	position: circ.getCenter()
    });
    google.maps.event.addListener(circ, 'click', function(ev){
	infowindow.position = circ.getCenter();
	if (lastCircleInfoWindow != null) {
	    lastCircleInfoWindow.close();
	}
	lastCircleInfoWindow = infowindow;
	infowindow.open(map);
    });
}
var nigeria_aid = null;
var map = null;

function csvFetchSuccess(data, status, xhrobj) {
    nigeria_aid = new String(data);
}

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(-34.397, 150.644),
        zoom: 8
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
				  mapOptions);

    $.ajax({
	url:'armed-conflict.csv',
	type:'get',
	dataType:'text',
	success:function onSuccess(data, status, xhrobj) {
	    var total_deaths = 0;
	    nigeria_conflict = data.split("\n");
	    for(i = 1; i < nigeria_conflict.length; ++i) {
		try {
		    csv = $.csv.toArray(nigeria_conflict[i]);
		}catch(err) {
		    continue;
		}
		total_deaths += csv[37];
	    }
	    for(i = 1; i < nigeria_conflict.length; ++i) {
		try {
		    csv = $.csv.toArray(nigeria_conflict[i]);
		}catch(err) {
		    continue;
		}
		var latLong = new google.maps.LatLng(csv[25], csv[26]);
		addMarkerAndInfo(map, latLong, csv[9], csv[29], csv[30], csv[37], csv[5], total_deaths);
		if (i == 1) {
		    map.setCenter(latLong);
		}
	    }
	    // var pointArray = new google.maps.MVCArray(heatmap_data);

	    heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatmap_data,
	    });   
	    heatmap.setMap(map);
	    heatmap.set('radius', 30);
	    var gradient = [
		'rgba(0, 255, 255, 0)',
		'rgba(0, 255, 255, 1)',
		'rgba(0, 191, 255, 1)',
		'rgba(0, 127, 255, 1)',
		'rgba(0, 63, 255, 1)',
		'rgba(0, 0, 255, 1)',
		'rgba(0, 0, 223, 1)',
		'rgba(0, 0, 191, 1)',
		'rgba(0, 0, 159, 1)',
		'rgba(0, 0, 127, 1)',
		'rgba(63, 0, 91, 1)',
		'rgba(127, 0, 63, 1)',
		'rgba(191, 0, 31, 1)',
		'rgba(255, 0, 0, 1)'
	    ]
	    heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
	}
    });
    // for(i = 1; i < worldbank.length; ++i) {
    // 	try {
    // 	    csv = $.csv.toArray(worldbank[i]);
    // 	} catch (err) {
    // 	    continue;
    // 	}
    // 	if (csv[9] == "" || csv[26] == "") {
    // 	    continue;
    // 	}
    // 	var latLong = new google.maps.LatLng(csv[26], csv[9]);
    // 	var amount = csv[23];
    // 	if (amount == "") {
    // 	    var radius = 500;
    // 	} else {
    // 	    var radius = 50 * amount;
    // 	}
    // 	var worldbankProjectCircle = {
    // 	    strokeColor: '#FF0000',
    // 	    strokeOpacity: 0.5,
    // 	    strokeWeight: 1,
    // 	    fillColor: '#DDDDFF',
    // 	    fillOpacity: 0.35,
    // 	    map: map,
    // 	    center: latLong,
    // 	    radius: radius,
    // 	    clickable: true
    // 	};
    // 	cityCircle = new google.maps.Circle(worldbankProjectCircle);	  
    // 	if (amount != "") {
    // 	    addCircleClickHandler(map, cityCircle, amount);
    // 	}
    // }
}
google.maps.event.addDomListener(window, 'load', initialize);
