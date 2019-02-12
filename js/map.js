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
        stationsData = JSON.parse(reponse);

        let regex = /[A-Za-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]+ ?[A-Za-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]* ?[A-Za-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]*/;
        
        let stationsList = stationsData.map(function(cityStation){
            let position = JSON.parse(`[${cityStation.position.lng},${cityStation.position.lat}]`);
            let name = cityStation.name.match(regex);
            let id = cityStation.name.substring(1,6);
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
        class Station {
            constructor (name, id, coordinates, status, address, places, bikes){
                this.name = name;
                this.id = id;
                this.coordinates = coordinates;
                this.status = status;
                this.address = address;
                this.places = places;
                this.bikes = bikes;
            }
            addPointToMap(elementClass){
                let el = document.createElement('div');
                el.id = this.id;
                el.className = `${elementClass} iconNormal`;
                el.style.backgroundImage = 'url(img/pin.png)';
                el.style.backgroundSize= 'contain';

                // add marker to map
                new mapboxgl.Marker(el)
                .setLngLat(this.coordinates)
                .addTo(map);
                
                //Change the cursor to pointer on mouseenter
                $(`.${elementClass}`).on('mouseenter', function (e) {
                    e.target.style.cursor = 'pointer';
                });

                // Change it back to a pointer when it leaves
                $(`.${elementClass}`).on('mouseleave', function (e) {
                    e.target.style.cursor = '';
                });
            }

            //Creating status info for the station
            displayStationInfo(idInfo, idForm) {
                $('.bike-booking').append(`<div id=${idInfo}>`);

                let titleElem = '<h3>';
                let contentElem = '<p>';

                console.log(this.address);

                let name = $('<h2 class ="station-name">').text(this.name);
                let addressTitle = $(titleElem).text('Adresse de la station');
                let address =  $(contentElem).text(this.address);
                let placesTitle = $(titleElem).text('Nombre de places de parking');
                let places = $(contentElem).text(this.places)
                let bikesTitle = $(titleElem).text('Nombre de vélos disponibles');
                let bikes = $(contentElem).text(this.bikes);
                let form = $(`<form id=${idForm}>`);

                $(`#${idInfo}`).append(name, addressTitle, address, placesTitle, places, bikesTitle, bikes, form);

                //Create booking form fields
                if (this.bikes >= 1) {
                    let formName = $('<h3>').text('Réservez votre vélo');
                    let userLastname = $('<div class="lastname"><label for="lastname">Nom :</label><input type="text" name="lastname" required></div>');
                    let userFirstname = $('<div class="firstname"><label for="firstname">Prénom :</label><input type="text" name="firstname" required></div>');
                    let bookingButton = $('<input id="booking-button" type="button" value="Réserver">')
                    $('#booking-form').append(formName, userLastname, userFirstname, bookingButton);
                }

                //Automatic scroll to the #info div when user is on a mobile phone
                if (window.innerWidth <= 750) {
                    let target = $('html, body');
                    target.animate({scrollTop: $(`#${idInfo}`).offset().top}, 2000);
                    $('.page').height('100%');
                }
            }

            //Displaying station status in the div #info
            displayStationStatus() {
                let status = this.status == "OPEN" ? (
                    $('<h4>').text("La station est actuellement ouverte").css('color', 'green')
                ) : ( 
                    $('<h4>').text("La station est actuellement fermée").css('color', 'red')
                );
                $(status).insertAfter('.station-name');
            }
        
        }

        let stations = []

        //For each retrieved Data, add to Array and to Map
        stationsList.forEach(function(index){
            let stat = new Station (
                index.properties.name, 
                index.properties.id, 
                index.geometry.coordinates, 
                index.properties.status, 
                index.properties.address,
                index.properties.places,
                index.properties.bikes
            );
            stations.push(stat);
            stat.addPointToMap('stations');
        });

        $(document).on('click', '.stations', function(e){
            let stat = stations.find(function(element){
                return element.id == e.target.id;
            });

            let idDiv = 'info';
            $(`#${idDiv}`).remove();
            
           //Display a bigger icon for the station after a click on the marker
            $('.iconZoom').addClass('iconNormal').removeClass('iconZoom');
            $(`#${e.target.id}`).addClass('iconZoom').removeClass('iconNormal');
    
            stat.displayStationInfo(idDiv, 'booking-form');
            stat.displayStationStatus();
        });
           
    }
});