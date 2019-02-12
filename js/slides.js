$(function(){

    //Slides Objects
    class Slide {
        //Init slide
        constructor(image, title, description) {
            this.image = image;
            this.title = title;
            this.description = description;
        }
        loadSlide(){
            //Slide image, title and description position
            $('#slideImage').attr('src', this.image);
            $('#slideTitle').text(this.title);
            $('#slideDesc').text(this.description);
        }
    };

    // Slides creation
    let slide1 = new Slide("img/image-slider-1.jpg", "Première slide", "Description 1");
    let slide2 = new Slide("img/image-slider-2.jpg", "Deuxième slide", "Description 2");
    let slide3 = new Slide("img/image-slider-3.jpg", "Troisième slide", "Description 3");
    let slide4 = new Slide("img/image-slider-4.jpg", "Quatrième slide", "Description 4");

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

    //Behaviour at page first load
    slides[i].loadSlide();
    let animateSlides = setInterval(nextSlide, time);
    
    //Pause the slider when the mouse enter the slider
    $('.slides').hover(
        function(){
            clearInterval(animateSlides);
        },
        function() {
            animateSlides = setInterval(nextSlide, time);
        }
    );

    //Change arrows color on hover
    $('.arrows > i').hover(
        function() {
            $(this).css('color', '#49a7cc');
        },
        function(){;
            $(this).css('color', 'white');
        }
    );

    //When user clicks on arrows, pass directly to the previous or next slide
    $('#right-arrow').on('click', nextSlide);
    $('#left-arrow').on('click', prevSlide);

    //When user press keyboard left or right key,  pass directly to the previous or next slide 
    $(document).keydown(function(e) {
        clearInterval(animateSlides);
        if (e.keyCode == 37){
            prevSlide();
        } else if (e.keyCode == 39) {
            nextSlide();
        }
        animateSlides = setInterval(nextSlide, time);
    });

    //Function to pass to the next slide
    function nextSlide() {
        $('#slideImage, #slideTitle, #slideDesc').fadeOut(transitionSpeed).promise().done(function(){
            //If current image number is not the last, pass to the next 
            if (i != (slides.length-1)){
                i++;
            } else {
                i=0;
            }
            slides[i].loadSlide();
            $('#slideImage, #slideTitle, #slideDesc').fadeIn(transitionSpeed);
        }); 
    }

    //Function to pass to the previous slide    
    function prevSlide() {
        $('#slideImage, #slideTitle, #slideDesc').fadeOut(transitionSpeed).promise().done(function(){
            //If current slide is not the first one, pass to the previous one
           if (i != 0) {
               i--;
           //Else, pass to the last slide of the slider
           } else {
               i=(slides.length -1);
           }
           slides[i].loadSlide();
           $('#slideImage, #slideTitle, #slideDesc').fadeIn(transitionSpeed);
        });
    }

});
