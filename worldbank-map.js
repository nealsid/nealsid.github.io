// Type of violence: 1 - state based, 2 - non-state based, 3 - one-sided
ConflictTypes = {
    STATE : 0,
    NON_STATE : 1,
    ONE_SIDED : 2,
    ALL : 3
}

var openedInfoWindow = null;
function chooseColorForViolenceType(type_of_violence) {
    if (type_of_violence == ConflictTypes.STATE) { 
	return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    }
    if (type_of_violence == ConflictTypes.NON_STATE) {
	return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    }
    if (type_of_violence == ConflictTypes.ONE_SIDED) {
	return "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
    }
}
var heatmap_data = [];
var heatmap = null;
var aid_markers = [];
var conflict_markers = [];
function clearAllOverlays() {
    if (heatmap != null) {
	heatmap.setMap(null);
	heatmap = null;
    }
    for (var i = 0; i < aid_markers.length; ++i) {
	aid_markers[i].setMap(null);
    }
    aid_markers = [];
    for (var i = 0; i < conflict_markers.length; ++i) {
	conflict_markers[i].setMap(null);
    }
    conflict_markers = [];
}

var start_year = 1989;
var end_year = 2010;

function addMarkerAndInfo(map, latLong, title, start_date, end_date, estimated_deaths, type_of_violence, total_deaths) {

    var iconString = chooseColorForViolenceType(type_of_violence);
    // var weight_location = {
    // 	location: latLong,
    // 	weight: (estimated_deaths / total_deaths) * 10000
    // };
    // heatmap_data.push(weight_location);
    var marker = new google.maps.Marker({
    	position: latLong,
    	map: map,
    	icon: iconString
    });
    content_string = title
    if (start_date != null) {
    	content_string += "<br>" + start_date + "-";
    } else {
    	content_string += "-";
    }
    if (end_date != null) {
    	content_string += end_date + "<br>";
    } else { 
    	content_string += "<br>";
    }
    if (estimated_deaths != null) { 
    	content_string += "Estimated deaths: " + estimated_deaths + "<br>";
    }
    var infowindow = new google.maps.InfoWindow({
    	content: content_string
    });
    conflict_markers.push(marker);
    google.maps.event.addListener(marker, 'click', function() {
    	if (openedInfoWindow != null) {
    	    openedInfoWindow.close();
    	}
    	infowindow.open(map, marker);
    	openedInfoWindow = infowindow;
    });
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
var map = null;
var selectedConflictType;
function fetchAndDisplayArmedConflict(conflictType) {
    if (conflictType == undefined) {
	conflictType = ConflictTypes.ALL;
    }
    selectedConflictType = conflictType;
    clearAllOverlays();
    
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
		var conflict_start = (new Date(Date.parse(csv[29]))).getFullYear();
		var conflict_end = (new Date(Date.parse(csv[30]))).getFullYear();
		var type_of_violence_string = csv[5];
		var type_of_violence;
		if (type_of_violence_string == "1") {
		    type_of_violence = ConflictTypes.STATE;
		} else if (type_of_violence_string == "2") {
		    type_of_violence = ConflictTypes.NON_STATE;
		} else if (type_of_violence_string == "3") {
		    type_of_violence = ConflictTypes.ONE_SIDED;
		}
		if ((conflictType == ConflictTypes.ALL || conflictType == type_of_violence) 
		    && conflict_start >= start_year && conflict_end <= end_year) {
		    addMarkerAndInfo(map, latLong, csv[9], csv[29], csv[30], csv[37], type_of_violence, total_deaths);
		}
	    }

	    // heatmap = new google.maps.visualization.HeatmapLayer({
	    // 	data: heatmap_data,
	    // });   
	    // heatmap.setMap(map);
	    // heatmap.set('radius', 30);
	    // var gradient = [
	    // 	'rgba(0, 255, 255, 0)',
	    // 	'rgba(0, 255, 255, 1)',
	    // 	'rgba(0, 191, 255, 1)',
	    // 	'rgba(0, 127, 255, 1)',
	    // 	'rgba(0, 63, 255, 1)',
	    // 	'rgba(0, 0, 255, 1)',
	    // 	'rgba(0, 0, 223, 1)',
	    // 	'rgba(0, 0, 191, 1)',
	    // 	'rgba(0, 0, 159, 1)',
	    // 	'rgba(0, 0, 127, 1)',
	    // 	'rgba(63, 0, 91, 1)',
	    // 	'rgba(127, 0, 63, 1)',
	    // 	'rgba(191, 0, 31, 1)',
	    // 	'rgba(255, 0, 0, 1)'
	    // ]
	    // heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
	}
    });
}

function fetchAndDisplayWorldbankAidData() {
    clearAllOverlays();
    $.ajax({
	url:'worldbank-nigeria-aid.csv',
	type:'get',
	dataType:'text',
	success:function onSuccess(data, status, xhrobj) {
	    var worldbank = data.split("\n");
	    for(i = 1; i < worldbank.length; ++i) {
    		try {
    		    csv = $.csv.toArray(worldbank[i]);
    		} catch (err) {
    		    continue;
    		}
    		if (csv[9] == "" || csv[26] == "") {
    		    continue;
    		}
    		var latLong = new google.maps.LatLng(csv[26], csv[9]);
    		var amount = csv[23];
    		if (amount == "") {
    		    var radius = 500;
    		} else {
    		    var radius = 50 * amount;
    		}
    		var worldbankProjectCircle = {
    		    strokeColor: '#FF0000',
    		    strokeOpacity: 0.5,
    		    strokeWeight: 1,
    		    fillColor: '#DDDDFF',
    		    fillOpacity: 0.35,
    		    map: map,
    		    center: latLong,
    		    radius: radius,
    		    clickable: true
    		};
    		cityCircle = new google.maps.Circle(worldbankProjectCircle);	  
		aid_markers.push(cityCircle);
    		if (amount != "") {
    		    addCircleClickHandler(map, cityCircle, amount);
    		}
	    }
	}
    });
}

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(9.81116261034776, 6.830652665784798),
        zoom: 6
    };
    map = new google.maps.Map(document.getElementById("map-canvas"),
				  mapOptions);

    fetchAndDisplayArmedConflict();
    $(function() {
	$( "#radio" ).buttonset();
    });
    $(function() {
	$( "#conflictType" ).buttonset();
    });

    var datasetLink = document.createElement('h4');
    datasetLink.style.color = 'white';
    datasetLink.innerHTML = '<a href="http://www.pcr.uu.se/research/ucdp/datasets/ucdp_ged/">Conflict Data from Uppsala Conflict Data Program\'s (UCDP) Georeferenced Events Database (GED)</a>';
    var datasetDiv = document.createElement('div');
    datasetDiv.appendChild(datasetLink);

    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(datasetDiv);
}
google.maps.event.addDomListener(window, 'load', initialize);
$(window).resize(function () {
    var h = $(window).height(),
    offsetTop = 60; // Calculate the top offset

    $('#map-canvas').css('height', (h - offsetTop));
}).resize();

$( "#slider" ).slider({ range: true, values: [1995, 2005], min: 1989, max: 2010 });
// var preSlideValues = [];
// var postSlideValues = [];

// var x1,y1,x2,y2;
// var slider = $("#slider").children(".ui-slider-handle");
// y1 = slider.offset().top;
// x1 = slider.offset().left;
// y2 = slider.offset().top;
// x2 = slider.offset().left + 50;
// createLine(x1, y1, x2, y2);

var delta = -1;
$("#slider").on("slide", function(event, ui) {
    updateSliderBoxes(ui.values[0], ui.values[1]);
    start_year = parseInt(ui.values[0]);
    end_year = parseInt(ui.values[1]);
    fetchAndDisplayArmedConflict(selectedConflictType);
});

updateSliderBoxes($("#slider").slider("values")[0],$("#slider").slider("values")[1]);

function updateSliderBoxes(lowerBound, upperBound) {
    $( "#amount" ).val( lowerBound + " - " + upperBound);
}

// function createLine(x1,y1, x2,y2){
//     var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
//     var angle  = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
//     var transform = 'rotate('+angle+'deg)';

//     var line = $('<div>')
//         .appendTo('#page')
//         .addClass('line')
//         .css({
//             'position': 'absolute',
//             'transform': transform
//         })
//         .width(length)
//         .offset({left: x1, top: y1});

//     return line;
// }
