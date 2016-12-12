var blueSequence, redSequence, greenSequence, orangeSequence, purpleSequence;


var goalColor = 'black';
var startColor = 'black';
var outlineColor = 'black';
var highlightColor = 'yellow';
var emptyColor = 'white';
var filledColor = 'yellow';
var textColor = 'black';
var blockTextColor = 'white'
var textFont = '18px Verdana';
var arrowFont = '12px Verdana';
var blockFont = '18px Verdana';

var key0 = 37;  // Left arrow
var key1 = 38;  // Up arrow
var key2 = 39;  // Right arrow
var key3 = 40;  // Down Arrow

var blueLength = 3;
var redLength = 4;
var purpleLength = 4;
var greenLength = 5;
var orangeLength = 5;

var highlightWidth = 20;
var outlineWidth = 3;

var blockSize = 50;
var blockSeparation = 60;
var horizSeparation = 80;
var arrowOffset = 15;
var smallOffset = 2;
var meterBarWidth = 50;
var meterBarHeight = 15;
var scoreHeight = 55;
var scoreWidth = 120;
var intervalRate = 25;

var levelStarted = false;


var goalTopOffset = blockSeparation;
var curLevel;
var totalKeys = 85;
var keyBonus = 15
var levelKeys = 0;
var frameNo = -1;

var activeLevel = -1;

var levelObj = chooseLevelSet();
var levels = levelObj['levels'];
var levelSet = levelObj['set'];

var user_data = {
    "user_id": makeid(),
    "levels_set": levelSet,
    };

var level_scores = [];
var chosen_paths = [];

$('#replay').hide();
$('#gameover').hide();
$('#gameover2').hide();
$('#showinstructions').hide();
$('#hideinstructions').hide();

function makeid() {
    var d = new Date();
    var id = d.getTime();
    return id;
}

function showInstructions() {
  $('#instructions').show();
  $('#showinstructions').hide();
  $('#hideinstructions').show();
}

function hideInstructions() {
  $('#instructions').hide();
  $('#hideinstructions').hide();
  $('#showinstructions').show();
}

function send_data(serializedData) {
    // Fire off the request to /form.php
    request = $.ajax({
        url: "https://script.google.com/macros/s/AKfycbzzwaKvG2nFz8Kq-0-EqygaU9bh-kCUsJXSvpQ2s4b0T8Hj34w/exec",
        type: "post",
        data: serializedData
    });

    // Callback handler that will be called on success
    request.done(function (response, textStatus, jqXHR){
        // Log a message to the console
        console.log("Data successfully sent to doc!");
        console.log(response);
    });

    // Callback handler that will be called on failure
    request.fail(function (jqXHR, textStatus, errorThrown){
        // Log the error to the console
        console.error(
            "The following error occurred: "+
            textStatus, errorThrown
        );
    });
}

$('.button').on('mouseenter', function () {
    $(this).addClass('active');
});
$('.button').on('mouseleave', function () {
    $(this).removeClass('active');
});

var gameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 480;
        this.canvas.height = 800;
        this.context = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);
        document.addEventListener("keydown", keyDownHandler, false);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, intervalRate);
        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function updateGameArea() {
    if (levelStarted) {
      if (!curLevel.complete) {
        frameNo++;
      }
      gameArea.clear();
      curLevel.draw();
    }
}

function startGame() {
  SetColorMap();
  gameArea.start();
}

function gameOver() {
  gameArea.clear();
  levelStarted = false;
  send_data(user_data);
  $('#next').hide();
  $('#replay').hide();
  $('#gameover').show();
  $('#head').hide();
  $('#instructions').hide();
  $('#hideinstructions').hide();
  $('#showinstructions').hide();
}

function gameComplete() {
  gameArea.clear();
  levelStarted = false;
  send_data(user_data);
  $('#next').hide();
  $('#replay').hide();
  $('#gameover2').show();
  $('#head').hide();
  $('#instructions').hide();
  $('#hideinstructions').hide();
  $('#showinstructions').hide();
}

function keyDownHandler(e) {
  if (!curLevel.complete && isActionKey(e)) {
    totalKeys--;
    levelKeys++;
  }
  if (e.keyCode != 91 && e.keyCode != 16 && e.keyCode != 54) {
    curLevel.activeBlock.keyPress(e);
  }
  if (totalKeys <= 0) {
    gameOver();
  }
}

function isActionKey(e) {
  if (e.keyCode == key0 || e.keyCode == key1 || e.keyCode == key2 || e.keyCode == key3) {
    return true;
  } else return false;
}


function nextLevel() {
  if (++activeLevel < levels.length) {
    levelStarted = true;
    curLevel = new level(activeLevel);
    levelKeys = 0;
    totalKeys += keyBonus;
    frameNo = -1;
    $('#next').hide();
    $('#replay').hide();
    $('#showinstructions').show();
    hideInstructions();
  } else {
    gameComplete();
  }
}

function replayLevel() {
  levelStarted = true;
  curLevel = new level(activeLevel);
  frameNo = -1;
  $('#next').hide();
  $('#replay').hide();
}


function level(level) {
  this.complete = false;
  this.meter = new Meter();
  this.score = new Score();
  this.goalBlock = new GoalBlock();
  this.paths = generatePaths(levels[level], this.goalBlock);
  this.startBlock = new StartBlock(this.paths);
  this.activeBlock = this.startBlock;
  var xin, xout, y1a, y1b, y2a, y2b;
  this.draw = function() {
    var ctx = gameArea.context;
    var midOffset = (this.paths.length - 1) / 2.0;
    var needed_size = (this.startBlock.ypos + 2*blockSize);
    gameArea.canvas.height = needed_size;
    this.goalBlock.draw();
    for (var path = 0; path < this.paths.length; path++) {
      for (var block = 0; block < this.paths[path].length; block++) {
        this.paths[path][block].draw();
      }
      xout = this.paths[path][0].xpos + blockSize / 2;
      xin = (path - midOffset)*arrowOffset + gameArea.canvas.width / 2;
      y1a = this.startBlock.ypos - (blockSeparation - blockSize);
      y1b = this.startBlock.ypos - blockSeparation;
      y2a = this.goalBlock.ypos + blockSeparation + blockSize;
      y2b = this.goalBlock.ypos + blockSeparation;
      ctx.font = arrowFont;
      ctx.fillStyle = textColor;
      ctx.fillText(String(path+1), xout, y1b+3*smallOffset);

      drawArrow(xin, y1a, xout, y1b+5*smallOffset);
      drawArrow(xout, y2a, xin, y2b);
    }
    this.startBlock.draw();
    this.meter.draw();
    this.score.draw();
  }
}

function generatePaths(pathSpecs, goal) {
  var paths = [];
  var prev;
  var midOffset = (pathSpecs.length - 1) / 2.0;
  for (var index = 0; index < pathSpecs.length; index++) {
    var pathSpec = pathSpecs[index];
    var path = [];
    next = goal;
    for (var block = pathSpec.length-1; block >= 0; block--) {
      var element = new Block(pathSpec[block], next, (index - midOffset)*horizSeparation + goal.xpos);
      if (block == pathSpec.length-1) element.ypos += blockSeparation;
      if (block < pathSpec.length-1) {
        next.setPrev(element);
      }
      path.push(element);
      next = element;
    }
    path.reverse();
    paths.push(path);
  }
  return paths;
}

function drawArrow(fromx, fromy, tox, toy) {
    //variables to be used when creating the arrow
    var ctx = gameArea.context;
    var headlen = 10;
    var angle = Math.atan2(toy-fromy,tox-fromx);
    //starting path of the arrow from the start square to the end square and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = 3;
    ctx.stroke();
    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));
    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));
    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));
    //draws the paths created above
    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#cc0000";
    ctx.fill();
}

function GoalBlock() {
  this.active = false;
  this.hasSequence = false;
  this.isGoal = true;
  this.width = blockSize;
  this.height = blockSize;
  this.xpos = gameArea.canvas.width / 2 - blockSize / 2;
  this.ypos = goalTopOffset;
  this.state = [];
  this.draw = function() {
    ctx = gameArea.context;
    if (this.active) {
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = highlightWidth;
      ctx.strokeRect(this.xpos, this.ypos, this.width, this.height);
    }
    ctx.fillStyle = goalColor;
    ctx.fillRect(this.xpos, this.ypos, this.width, this.height);
  }
  this.keyPress = function(e) {
    return;
  }
}

function Block(color, next, channel) {
  this.active = false;
  this.isGoal = false;
  this.hasSequence = true;
  this.width = blockSize;
  this.height = blockSize;
  this.xpos = channel;
  this.ypos = next.ypos + blockSeparation;
  this.color = color;
  this.next = next;
  this.prev = null;
  this.fSequence = SequenceMap(color);
  this.bSequence = 32;
  this.state = [];

  this.setPrev = function(prev) {
    this.prev = prev;
  }

  this.keyPress = function(e) {
    if (e.keyCode == this.bSequence) {
      while (this.prev.color == 'skip') {
        this.prev = this.prev.prev;
      }
      this.exit(this.prev)
    } else {
      if (e.keyCode == this.fSequence[this.state.length]) {
        this.accept(e.keyCode);
      } else {
        this.error();
      }
    }
  }
  this.exit = function(next) {
    if (next == null) {
      return;
    } else {
      while (next.color == 'skip') {
        next = next.next;
      }
      next.active = true;
      if (next.isGoal) {
        level_scores.push(levelKeys);
        user_data['level_scores'] = String(level_scores);
//        user_data["level_"+String(activeLevel)+"_score"] = totalKeys;
//        user_data["level_"+String(activeLevel)+"_keys"] = levelKeys;
        send_data(user_data);
        curLevel.complete = true;
        document.getElementById('next').innerHTML = "Next Level";
        $('#next').show();
        //$('#replay').show();
      }
      this.active = false;
      this.state = [];
      curLevel.activeBlock = next;
    }
  }
  this.error = function() {
    this.state = [];
  }
  this.accept = function(e) {
    this.state.push(e);
    if (this.state.length == this.fSequence.length) {
      updateGameArea();
      this.exit(this.next);
    }
  }
  this.draw = function() {
    ctx = gameArea.context;
    if (this.active) {
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = highlightWidth;
      ctx.strokeRect(this.xpos, this.ypos, this.width, this.height)
    }
    if (this.color == 'skip') {
      drawArrow(this.xpos + blockSize/2, this.ypos+blockSize, this.xpos+blockSize/2, this.ypos);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.xpos, this.ypos, this.width, this.height);
      ctx.font = blockFont;
      ctx.fillStyle = blockTextColor;
      ctx.fillText(String(SequenceLength(this.color)), this.xpos + this.width / 2 - 6, this.ypos + this.height / 2 + 5);
    }
  }
  this.getState = function() {
    return this.state;
  }
}


function StartBlock(paths) {
  this.active = true;
  this.hasSequence = false;
  this.isGoal = false;
  this.width = blockSize;
  this.height = blockSize;
  this.next = [];
  this.sequence = [];
  this.state = [];
  var maxY = 0;
  var numKey = 49;
  for (var index = 0; index < paths.length; index++) {
    var path = paths[index];
    this.sequence.push(numKey++);
    this.next.push(path[0]);
    path[0].setPrev(this);  // Careful: this might be passing by value.
    maxY = Math.max(maxY, path[0].ypos);
  }
  this.ypos = maxY + 2*blockSeparation;
  this.xpos = gameArea.canvas.width / 2 - blockSize / 2;
  this.keyPress = function(e) {
    for (var index = 0; index < this.sequence.length; ++index) {
      if (e.keyCode == this.sequence[index]) {
        chosen_paths.push(index);
        user_data['chosen_paths'] = String(chosen_paths);
        this.exit(this.next[index]);
        return;
      }
    }
  }
  this.exit = function(next) {
    if (next == null) {
      return;
    } else {
      next.active = true;
      this.active = false;
      curLevel.activeBlock = next;
//      updateGameArea();
    }
  }

  this.draw = function() {
    ctx = gameArea.context;
    if (this.active) {
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = highlightWidth;
      ctx.strokeRect(this.xpos, this.ypos, this.width, this.height);
    }

    ctx.fillStyle = startColor;
    ctx.fillRect(this.xpos, this.ypos, this.width, this.height);
  }

}


function Meter() {
  this.draw = function() {
    ctx = gameArea.context;
    if (!curLevel.activeBlock.hasSequence) {
      return;
    }
    var state = curLevel.activeBlock.getState();
    var offset = curLevel.activeBlock.ypos;
    for (var index = 0, back = curLevel.activeBlock.fSequence.length-1; index < curLevel.activeBlock.fSequence.length; ++index, --back) {
      if (index < state.length) {
        ctx.fillStyle = curLevel.activeBlock.color;
      } else {
        ctx.fillStyle = emptyColor;
      }
      ctx.fillRect(outlineWidth, outlineWidth + back*(meterBarHeight+1*outlineWidth) + offset, meterBarWidth, meterBarHeight);
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = outlineWidth;
      ctx.strokeRect(outlineWidth,outlineWidth + back*(meterBarHeight+1*outlineWidth) + offset, meterBarWidth, meterBarHeight);
    }
  }
}

function Score() {
  this.width = scoreWidth;
  this.height = scoreHeight;
  this.xpos = gameArea.canvas.width - scoreWidth;
  this.ypos = 0 + scoreHeight;

  this.draw = function() {
    var text = "LIFE: " + totalKeys; //(Math.floor(frameNo/intervalRate) + totalKeys);
    ctx = gameArea.context;
    ctx.font = textFont;
    ctx.fillStyle = textColor;
    ctx.fillText(text, this.xpos, this.ypos);
  }
}

function SequenceMap(color) {
  if (color == 'blue') {
    return blueSequence;
  } else if (color == 'green') {
    return greenSequence;
  } else if (color == 'red') {
    return redSequence;
  } else if (color == 'purple') {
    return purpleSequence;
  } else if (color == 'orange') {
    return orangeSequence;
  } else return [];
}

function SequenceLength(color) {
  if (color == 'blue') {
    return blueLength;
  } else if (color == 'green') {
    return greenLength;
  } else if (color == 'red') {
    return redLength;
  } else if (color == 'purple') {
    return purpleLength;
  } else if (color == 'orange') {
    return orangeLength;
  } else return [];
}

function SetColorMap() {
  blueSequence = [];
  purpleSequence = [];
  redSequence = [];
  greenSequence = [];
  orangeSequence = [];
  for (var i = 0; i < blueLength; ++i) {
    blueSequence.push(getRandomASDFInt());
  }
  user_data['blue_sequence'] = String(blueSequence);
  for (var i = 0; i < purpleLength; ++i) {
    purpleSequence.push(getRandomASDFInt());
  }
  user_data['purple_sequence'] = String(purpleSequence);
  for (var i = 0; i < redLength; ++i) {
    redSequence.push(getRandomASDFInt());
  }
  user_data['red_sequence'] = String(redSequence);
  for (var i = 0; i < greenLength; ++i) {
    greenSequence.push(getRandomASDFInt());
  }
  user_data['green_sequence'] = String(greenSequence);
  for (var i = 0; i < orangeLength; ++i) {
    orangeSequence.push(getRandomASDFInt());
  }
  user_data['orange_sequence'] = String(orangeSequence);
}

function getRandomASDFInt() {
  var num = Math.floor(Math.random() * (4));
  if (num == 0) {
    return 37;  //65;
  } else if (num == 1) {
    return 38;  //83;
  } else if (num == 2) {
    return 39;  //68;
  } else {
    return 40;  //70;
  }
}
