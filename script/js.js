$(document).ready(function() {

  var finder = {
    searchText: $('#locateTextbox'),
    init: function () {
      finder.getAction();
    },

    getAction: function() {
      var findLocation = $('#findLocation');
      var getDirection = $('#getDirection');
      var mapCheck = $('#mapCheck');
      var mapButton = $('#mapButton');
      var locInfo = $('#locInfo');
      findLocation.click(function() {
        //alert('hey there');
        $('#option2').hide();
        $("#myMap").css({'left': '-990', 'top': '0px'});

        finder.getSearch();
      });
      getDirection.click(function() {
        //alert("sos, someone's lost")
        $('#option2').hide();
        $("#myMap").css({'left': '-990', 'top': '0px'});
        finder.findLoc();
      });
      mapCheck.click(function() {
        //alert("i want the map");
        $('#option1').hide();
        $('#option2').hide();
        finder.showMap();
      });
      mapButton.click(function() {
        $('#infoBox').hide()
        $("#myMap").css({'left': '990', 'top': '150px'});
        $('#mapButton').hide();
        $('#locInfo').show();
      });
      locInfo.click(function() {
        $('#infoBox').show()
        $("#myMap").css({'left': '-990', 'top': '0px'});
        $('#mapButton').show();
        $('#locInfo').hide();
      });
    },

    getSearch: function() {
      $("#option1").show();
      //console.log("im here");
      var searchButton = $('#searchButton');
      $('#infoBox').hide();
      searchButton.click( function() {
        //var searchText = document.getElementById('locateTextbox').value;
        //document.getElementById('locateTextbox').value =  "";
        if(finder.searchText.val() != "") {
          finder.getLocation(finder.searchText.val());
        }
        else {
          alert("Enter a valid loacation");
        }
      });
    },

    getLocation: function(search) {
     // console.log(search);
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'address': search}, function(result, status) {
        //console.log(result);
        finder.searchText.val();
        finder.showLocation(result[0]);
      });    
    },

    showLocation: function(data) {
      //console.log(data);
      var location = data.formatted_address;
      var longitude = data.geometry.location.D;
      var lat = data.geometry.location.k;
      var LatLng = new google.maps.LatLng(lat,longitude);
      //console.log(LatLng);
      $( "#infoBox p:nth-child(1)" ).html("Location: "+location);
      mapOptions = {
        zoom: 7,
        center: {lat: lat, lng: longitude}
      }
      var map = new google.maps.Map(document.getElementById('myMap'), mapOptions);
      $('#infoBox').hide();
      $('#locInfo').show();
      $("#myMap").css({'left': '990', 'top': '150px'});
      var marker = new google.maps.Marker({
        position: LatLng,
        map: map,
        title: location
      });
      marker.setMap(null);
      marker.setMap(map);

      finder.getInfo(lat,longitude);
    },

    findLoc: function(){
      $("#option2").show();
      finder.getEnds();
    },

    getEnds: function() {
      var direct = $("#direct");
      direct.click(function() {
        var start = $("#locationStart").val();
        var end = $("#locationEnd").val();
        finder.getRoute(start, end);
      });
    },

    getRoute: function(initial, endpoint) {
      //console.log(initial);
      mapOptions = {
        center: { lat: 6.4531, lng: 3.3958},
        zoom: 12
      };
      var map = new google.maps.Map(document.getElementById('myMap'), mapOptions);
      var directionsService = new google.maps.DirectionsService();
      var direction = new google.maps.DirectionsRenderer();
      var request = {
        origin: initial,
        destination: endpoint,
        travelMode: google.maps.TravelMode.DRIVING
      };
      directionsService.route(request, function(response,status){
        //console.log(response);        
        direction.setDirections(response);
        direction.setMap(map);        
        //console.log(response);
        if(response.status === "OK"){
          $('#infoBox').hide();
          $("#myMap").css({'left': '990', 'top': '150px'});
          //$('#locInfo').show();
          finder.setRoute(response);
        }
        else {
          alert("this information is not available");
        }
      });
    },

    setRoute: function(route) {
      console.log(route);
      var distance = route.routes[0].legs[0].distance["text"];
      var duration = route.routes[0].legs[0].duration["text"];
      var startD = route.routes[0].legs[0].start_location.D;
      var startK = route.routes[0].legs[0].start_location.k;
      var endD = route.routes[0].legs[0].end_location.D;
      var endK = route.routes[0].legs[0].end_location.k;
    },

    showMap: function() {
      mapOptions = {
        center: { lat: 6.4531, lng: 3.3958},
        zoom: 12
      };
      var map = new google.maps.Map(document.getElementById('myMap'), mapOptions);
      $("#myMap").css({'left': '500', 'top': '150px'});
      finder.getAddress(map);
    },

    getAddress: function(map) {
      var geocoder = new google.maps.Geocoder();
      var info = new google.maps.InfoWindow();
      var drawer = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.MARKER]
        }
      });
      drawer.setMap(map);
      google.maps.event.addListener(drawer,'markercomplete',function(marker){
        var markerPosition = marker.getPosition();
        geocoder.geocode({'latLng': markerPosition},function(results, status) {
          finder.showAddress(map, results[0], marker, info);
          console.log(results[0].formatted_address);
          var latitude = markerPosition.k;
          var longitude = markerPosition.D;
          $( "#infoBox p:nth-child(1)" ).html("Location: "+results[0].formatted_address);
          finder.getInfo(latitude,longitude);
        });
      })
      marker.setMap(null);
    },

    showAddress: function (map,result, marker, popup) {
      map.setCenter(marker.getPosition());
      map.setZoom(13);
      var popupContent = '<b>Address: </b> ' + result.formatted_address;
      popup.setContent(popupContent);
      popup.open(map, marker);
    },

    getInfo: function(lat,lng) {
      var temp;
      $.getJSON("http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lng+"\"", function(data) {
        console.log(data);
        temp = data.main.temp;
      });
      var tZone = new TimeZoneDB;
      tZone.getJSON(
        {
          key: "QDXS7M37PHY5",
          lat: lat,
          lng: lng
        }, function(resp){
          //console.log(resp);
          //console.log(temp);
          $( "#infoBox p:nth-child(2)" ).html("Latitude: "+lat);
          $( "#infoBox p:nth-child(3)" ).html("Longitude: "+lng);
          $( "#infoBox p:nth-child(4)" ).html("timezone");
          $( "#infoBox p:nth-child(5)" ).html("Temperature: "+temp);
          //$('#infoBox').show();
      });
    }
  };
  google.maps.event.addDomListener(window, 'load', finder.init);
  // google.maps.event.addDomListener(window, 'load', initialize);
});
