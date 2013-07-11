function initialize() {
	var mapOptions = {
		center : new google.maps.LatLng(38.000, -97.000),
		zoom : 4,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

	var sender;
	var recipient;
	
	var senderMarker;

	$.getJSON('presents.json', function(data) {
		sender = data['sender'];
		recipients = data['recipients']['0'];
		
		sender.latLng = new google.maps.LatLng(parseFloat(sender['latitude']),
			parseFloat(sender['longitude']));
		
		build_recipient_list(recipients);
		
		var sender_icon = sender['profile_pic'];
		
		senderMarker = new google.maps.Marker({
			position: sender.latLng,
			map: map,
			icon: sender_icon
		});
	});
}

function build_recipient_list(recipients){
	$.each(recipients, function(key, val){
		var recipient_div = $('#recipient-template').clone();
		
		recipient_div.find('.recipient-icon-img').prop('src', val['profile_pic']);
		recipient_div.find('.recipient-name').text(val['name']);
		recipient_div.find('.recipient-city').text(val['city']);
		recipient_div.find('.recipient-delivery-status').text(val['status']);
		recipient_div.appendTo('#tracker-menu').show();
	});
}

function animate_delivery(){
	alert('animate received.')
}


google.maps.event.addDomListener(window, 'load', initialize);
