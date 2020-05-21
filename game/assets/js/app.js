$(document).ready(function(){

  // event listeners
  $("#wrongAnswerHighlight").hide()
  $("#youGotIt").hide()
  $("#circle").hide();
  $("#countdown").hide();
  $("#nextQuestionButton").hide();
  $("#roundupButton").hide();
  $("#doOverButton").hide();
  $("#start").on('click', trivia.countDown); // click the start button in index.html to start the game
  $(document).on('click', '.option', trivia.guessChecker); // click the option button to check answer
  $("#nextQuestionButton").on('click', trivia.guessResult);
  $("#doOverButton").on('click', trivia.doOver);
  $('#roundupButton').on('click', trivia.roundup);
})

/*------------responsive game screen design on different devices---------------*/

// resizing the phone screen to fit in all devices
// my phone has xSize = 700, ySize = 1011
var nonscaled_xSize = window.innerWidth - 20; // 800 originally
var nonscaled_ySize = window.innerHeight - 10; // 600 originally

// different orientation depends on the device we are using
if (nonscaled_xSize > nonscaled_ySize) {
	xSize = nonscaled_ySize / 3 * 2;
	ySize = nonscaled_ySize;
}

else if (nonscaled_ySize > 900) {
  xSize = nonscaled_xSize;
	ySize = nonscaled_ySize;
}

else {
	ySize = nonscaled_ySize*1.5;
	xSize = nonscaled_xSize*1.5;
}

// find the propoer factor to resize
xRatio = xSize / 960
yRatio = ySize / 1395
resizingFactor = Math.min(xRatio, yRatio)

var gameScreen = document.querySelector('#gameScreen');
gameScreen.style.setProperty('height', ySize + "px");
gameScreen.style.setProperty('width', xSize + "px");

// // set text size accordingly
// var questionNumber = document.querySelector('#questionNumber');
// questionNumberFont = parseInt(getComputedStyle(questionNumber).fontSize);
// questionNumber.style.setProperty('font-size', Math.round(questionNumberFont * resizingFactor) + "px");
//
// var question = document.querySelector('#question');
// questionFont = parseInt(getComputedStyle(question).fontSize);
// question.style.setProperty('font-size', Math.round(questionFont * resizingFactor) + "px");

// question.style.setProperty('font-size', parseInt(questionFont * resizingFactor) + "px");

/*-----------------------------game logic----------------------------------*/

var alphabet = {0:"A.", 1:"B.", 2:"C.", 3:"D."};

var trivia = {
  // trivia properties
  correct: 0,
  incorrect: 0,
  unanswered: 0,
  currentSet: 0,
  timer: 15,
  timerOn: false,
  timerId: '',

  // count down
  count_down_timer: 3,
  countDownID: '',

  // questions options and answers data
  questions: {
    q1: 'What is considered a good FICO credit score?',
    q2: 'What percentage of Americans do not have $400 in savings if faced with a personal emergency 🚨?',
    q3: 'Which option is NOT part of your credit report?',
    q4: 'Which two women have appeared on the U.S. $1 coin?',
    q5: 'Income does NOT impact your credit score, true or false?',
    q6: 'How many months of living costs should you have in your savings?'
  },
  options: {
    q1: ['Mid to high 500\'s', 'Mid to high 600\'s', 'Mid to high 700\'s'],
    q2: ['5 - 10%', '15 - 30%', '40 - 50%', '60 - 75%'],
    q3: ['Payment History', 'Length of credit history', 'Your race', 'Credit utilization'],
    q4: ['Susan B. Anthony & Sacagawea', 'Cardi B & Shakira', 'Amelia Earhart & Harriet Tubman', 'Michelle Obama & Oprah Winfrey'],
    q5: ['TRUE', 'FALSE'],
    q6: ['1 month', '4-6 months', '10-12 months'],
  },
  answers: {
    q1: 'C. Mid to high 700\'s',
    q2: 'C. 40 - 50%',
    q3: 'C. Your race',
    q4: 'A. Susan B. Anthony & Sacagawea',
    q5: 'A. TRUE',
    q6: 'B. 4-6 months'
  },
  // trivia methods
  // to implement the coutdown screen
  countDown: function(){
    $('#start').remove();
    $('#countdown').show();

    // $('#countdown-timer').text(trivia.count_down_timer);
    $('#countdown-time').text(trivia.count_down_timer);

    trivia.countDownID = setInterval(trivia.countDownTimerRunning, 1000);

  },

  countDownTimerRunning: function(){
    if(trivia.count_down_timer > 0){
      // $('#countdown-timer').text(trivia.count_down_timer);
      $('#countdown-time').text(trivia.count_down_timer);
      trivia.count_down_timer--;
    }
    else {
      trivia.startGame();
    }
  },


  // method to initialize game
  startGame: function(){
    // restarting game results
    trivia.currentSet = 0;
    trivia.correct = 0;
    trivia.incorrect = 0;
    trivia.unanswered = 0;
    trivia.questionNotChecked = true;
    trivia.doOverLife = 2;
    clearInterval(trivia.timerId);
    // clear cout down
    clearInterval(trivia.countDownID)

    $("wrongAnswerHighlight").hide();
    // hide the coutdown
    $('#countdown').hide();

    $('#title').hide();

    // show game section
    $('#game').show();

    //  empty last results
    $('#results').html('');

    // show timer
    $('#timer').text(trivia.timer);

    // remove start button
    $('#start').hide();

    $('#circle').show();

    $('#questionNumberDiv').show();

    // ask first question
    trivia.nextQuestion();

  },
  // method to loop through and display questions and options
  nextQuestion : function(){

    // set timer to 15 seconds each question
    trivia.timer = 15;
    $('#timer').removeClass('last-seconds');
    $('#timer').text(trivia.timer);
    $('#circle').show();

    $("#wrongAnswerHighlight").hide();
    $("#youGotIt").hide();

    trivia.questionNotChecked = true;

    // to prevent timer speed up
    if(!trivia.timerOn){
      trivia.timerId = setInterval(trivia.timerRunning, 1000);
    }

    // show current question number
    $('#questionNumber').text("Question " + (trivia.currentSet+1));

    // gets all the questions then indexes the current questions
    var questionContent = Object.values(trivia.questions)[trivia.currentSet];
    $('#question').text(questionContent);
    $('#question').show();

    // an array of all the user options for the current question
    var questionOptions = Object.values(trivia.options)[trivia.currentSet];

    // creates all the trivia guess options in the html
    $.each(questionOptions, function(index, key){
      // '<p>'+alphabet[index]+" "+ '</p> show capital letter
      $('#options').append($('<button class="option btn btn-info btn-lg">'+alphabet[index]+" "+key+'</button>'));
    })

  },
  // method to decrement counter and count unanswered if timer runs out
  timerRunning : function(){

    // if timer still has time left and there are still questions left to ask
    if(trivia.timer > -1 && trivia.currentSet < Object.keys(trivia.questions).length){
      $('#timer').text(trivia.timer);
      trivia.timer--;

        // doesn't work on red background
        // if(trivia.timer === 4){
        //   $('#timer').addClass('last-seconds');
        // }
    }
    // the time has run out and increment unanswered, run result
    else if(trivia.timer === -1){

      trivia.unanswered++;
      trivia.result = false;
      clearInterval(trivia.timerId);
      resultId = setTimeout(trivia.roundup, 2000);
      $('#results').text('Out of time! The answer was '+ Object.values(trivia.answers)[trivia.currentSet])
      // $('#results').html('<h3>Out of time! The answer was '+ Object.values(trivia.answers)[trivia.currentSet] +'</h3>');
    }

  },
  // method to evaluate the option clicked
  guessChecker : function() {
    if (trivia.questionNotChecked) {
      // timer ID for gameResult setTimeout
      // var resultId;
      trivia.questionNotChecked = false;

      // the answer to the current question being asked
      var currentAnswer = Object.values(trivia.answers)[trivia.currentSet];

      // if the text of the option picked matches the answer of the current question, increment correct
      if($(this).text() === currentAnswer){
        // turn button green for correct
        $(this).addClass('btn-success').removeClass('btn-info');

        trivia.correct++;
        clearInterval(trivia.timerId);

        $('#question').hide();
        $('#circle').hide();

        $("#youGotIt").show();
        // $('#results').text('You got it!');
        $('#results').hide();

        $('#nextQuestionButton').show();
      }
      // else the user picked the wrong option, increment incorrect
      else{
        // turn button clicked red for incorrect
        $(this).addClass('btn-danger').removeClass('btn-info');

        trivia.incorrect++;
        clearInterval(trivia.timerId);
        trivia.showExplanation();
      }
    }
  },

  // method to show explanation page and add a "next" button
  showExplanation : function(){
    clearInterval(trivia.timerId);

    // hide question, remaining time, and options when showing explanation
    $('#question').hide();
    $('#circle').hide();

    $('#roundupButton').show();
    $('#doOverButton').show();

    // comment out below for infinite wait time
    // resultId = setTimeout(trivia.guessResult, 5000);

    if (trivia.currentSet == 0) {
      // $('#results').html('<h2>Dang! Almost...</h2><h3> Credit scores usually range from 300 to 850, and anything above high 700\'s is considered good. </h3> ');
      $('#results').html('<h3> Credit scores usually range from 300 to 850, and anything above high 700\'s is considered good. </h3> ');
      // $('#results').text('Dang! Almost...<br>Credit scores usually range from 300 to 850, and anything above high 700\'s is considered good.');
    }
    else if (trivia.currentSet == 1) {
      // $('#results').html('<h2>Dang! Almost...</h2><h3> Research shows that roughly 4 in 10 Americans would struggle to cover a $400 emergency expense. </h3>');
      $('#results').html('<h3> Research shows that roughly 4 in 10 Americans would struggle to cover a $400 emergency expense. </h3>');
    }
    else if (trivia.currentSet == 2) {
      // $('#results').html('<h2>Dang! Almost...</h2><h3> It is illegal to use race, religion, national origin, sex and marital status to calculate a credit score. </h3>');
      $('#results').html('<h3> It is illegal to use race, religion, national origin, sex and marital status to calculate a credit score. </h3>');
    }
    else if (trivia.currentSet == 3) {
      // $('#results').html('<h2>Dang! Almost...</h2><h3> Susan B. Anthony and Sacagawea have appeared on the U.S. $1 coin. </h3>');
      $('#results').html('<h3> Susan B. Anthony and Sacagawea have appeared on the U.S. $1 coin. </h3>');
    }
    else if (trivia.currentSet == 4) {
      // $('#results').html('<h2>Dang! Almost...</h2><h3> Better luck next time! </h3>' + '<h3>The correct answer is '+ 'TRUE' + '</h3>');
      $('#results').html('<h3> Better luck next time! </h3>' + '<h3>The correct answer is '+ 'TRUE' + '</h3>');
    }
    else if (trivia.currentSet == 5) {
      // $('#results').html('<h2>Dang! Almost...</h2><h3> Most experts believe you should have enough money in your emergency fund to cover at least 3 to 6 months\' worth of living expenses. </h3>');
      $('#results').html('<h3> Most experts believe you should have enough money in your emergency fund to cover at least 3 to 6 months\' worth of living expenses. </h3>');
    }

    $('#results').show();
    $("#wrongAnswerHighlight").show();

    // if answered wrong multiple times, seem to call trivia.guessResult more than once
    // or trivia.guessResult is not destroyed completely before
    // $( "#nextQuestionButton" ).click(trivia.guessResult);

  },

  // method to remove previous question results and options
  guessResult : function(){
    $('#nextQuestionButton').hide();
    $('#roundupButton').hide();
    $('#doOverButton').hide();
    clearInterval(trivia.timerId);

    // increment to next question set
    trivia.currentSet++;

    // remove the options and results
    $('.option').remove();
    $('#results').hide();

    // if we have answered all questions
    if(trivia.currentSet === Object.keys(trivia.questions).length){
      trivia.roundup();
    }
    else {
      // begin next question
      trivia.nextQuestion();
    }

  },

  // method to remove previous question results and options
  doOver : function(){

    // decrement do over life
    trivia.doOverLife--;

    $('#nextQuestionButton').hide();
    $('#roundupButton').hide();
    $('#doOverButton').hide();
    clearInterval(trivia.timerId);

    // increment to next question set
    trivia.currentSet++;

    // remove the options and results
    $('.option').remove();
    $('#results').hide();

    // if we have answered all questions
    if(trivia.currentSet === Object.keys(trivia.questions).length){
      trivia.roundup();
    }
    else if (trivia.doOverLife == 0) {
      trivia.roundup();
    }
    else {
      // begin next question
      trivia.nextQuestion();
    }

  },

  // method to show the final result (aka roundup) screen
  roundup : function(){

    clearInterval(trivia.timerId);

    $('#circle').hide();

    $('#questionNumberDiv').hide();
    $("#youGotIt").hide();

    $('#nextQuestionButton').hide();
    $('#roundupButton').hide();
    $('#doOverButton').hide();
    $("#wrongAnswerHighlight").hide();

    $('#circle').hide();

    $('.option').remove();
    $('#results').remove();

    // adds results of game (correct, incorrect, unanswered) to the page
    $('#roundupDiv').html('<h3>Thank you for playing!</h3>'+
      '<p>Correct: '+ trivia.correct +'</p>'+
      '<p>Incorrect: '+ trivia.incorrect +'</p>'+
      // '<p>Unanswered: '+ trivia.unanswered +'</p>'+
      '<p>Please play again!</p>');

    // hide game section
    $('#game').hide();

    // show start button to begin a new game
    $('#start').show();
  }

}
