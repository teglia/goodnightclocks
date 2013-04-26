var app = angular.module('clockApp', []);

app.directive('clock', function(){
  return {
    retrict: 'A',
    link: function(scope, elms, attr){

      /*
       * Reacts to the AM / PM buttons.
       *
       * Sets an active class on the buttons so they show state correctly.
       * Also, sets scope.ampm so other things can use that data.
       */ 
      scope.setAmpm = function (ampm) {
        if (ampm == 'AM') {
          scope.amBtnClass = 'active';
          scope.pmBtnClass = '';
          scope.ampm = ampm;
        } else {
          scope.pmBtnClass = 'active';
          scope.amBtnClass = '';
          scope.ampm = ampm;
        }
      }

      /*
       * Sets ctx, canvas, and clockRadius.
       *
       * Also calls out to calculate the degrees and calls the drawClock function.
       */ 
      scope.setClock = function(){
        // Because we are doing live rendering of clocks, need to ensure values.
        if (typeof scope.clockHour === 'undefined') { scope.clockHour = 1; }
        if (typeof scope.clockMinute === 'undefined') { scope.clockMinute = 0; }
        if (typeof scope.ampm === 'undefined') { scope.setAmpm('AM'); }

        scope.canvas = elms[0];
        scope.ctx = elms[0].getContext('2d');
        scope.clockRadius = 125;

        scope.clocks[scope.clock.digit].degrees = scope.calculateTotalDegrees();
        scope.drawClock();
      }

      /*
       * Calculates how many degrees for a time.
       */ 
      scope.calculateTotalDegrees = function() {
        var hour = scope.clockHour;
        var minute = scope.clockMinute;
        var ampm = scope.ampm;
        if (typeof ampm === 'undefined') {
          scope.setAmpm('AM');
        }
        var degrees = 0;

        // 12 is different, it's 0 for AM, and 12 for PM.
        if (hour == 12) {
          hour = 0;
        }
        if (ampm == "PM") {
          hour = hour + 12;
        }

        // 6 degrees per minute!
        degrees = (hour * 360) + (minute * 6);
        return degrees;
      }

      /*
       * Clear the canvas for each clock draw
       */
      scope.clear = function(){
        scope.canvas.width = scope.canvas.width;
      }

      /*
       * Draws a clock on the canvas.
       */ 
      scope.drawClock = function() {
        // Shorten these names so we can use someone elses clock code below.
        var hours = scope.clockHour;
        var minute = scope.clockMinute;
        var hour = hours + minute / 60;
        var ampm = scope.ampm;
        var clockRadius = scope.clockRadius;
        var ctx = scope.ctx;

        clockImage = new Image();
        clockImage.src="img/cface.png";

        scope.clear();
        ctx.save();
        ctx.drawImage(clockImage, 0, 0, clockRadius * 2, clockRadius * 2);
        ctx.translate((scope.canvas.width / 2) - 25, (scope.canvas.height / 2) - 25);
        ctx.beginPath();

        // Lot's of thanks to http://www.script-tutorials.com/html5-clocks/ for
        // clock code.

        // draw numbers 
        ctx.font = '16px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (var n = 1; n <= 12; n++) {
          var theta = (n - 3) * (Math.PI * 2) / 12;
          var x = clockRadius * 0.72 * Math.cos(theta);
          var y = clockRadius * 0.7 * Math.sin(theta);
          ctx.fillText(n, x, y);
        }
        ctx.fillText(ampm, 0, clockRadius / 3);

        // draw hour
        ctx.save();
        var theta = (hour - 3) * 2 * Math.PI / 12;
        ctx.rotate(theta);
        ctx.beginPath();
        ctx.moveTo(-15, -5);
        ctx.lineTo(-15, 5);
        ctx.lineTo(clockRadius * 0.5, 1);
        ctx.lineTo(clockRadius * 0.5, -1);
        ctx.fill();
        ctx.restore();

        // draw minute
        ctx.save();
        var theta = (minute - 15) * 2 * Math.PI / 60;
        ctx.rotate(theta);
        ctx.beginPath();
        ctx.moveTo(-15, -4);
        ctx.lineTo(-15, 4);
        ctx.lineTo(clockRadius * 0.8, 1);
        ctx.lineTo(clockRadius * 0.8, -1);
        ctx.fill();
        ctx.restore();
      }

      /*
       * Formats digital clock in HH:MM format
       *
       * If displaying the clock in digital format is desired, remove the 
       * 'hidden' attribute from the H1 in the index.html file.
       */
      scope.formatted = function(hourOrMinute) {
        if (hourOrMinute == null) {
          hourOrMinute = 1;
        }
        if (hourOrMinute < 10) {
          return '0' + hourOrMinute;
        }
        else {
          return hourOrMinute;
        }
      }

      scope.setClock();

    }
  }  
});


app.controller('MainCtrl', function($scope) {
  $scope.name = 'clock';
  
  /* 
   * Calculate the degree difference between clocks.
   *
   * Returns either an error message, or the degrees result sentence.
   */
  $scope.degrees = function() {
    var degreeOne = $scope.clocks[0].degrees;
    var degreeTwo = $scope.clocks[1].degrees;
    var degrees = degreeTwo - degreeOne;
    if (degreeOne > degreeTwo) {
      // 8640 is total amount of 24 rotations.
      degrees = 8640 + degrees;
    }
    if (isNaN(degrees) || isNaN(degreeOne) || isNaN(degreeTwo)) {
      $scope.degreeSymbol = '';
      return 'Please select times on both clocks above.'
    } else {
      $scope.degreeSymbol = '&#176;';
      return "Degrees of seperation between Clock 1 and Clock 2: " + (degrees + 0);
    }
  }
});