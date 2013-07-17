var map;
var sender;
var markersToDelete = [];

$(document).ready(function(){
	var mapOptions = {
		center : new google.maps.LatLng(38.000, -97.000),
		zoom : 4,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions);

	$.getJSON('presents.json', function(data) {
		sender = data['sender'];
		recipients = data['recipients'];

		sender.latLng = new google.maps.LatLng(parseFloat(sender['latitude']), parseFloat(sender['longitude']));

		buildRecipientList(recipients);

		var sender_icon = sender['profile_pic'];

		var senderMarker = new google.maps.Marker({
			position : sender.latLng,
			map : map,
			icon : sender_icon,
			animation : google.maps.Animation.DROP
		});
	});
});

function animateDelivery(event) {
	// ANIMATION CONSTANTS
	const numSegs = 50;
	const millisPerSeg = 10;
	
	var bounds = new google.maps.LatLngBounds();

	var recipientIcon = event.data['profile_pic'];

	var stopArray = [];

	$.each(event.data['stops'], function(key, val) {
		var latLng = new google.maps.LatLng(val['latitude'], val['longitude']);
		stopArray.push(latLng);
		bounds.extend(latLng);
	});
	
	map.fitBounds(bounds);

	var lineInterval = setInterval(drawLine, millisPerSeg);

	var segStartPoint = sender.latLng;
	// segment of the line (animation)
	var segCount = 0;
	// leg of the trip
	var legCount = 0;
	// total number of legs of the trip
	var numLegs = stopArray.length - 1;

	var latDist = (stopArray[legCount + 1].lat() - stopArray[legCount].lat()) / numSegs;
	var lngDist = (stopArray[legCount + 1].lng() - stopArray[legCount].lng()) / numSegs;

	function drawLine() {
		if(segCount == 0 && legCount == 0){
			clearMap();
		}
		
		// if we've reached the next leg of the trip
		if (segCount == numSegs) {
			incrementLeg();
		} else {
			// calculate end point
			var endPoint = new google.maps.LatLng(stopArray[legCount].lat() + (latDist * (segCount + 1)), stopArray[legCount].lng() + (lngDist * (segCount + 1)));
			markersToDelete.push(new google.maps.Polyline({
				map : map,
				path : [segStartPoint, endPoint],
				strokeColor : '#FF0000',
				strokeOpacity : 1.0,
				strokeWeight : 2
			}));
			segStartPoint = endPoint;
			segCount++;
		}
	}

	function incrementLeg() {
		legCount++;
		// if we're not at the end of the animation
		if (legCount < numLegs) {
			
			latDist = (stopArray[legCount + 1].lat() - stopArray[legCount].lat()) / numSegs;
			lngDist = (stopArray[legCount + 1].lng() - stopArray[legCount].lng()) / numSegs;

			markersToDelete.push(new google.maps.Marker({
				position : stopArray[legCount],
				map : map,
				animation : google.maps.Animation.DROP
			}));
			segCount = 0;
		} else {
			endAnimation();
		}
	}

	function endAnimation() {
		clearInterval(lineInterval);
		markersToDelete.push(new google.maps.Marker({
			position : stopArray[legCount],
			map : map,
			icon : recipientIcon,
			animation : google.maps.Animation.DROP
		}));
	}

}

function clearMap(){
	$.each(markersToDelete, function(key, val){
		val.setMap(null);
	});
};

function buildRecipientList(recipients) {
	var i = 1;
	$.each(recipients, function(key, val) {
		var recipientImg = $('.fPanel' + i.toString());
		// recipient_div.find('.recipient-icon-img').prop('src', val['profile_pic']);
		// recipient_div.find('.recipient-name').text(val['name']);
		// recipient_div.find('.recipient-city').text(val['city']);
		// recipient_div.find('.recipient-delivery-status').text(val['status']);
		// recipient_div.appendTo('#tracker-menu').show();
		recipientImg.bind('click', val, animateDelivery);
		i++;
	});
}

// google.maps.event.addDomListener(window, 'load', initialize);
