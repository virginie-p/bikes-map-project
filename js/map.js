$(function(){
    //Check for browser support
    mapboxgl.accessToken = 'pk.eyJ1IjoiaGVhdmVuZ2luIiwiYSI6ImNqcmFwMWV1azAyZnozeXVwd3E4cTV5NHUifQ.YECpNPNTN1mEalhM4CEaZA';
    if (!mapboxgl.supported()) {
        alert('Your browser does not support Mapbox GL');
    } else {
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-1.5534, 47.2173],
            zoom: 11.5
        });
    }

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());


    ajaxGet('https://api.jcdecaux.com/vls/v1/stations?contract=Nantes&apiKey=43843bfbd5c1b3135110c90e8b2d38f9886e4c56', displayStations);
    setInterval(updateData, 30000);
    
    function updateData() {
        ajaxGet('https://api.jcdecaux.com/vls/v1/stations?contract=Nantes&apiKey=43843bfbd5c1b3135110c90e8b2d38f9886e4c56', displayStations);
    }

    function displayStations(reponse) {
        console.log('appel ajaxGet');
        stationsData = JSON.parse(reponse);

        let regex = /[A-Za-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]+ ?[A-Za-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]* ?[A-Za-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]*/;
        
        let stationsList = stationsData.map(function(cityStation){
            let position = JSON.parse(`[${cityStation.position.lng},${cityStation.position.lat}]`);
            let name = cityStation.name.match(regex);
            let id = cityStation.name.substring(0,6);
            let address = cityStation.address;
            let places = cityStation.bike_stands;
            let availableBikes = cityStation.available_bikes;
            let status = cityStation.status;
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: position
                },
                properties: {
                    name: name,
                    id: id,
                    status : status,
                    address: address, 
                    places: places,
                    bikes: availableBikes,
                }
            }
        });
    
        //Create Station Object
        let station = {
            init: function (name, id, coordinates, status, address, places, bikes){
                this.name = name;
                this.id = id;
                this.coordinates = coordinates;
                this.status = status;
                this.address = address;
                this.places = places;
                this.bikes = bikes;
            },
            addPointToMap: function(){
                let el = document.createElement('div');
                el.id = this.id;
                el.className = 'stations iconNormal';
                el.style.backgroundImage = 'url(img/pin.png)';
                el.style.backgroundSize= 'contain';

                // add marker to map
                new mapboxgl.Marker(el)
                .setLngLat(this.coordinates)
                .addTo(map);
            }
        }

        let stations = [];
        
        //For each retrieved Data, add to Array and to Map
        stationsList.forEach(function(index){
            let stat = Object.create(station);
            stat.init(index.properties.name, index.properties.id, index.geometry.coordinates, index.properties.status, index.properties.address, index.properties.places, index.properties.bikes);
            stations.push(stat);
            stat.addPointToMap();
        });

        //Change the cursor to pointer on mouseenter
        $('.stations').on('mouseenter', function (e) {
            e.target.style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves
        $('.stations').on('mouseleave', function (e) {
            e.target.style.cursor = '';
        });

        //Create station div content
        $(document).on('click', '.stations', createStationDiv);

        function createStationDiv(e) {
            $('#info').remove();
            $('.iconZoom').addClass('iconNormal').removeClass('iconZoom');
    
            let clickedStation = e.target.id;

            console.log(clickedStation);

            $(clickedStation).addClass('iconZoom').removeClass('iconNormal');
    
            let stationInfo = stations.find(function(element){
                return element.id == clickedStation;
            });
    
            displayStationInfo();
    
            displayStationStatus();
    
            if (window.innerWidth <= 750) {
                let $target = $('html, body');
                $target.animate({scrollTop: $('#info').offset().top}, 2000);
                $('.page').height('100%');
            }
            
            //Create booking form fields
            if (stationInfo.bikes >= 1) {
            let formName = $('<h3>').text('Réservez votre vélo');
            let userLastname = $('<div class="lastname"><label for="lastname">Nom :</label><input type="text" name="lastname" required></div>');
            let userFirstname = $('<div class="firstname"><label for="firstname">Prénom :</label><input type="text" name="firstname" required></div>');
            let bookingButton = $('<input id="booking-button" type="button" value="Réserver">')
            $('#booking-form').append(formName, userLastname, userFirstname, bookingButton);
            }

            //Creating status info for the station
            function displayStationInfo() {
                $('.bike-booking').append('<div id="info">');
        
                let titleElem = '<h3>';
                let contentElem = '<p>';
        
                let name = $('<h2 class ="station-name">').text(stationInfo.name);
                let addressTitle = $(titleElem).text('Adresse de la station');
                let address = $(contentElem).text(stationInfo.address);
                let placesTitle = $(titleElem).text('Nombre de places de parking');
                let places = $(contentElem).text(stationInfo.places);
                let bikesTitle = $(titleElem).text('Nombre de vélos disponibles');
                let bikes = $(contentElem).text(stationInfo.bikes);
                let form = $('<form id="booking-form">');
        
                $('#info').append(name, addressTitle, address, placesTitle, places, bikesTitle, bikes, form);
            }
        
            //Displaying station status in the div #info
            function displayStationStatus() {
                let status;
                if (stationInfo.status == "OPEN") {
                    status = $('<h4>').text("La station est actuellement ouverte").css('color', 'green');
                } else if (stationInfo.status == "CLOSE") {
                    status = $('<h4>').text("La station est actuellement fermée").css('color', 'red');
                }
                $(status).insertAfter('.station-name');
            }
        }
    
    }

    

    //Create signature zone when the user clicks on the booking button
    $(document).on('click','#booking-button', function() {
        let validation;

        //Verify form fields and display signature zone if fields are filled
        formFieldsValidation();

        if (validation == true){
            displaySignatureZone();
        }

        window.addEventListener('resize', setDimensionsCanvas);

        //Init Canvas signature-like zone
        let can = document.getElementById('signatureZone');
        let ctx = can.getContext("2d");
        
        drawSignature();

        //Function to erase the canvas div
        $('#clearSignature').on('click', erase);

        $('#bookingConfirmation').on('click', saveFormData);

        function drawSignature() {
            let draw;
            
            $('#signatureZone').mousedown(function(e){
                ctx.strokeStyle = "green";
                ctx.lineCap = "round";
                ctx.lineWidth = 6;
                ctx.lineJoin = "round";

                draw = true;
                ctx.beginPath();
                ctx.moveTo(e.offsetX, e.offsetY);
            });

            $('#signatureZone').mouseup(function(){
                draw = false;
                return draw;
            });

            $('#signatureZone').mousemove(function(e){
                if (draw == true){
                    ctx.lineTo(e.offsetX, e.offsetY);
                    ctx.stroke();
                }
            });

            $('#signatureZone').mouseleave(function(){
                draw = false;
                return draw;
            });

            //Mobile version 
            can.addEventListener('touchstart', function(e){
                console.log('enter touchstart');
                draw = true;
                ctx.beginPath();
                ctx.moveTo(e.offsetX, e.offsetY);
            });

            can.addEventListener('touchmove', function(e){
                if (draw == true){
                    ctx.lineTo(e.offsetX, e.offsetY);
                    ctx.stroke();
                }
            });

            can.addEventListener('touchend', function(){
                draw = false;
                return draw;
            });
        }
            //Function to clear the canvas
        function erase() {
            ctx.clearRect(0, 0, can.width, can.height);
        }

        function displaySignatureZone() {

            $('#booking-form').append($('<div id="signature">'));

            let closeIcon = $('<i class="fas fa-times" id="close">');
            let canvas = $('<canvas id="signatureZone">');
            let confirmBooking = $('<input id="bookingConfirmation" type="submit" value="Confirmer la réservation">');
            let eraseSignature = $('<input id="clearSignature" type="button" value="Effacer la signature">');
            let divButtons =  $('<div id="buttons-canvas">').append(confirmBooking, eraseSignature);

            $('#signature').append(closeIcon, canvas, divButtons)
            
            if (window.innerWidth <= 750) {
                $('#signature').animate({
                    width: '345px',
                    height: '200px',
                    opacity:'1'
                }, setDimensionsCanvas);
            } if (window.innerWidth > 750) {
                $('#signature').animate({
                    width: '400px',
                    height: '250px',
                    opacity:'1'
                }, setDimensionsCanvas);
            }
            
        }

        function setDimensionsCanvas() {
            let signZone = document.getElementById('signatureZone');
            let canvasDimension = signZone.getBoundingClientRect();

            signZone.width = canvasDimension.width;
            signZone.height = canvasDimension.height;

        }

        //Function to check if the fields of the form are filled before displaying the signature zone
        function formFieldsValidation() {
            $('.error-message').remove();

            let lastnameField =  $('.lastname > input').val().trim().length;
            let firstnameField = $('.firstname > input').val().trim().length;
            let errorMessage = $('<p class="error-message">').text('Merci de renseigner l\'ensemble des champs pour continuer').css('color', 'red');


            if ((lastnameField == 0) || (firstnameField == 0)){
                $(errorMessage).insertBefore('#booking-button');
                validation = false;
            } else {
                validation = true;
            }

            return validation;
        }

        function createBooking() {
            let lastname = localStorage.setItem("lastname", $('.lastname').value());
            let firstname = localStorage.setItem("firstname", $('.firsname').value());

            let signatureImg = new Image();
            signatureImg.src = signatureZone.toDataURL();

            let signature = localStorage.setItem("signature", signatureImg);


            
        }
    });
    

    //Functions to close the signature div
    $(document).on('click', '#close', function(){
        $('#signature').remove();
    });

    $(document).mouseup(function (e) {
        if (!$('#signature').is(e.target) // if the target of the click isn't the container...
        && $('#signature').has(e.target).length === 0) // ... nor a descendant of the container
        {
            $('#signature').remove();
        }
    });
    
});
