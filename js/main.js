$(function(){

    //Slides Objects
    let slide = {
        //Init slide
        init: function(image, title, description) {
            this.image = image;
            this.title = title;
            this.description = description;
        },

        //Return image source
        origin: function() {
            let source = this.image;
            return source;
        },

        //Return image title
        showTitle: function() {
            let headTitle = this.title;
            return headTitle;
        },

        //Return image description
        showDesc: function() {
            let descriptionContent = this.description;
            return descriptionContent;
        }
    };

    // Slides creation
    let slide1 = Object.create(slide);
    slide1.init("img/image-slider-1.jpg", "Première slide", "Description 1");

    let slide2 = Object.create(slide);
    slide2.init("img/image-slider-2.jpg", "Deuxième slide", "Description 2");

    let slide3 = Object.create(slide);
    slide3.init("img/image-slider-3.jpg", "Troisième slide", "Description 3");

    let slide4 = Object.create(slide);
    slide4.init("img/image-slider-4.jpg", "Quatrième slide", "Description 4");

    //Adding slides to Array
    let slides = [];
    slides.push(slide1);
    slides.push(slide2);
    slides.push(slide3);
    slides.push(slide4);

    //Current slide
    let i = 0;

    // Time Between Switch
    let time = 5000;
    let transitionSpeed = "slow";

    function loadSlide(){
        //Slide image, title and description position
        $('#slideImage').attr('src', slides[i].origin());
        $('#slideTitle').text(slides[i].showTitle());
        $('#slideDesc').text(slides[i].showDesc());
    }

    function nextSlide() {
        //If current image number is not the last, pass to the next
        if (i != (slides.length - 1)) {
            i++;
        //Else, go to the beginning of the slider
        } else {
            i=0;
        }
        loadSlide();
    }

    //Behaviour at page first load
    loadSlide();
    $('.slides').fadeIn(transitionSpeed);

    function startAnimatingSlides(interval){
        setInterval(function(){
            $('#slideImage, #slideTitle, #slideDesc').fadeOut(transitionSpeed, function(){
            nextSlide();
            $(this).fadeIn(transitionSpeed);
            })
        }, interval);
    }

    let animateSlides= startAnimatingSlides(time);
    
    //Pause the slider when the mouse enter the slider
    $('.slides').on('mouseout', function(){
        animateSlides = startAnimatingSlides(time);
    });

    $('.slides').on('mouseover', function(){
        clearInterval(animateSlides);
    })

    //Change arrows color on hover
    $('.arrows > i').hover(
        function() {
            $(this).css('color', '#49a7cc');
        },
        function(){;
            $(this).css('color', 'white');
        }
    );
    
    function previousSlide() {
        loadSlide();
         //If current slide is not the first one, pass to the previous one
        if (i != 0) {
            i--;
        //Else, pass to the last slide of the slider
        } else {
            i=(slides.length -1);
        }
        loadSlide();
    }

    //When user clicks on arrows, pass directly to the previous or next slide
    function onClickChangeSlide() {
        $('#right-arrow, #left-arrow').click(function(){
            $(this).addClass("clicked");
            if ($('#right-arrow').hasClass('clicked')) {
                $(this).removeClass('clicked');
                $('#slideImage, #slideTitle, #slideDesc').fadeOut(transitionSpeed, function(){
                    nextSlide();
                    $(this).fadeIn(transitionSpeed);
                });
            } else if ($('#left-arrow').hasClass('clicked'))  {
                $(this).removeClass('clicked');
                $('#slideImage, #slideTitle, #slideDesc').fadeOut(transitionSpeed, function(){
                    previousSlide();
                    $(this).fadeIn(transitionSpeed);
                });
            }
        });
        $("body").keydown(function(e) {
            if(e.keyCode == 37) { // when the user pushes the left key
                clearInterval(animateSlides);
                $('#slideImage, #slideTitle, #slideDesc').fadeOut(transitionSpeed, function(){
                    previousSlide();
                    $(this).fadeIn(transitionSpeed);
                });
                animateSlides = startAnimatingSlides(time);
            }
            else if(e.keyCode == 39) { // when the user pushes the right key
                clearInterval(animateSlides);
                $('#slideImage, #slideTitle, #slideDesc').fadeOut(transitionSpeed, function(){
                    nextSlide();
                    $(this).fadeIn(transitionSpeed);
                });
                animateSlides = startAnimatingSlides(time);
            }
          });
    }

    onClickChangeSlide();
});
