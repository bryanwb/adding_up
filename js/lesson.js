/* jslint browser: true
*/
$(document).ready(function(){


    var k = Karma({
	image: [
	    {name: "ball",   file: "ball37px.png"},
	    {name: "balloon", file: "balloon37px.png"},
	    {name: "banana", file: "banana37px.png"},
	    {name: "chilli", file: "chilli.png"},
	    {name: "fish"  , file: "fish64px.png"},
	    {name: "flower", file: "flower37px.png"},
	    {name: "normalChimp", file: "normalChimp_120x125.png"},
	    {name: "happyChimp", file: "happyChimp_120x125.png"},
	    {name: "sadChimp", file: "sadChimp_120x125.png"}],
	audio: [
	    {name: "correct",  file: "correct.ogg"},
	    {name: "incorrect", file: "incorrect.ogg"},
	    {name: "trigger", file: "trigger.ogg"}
	]

    });
    
    
k.ready(function() {

    var imageNames = ["ball",  "banana", "balloon","chilli", "fish", "flower"];
    //game logic
    var cards;
    var totalCorrect = 0, n0 = 0, n1 = 0, correctCard = 0,
        level = 0, score = 0, numCorrectAnswers = 0;
    var DRAW_MAX_X = 170, DRAW_MAX_Y = 170;
    var choices=[0, 0, 0];
    var timerSpeed = 12000;
    var START_TIMER_Y = 25, END_TIMER_Y = 125;
    var timerPaper, chimpPaper;
    var timerRect;
    var	normalChimpImage, sadChimpImage, happyChimpImage;
    var overlayCard, topLeftCard, topRightCard, bottomLeftCard, 
	bottomMiddleCard, bottomRightCard;

    var buttons=[];
    var isTimerRunning = false;
    var isGameRunning = false;


    var createCard = function (paperName, width, height) {
	var set;
	var paper;

	if(!width || !height){
	    paper = Raphael(paperName+"Paper", 200, 200);
	}
	else {
	    paper = Raphael(paperName+"Paper", width, height);
	}
	set = paper.set();
	return { "paper": paper, "prefix": paperName, "set": set};	
    };


    overlayCard = createCard("overlay", 800, 600);
    topLeftCard = createCard("topLeft");
    topRightCard = createCard("topRight");
    bottomLeftCard = createCard("bottomLeft");
    bottomMiddleCard = createCard("bottomMiddle");
    bottomRightCard = createCard("bottomRight");


    cards = [ topLeftCard, topRightCard, bottomLeftCard, 
	     bottomMiddleCard, bottomRightCard];

    sets =  [topLeftCard.set, topRightCard.set, bottomLeftCard.set, 
     bottomMiddleCard.set, bottomRightCard.set];


    function drawCards () {
	var imageId = imageNames[ level ];
	//reinitialize choices to zero
	choices = [0, 0, 0];

	cards.forEach(function (box) {
		box.set.remove();
	});
	
	totalCorrect = Karma.rand( 2, 5 + level ); //the totalCorrect
	n0 = totalCorrect - Karma.rand(1, totalCorrect - 1 ); //first number
	n1 = totalCorrect - n0; //second number

	//chose one option (the correct option) 
	//and then put the correct value into it 
	correctCard = Karma.rand( 0, 2 );	
	choices[ correctCard ] = totalCorrect;
   
	var computeUniqueChoice = function(choice){
	    var newChoice = 0;
	    if (choice === totalCorrect) {
		return choice;
	    } else {
		newChoice = Karma.rand( 1, 10 );
		if (newChoice === totalCorrect){
		    return computeUniqueChoice(choice);
		} else {
		    return newChoice;
		}
	    }
	};

	choices = choices.map(computeUniqueChoice);
	
	var drawCard = function (card, n) {
	    var positions = [];
	    var x =  0, y = 0; 
	    var isOverlapping = false;
	    var imageVarNames = {};
	    var varPrefix = card.prefix;	
	    imageVarNames[varPrefix] = [];
	    card.set = card.paper.set();
	    
	    for (var i=0; i<n; i++) {
		do {
		    isOverlapping = false;
		    x = Karma.rand( 0, DRAW_MAX_X);
		    y = Karma.rand( 0, DRAW_MAX_Y );
		    for ( var j=0; j<positions.length; j++) {
			if ( Karma.distance2( positions[j], 
						   {"x": x, "y": y} )  < 137 ) {
			    isOverlapping = true;
			    break;
			}
		    }
		    
		}while ( isOverlapping === true );
		positions.push( { "x":x, "y": y } ); 
		imageVarNames[varPrefix][i] = card.paper.
 		        image(k.image[imageId].src, x , y, 35, 35);
		card.set.push(imageVarNames[varPrefix][i]);		    
	    }
	    
	};

	//put the cards
	drawCard(topLeftCard, n0);
	drawCard(topRightCard, n1);
	drawCard(bottomLeftCard, choices[ 0 ]);
	drawCard(bottomMiddleCard, choices[ 1 ]);
	drawCard(bottomRightCard, choices[ 2 ]);
	
    }

    //put the buttons on the cards
    buttons[ 0 ] = { node: $('#bottomLeftPaper')[0], num: 0};
    buttons[ 1 ] = { node: $('#bottomMiddlePaper')[0], num: 1};
    buttons[ 2 ] = { node: $('#bottomRightPaper')[0], num: 2};

	    buttons.forEach(
		function(button) {
		    var numButton = button.num;
		    button.node
			.addEventListener('click', function (){ 
					      if(isGameRunning === true){
						  var myButton = numButton;
						  chooseCard(myButton);
					      }
					  }, false);
		});



   

    var chooseCard = function(numButton) {
		if ( choices[numButton] === totalCorrect){
		    //If the player has completed all the levels
		    if (numCorrectAnswers === 4 && level === 5) {
			congrats();
		    } else {
			computeScore(true, false);
			resetTimer();
			animateTimer();
			drawCards();
		    }
		}else {
		    computeScore(false, false);
		    resetTimer();
		    animateTimer();
		    drawCards(); 
		} 
    };



    var writeScore = function (newScore){
         $('#scoreBoxText')[0].innerHTML = newScore; 
    };


    var computeScore = function (correct, tooSlow) {

	if ( correct === false) {
	    //answer was incorrect or took too long
	    score = score - 1;
	    numCorrectAnswers = numCorrectAnswers - 1;
	    writeScore(score);
	    if (tooSlow === true) {
		k.audio.trigger.play();
	    } else {
		k.audio.incorrect.play();
	    }
	    //animate sad monkey
	    animateChimp(false);
	    
	} else {
	    score = score + 1;
	    numCorrectAnswers = numCorrectAnswers + 1;
	    writeScore(score);
	    k.audio.correct.play();
	    animateChimp(true);
	    if (numCorrectAnswers == 5){
		level = level + 1;
		timerSpeed = timerSpeed - 1000;
		numCorrectAnswers = 0;
	    } 
	   
	}
	

    };


    var startGame = function () {
	score = 0;
	writeScore(score);
	isTimerRunning = true;
	isGameRunning = true;

	//move timer back to start in case it is 
	//already running
	resetTimer();

	//start timer
	animateTimer();

	drawCards();
    };

    var stopGame = function () {
	writeScore(' ');
	isGameRunning = false;
	//stop timer
	isTimerRunning = false;
	resetTimer();
	
	//clear the cards
	cards.forEach(function (card) {
	    card.set.remove();
	    card.set = card.paper.set();
	});
	
    };

    var resetGame = function () {
	score = 0;
	writeScore(score);
	isTimerRunning = true;
	resetTimer();
	animateTimer();
	drawCards();
	
    };

    var resetTimer = function () {
    	timerRect.animate({y: START_TIMER_Y}, 0);
    };
    
    var animateTimer = function () {
	timerRect.animate({y : END_TIMER_Y}, timerSpeed, function(){ 
	    timerRect.attr("y", START_TIMER_Y);
	    if (isTimerRunning === true){
		computeScore(false, true);
		animateTimer();
		drawCards();
	    }
	});
    };


    var animateChimp = function (answer) {
	var timerChimp;	
	normalChimpImage.hide();
	if( answer === true){ 
	    happyChimpImage.show();
	} else {
	    sadChimpImage.show();
	}

	
	timerChip = setTimeout(function() { 
	    happyChimpImage.hide(); 
	    sadChimpImage.hide(); 
	    normalChimpImage.show();}, 800);
			       
    };

    var congrats = function () {
	var congratsText;
	stopGame();

	$('#overlay').css({"position": "absolute", "background": "white", "opacity": "0.7",
			   "width": 800, "height": 600, "z-index": 10});
	$('#overlayPaper').css({"position": "absolute", "z-index": "100", "opacity": 1});
	congratsChimp = overlayCard.paper.image(
	    k.image.happyChimp.src, 200, 100, 300, 400);
	congratsChimp.attr({"fill-opacity": "1", "opacity": "1"});
	congratsText = overlayCard.paper.text(400, 550, "Great Job!");
	congratsText.attr({"font-size": 80});
	overlayCard.set.push(congratsChimp, congratsText);

	congratsChimp.node.addEventListener('click', function(){
	    $('#overlay').css({"opacity": 0});
	    overlayCard.set.remove();
	}, false);

    };
						      
    document.getElementById('start').
    addEventListener('click', startGame, false);


    document.getElementById('stop').
    addEventListener('click', stopGame, true);
    
    document.getElementById('reset').
    addEventListener('click', resetGame, false);
   

    //set up the timer
    timerPaper = Raphael('timerPaper', 100, 150);
    timerRect = timerPaper.rect(7, START_TIMER_Y, 85, 20, 3);
    timerRect.attr('fill', "#fff");

    //Set up the monkeys
    chimpPaper = Raphael('chimpPaper', 120, 125);
    normalChimpImage = chimpPaper.image(k.image.normalChimp.src, 
				   0, 20, 100, 100);
    sadChimpImage = chimpPaper.image(k.image.sadChimp.src, 
				0, 20, 100, 100);
    happyChimpImage = chimpPaper.image(k.image.happyChimp.src, 
				  0, 20, 100, 100);
    happyChimpImage.hide();
    sadChimpImage.hide();

    


});

    


//end of ready
});