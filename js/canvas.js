$(function(){
    //Create signature zone when the user clicks on the booking button
    $(document).on('click','#booking-button', function() {
        let validation;

        //Verify form fields and display signature zone if fields are filled
        formFieldsValidation();

        if (validation == true) {
            let signZone = new SignatureBlock( 
                "close", 
                "signatureZone", 
                "canvas-buttons", 
                "confirm-button", 
                "clear-button"
            );
            signZone.display('#booking-form', "signature");
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

     //Function to display the signature zone on the screen
     class SignatureBlock {
        constructor(idClose, idCanvas, idDivButtons, idConfirmation, idClear ) {
            this.idClear = idClear;
            this.closeIcon = $(`<i class="fas fa-times" id=${idClose}>`);
            this.canvas = $(`<canvas id=${idCanvas}>`);
            this.confirmBooking = $(`<input id=${idConfirmation} type="submit" value="Confirmer la réservation">`);
            this.eraseSignature = $(`<input id=${idClear} type="button" value="Effacer la signature">`);
            this.divButtonsInit =  $(`<div id=${idDivButtons}>`).append(this.eraseSignature);

            this.anim = window.innerWidth <= 750 ? ({
                width: '345px',
                height:'200px',
                opacity : 1
            }) : ({
                width: '400px',
                height:'250px',
                opacity: 1
            });
        }

        display(idBookingForm, idDivSign) {
            $(idBookingForm).append($(`<div id=${idDivSign}>`));
            $(`#${idDivSign}`).append(this.closeIcon, this.canvas, this.divButtonsInit); 

            $(`#${idDivSign}`).animate(this.anim, function(){
                this.can = new SignatureZone(document.getElementById('signatureZone'));
                this.can.enableDrawing(document.getElementById(this.idClear));
            }.bind(this));
        }
        
    }

    class SignatureZone {
        constructor(canvasId) {
            this.canvas = canvasId;
            this.canvasDimension = this.canvas.getBoundingClientRect();
            this.canvas.width = this.canvasDimension.width;
            this.canvas.height = this.canvasDimension.height;
            this.ctx = this.canvas.getContext("2d");
            this.count = 0
            this.draw = false;
        }

        //Start drawing line
        enableDrawing(idClear) {
            this.canvas.addEventListener('mousedown', (function(e){
                this.ctx.strokeStyle = "green";
                this.ctx.lineCap = "round";
                this.ctx.lineWidth = 4;
                this.ctx.lineJoin = "round";
    
                this.draw = true;
                this.ctx.beginPath();
                this.ctx.moveTo(e.offsetX, e.offsetY);
            }.bind(this)));
    
            //Stop drawing when the mouse is up
            this.canvas.addEventListener('mouseup', (function(){
                this.draw = false;
            }.bind(this)));
    
            //Move the line to the new place of the mouse
            this.canvas.addEventListener('mousemove', (function(e){
                if (this.draw == true){
                    this.ctx.lineTo(e.offsetX, e.offsetY);
                    this.ctx.stroke();
                    this.count++;
                }
            }.bind(this)));
    
            //Stop drawing when the mouse leave the canvas
            this.canvas.addEventListener('mouseleave', (function(){
                this.draw = false;
            }.bind(this)));
    
            //If the page is resized, set the dimensions of the canvas again (warning, it clears the current canvas !)
            window.addEventListener('resize', function(){
                this.canvas.width = this.canvasDimension.width;
                this.canvas.height = this.canvasDimension.height;
            }.bind(this));
    
            //If the user clicks on the clear button, clear the canvas
            idClear.addEventListener('click', function() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }.bind(this));

        }
    } 

});
