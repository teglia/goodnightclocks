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
       *
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

      scope.setClock = function(clockDigit){
        // The correct scope for either clock is already used without 'clockDigit'
        // however it is used below for storing the degrees with the clock object.
        scope.canvas = elms[0];
        scope.ctx = elms[0].getContext('2d');
        scope.clockRadius = 125;
        var clockData = scope;

        scope.clocks[clockDigit].degrees = scope.calculateTotalDegrees(clockData);
        scope.drawClock(clockData);
      }

      scope.calculateTotalDegrees = function(clockData) {
        var hour = clockData.clockHour;
        var minute = clockData.clockMinute;
        var ampm = clockData.ampm;
        var degrees = 0;

        if (hour == 12) {
          hour = 0;
        }
        if (ampm == "PM") {
          hour = hour + 12;
        }

        degrees = (hour * 360) + (minute * 6);
        return degrees;
      }

      scope.clear = function(){
        scope.ctx.save();
        scope.ctx.setTransform(1, 0, 0, 1, 0, 0);
        scope.ctx.clearRect(0, 0, scope.canvas.width, scope.canvas.height);
        scope.ctx.restore();
        scope.canvas.width = scope.canvas.width;
      }

      scope.drawClock = function(clockData) {
        var hours = clockData.clockHour;
        if (typeof hours === 'undefined') { hours = 1; }
        var minute = clockData.clockMinute;
        if (typeof minute === 'undefined') { minute = 0; }
        var hour = hours + minute / 60;
        var ampm = clockData.ampm;
        if (typeof ampm === 'undefined') { ampm = 'AM'; }
        var clockRadius = scope.clockRadius;
        var ctx = scope.ctx;

        clockImage = new Image();
        clockImage.src="cface.png";

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

    }
  }  
});


app.controller('MainCtrl', function($scope) {
  $scope.name = 'clock';
  $scope.ampmOne = 'AM';
  $scope.ampmTwo = 'PM';
  $scope.degrees = function() {
    var degreeOne = $scope.clocks[0].degrees;
    var degreeTwo = $scope.clocks[1].degrees;
    var degrees = degreeTwo - degreeOne;
    // 8640 is 24 rotations
    // 6 degrees per minute
    if (degreeOne > degreeTwo) {
      degrees = 8640 + degrees;
    }
    return "Degrees of seperation between Clock 1 and Clock 2: " + (degrees + 0);
  }
});