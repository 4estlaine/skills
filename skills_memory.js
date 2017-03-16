var goalColor = 'black';
var startColor = 'black';
var outlineColor = 'black';
var highlightColor = 'yellow';
var emptyColor = 'white';
var filledColor = 'yellow';
var textColor = 'black';
var blockTextColor = 'white'
var textFont = '18px Verdana';
var smallTextFont = '12px Verdana';
var arrowFont = '12px Verdana';
var blockFont = '18px Verdana';

var key0 = 37;  // Left arrow
var key1 = 38;  // Up arrow
var key2 = 39;  // Right arrow
var key3 = 40;  // Down Arrow

var enterKey = 13;
var spaceKey = 32;

var mem_size = 2;  // Skill memory
var mem_bank = new memoryBank(mem_size);

var blueLength = 3;
var redLength = 3;
var purpleLength = 2;
var greenLength = 3;
var orangeLength = 2;

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
var memBankWidth = 3*(blockSize + outlineWidth + highlightWidth);

var levelStarted = false;
var instructionPhase = 0;
var gameStarted = false;

var goalTopOffset = blockSeparation;
var curLevel;
var totalKeys = 0;
var keyBonus = 0
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
        this.canvas.width = 580;
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
    if (gameStarted) {
      if (!curLevel.complete) {
        frameNo++;
      }
      gameArea.clear();
      curLevel.draw();
      mem_bank.draw();
    }
}

function startGame() {
  SetColorMap();
  gameArea.start();
}

function gameOver() {
  gameArea.clear();
  levelStarted = false;
  gameStarted = false;
  send_data(user_data);
  $('#next').hide();
  $('#gameover').show();
  $('#head').hide();
  $('#instructions').hide();
  $('#hideinstructions').hide();
  $('#showinstructions').hide();
}

function gameComplete() {
  gameArea.clear();
  levelStarted = false;
  gameStarted = false;
  send_data(user_data);
  $('#next').hide();
  $('#gameover2').show();
  $('#head').hide();
  $('#instructions').hide();
  $('#hideinstructions').hide();
  $('#showinstructions').hide();
}

function keyDownHandler(e) {
  if (!gameStarted || curLevel.complete) {
    if (e.keyCode == enterKey) {
      nextLevel();
    }
  }
  if (gameStarted) {
    if (!curLevel.complete && isActionKey(e) && curLevel.begun && !mem_bank.active && (instructionPhase < 2 || instructionPhase > 5)) {
      totalKeys++;
      levelKeys++;
    }
  //  if (e.keyCode != 91 && e.keyCode != 16 && e.keyCode != 52) {
    if (!mem_bank.active) {
      curLevel.activeBlock.keyPress(e);
    } else {
      console.log('mem bank keypress');
      mem_bank.keyPress(e);
    }
  //  }
//    if (totalKeys <= 0) {
//      gameOver();
//    }
  }
}

function isActionKey(e) {
  if (e.keyCode == key0 || e.keyCode == key1 || e.keyCode == key2 || e.keyCode == key3) {
    return true;
  } else return false;
}


function nextLevel() {
  if (++activeLevel < levels.length) {
    if (activeLevel > 0) {
      levelStarted=  true;
      ++instructionPhase;
    }
    gameStarted = true;
    curLevel = new level(activeLevel);
    if (activeLevel == 1) {
      totalKeys = 0;
      mem_bank.clear();
    }
    levelKeys = 0;
//    totalKeys += keyBonus;
    frameNo = -1;
    $('#next').hide();
    $('#showinstructions').show();
    hideInstructions();
  } else {
    gameComplete();
  }
}

function level(level) {
  this.complete = false;
  this.begun = false;
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
    var needed_size = (this.startBlock.ypos + 4*blockSize);
    gameArea.canvas.height = needed_size;
    this.goalBlock.draw();
    for (var path = 0; path < this.paths.length; path++) {
      for (var block = 0; block < this.paths[path].length; block++) {
        this.paths[path][block].draw();
      }
      xout = this.paths[path][0].xpos + blockSize / 2;
      xin = (path - midOffset)*arrowOffset + (gameArea.canvas.width - memBankWidth) / 2;
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

function memoryBank(mem_capacity) {
  this.capacity = mem_capacity;
  this.active = false;
  this.queued_color = null;
  this.bank = ['green'];
  this.contains = function(color) {
    return (this.bank.indexOf(color) >= 0)
  }
  this.activate = function(color) {
    this.active = true;
    this.queued_color = color;
    if (this.bank.length < this.capacity) {
      this.bank.push(color);
      this.deactivate();
    }
  }
  this.deactivate = function() {
    this.active = false;
    this.queued_color = null;
  }
  this.update = function(color) {
    if (!this.contains(color)) {
      this.bank.push(color);
      if (this.bank.length > this.capacity) {
        this.bank.shift();
      }
    }
  }
  this.replace = function(new_color, old_color) {
    if (this.contains(old_color)) {
      this.bank[this.bank.indexOf(old_color)] = new_color;
    }
  }
  this.clear = function() {
    this.bank = [];
  }
  this.keyPress = function(e) {
    console.log('entering');
    console.log(this.active);
    console.log(this.queued_color);
    if (instructionPhase == 8) {
      if (e.keyCode == 49) {
          ++instructionPhase;
          this.replace(this.queued_color, this.bank[0]);
          this.deactivate();
      }
    } else {
    if (this.active && this.queued_color != null) {
      if (e.keyCode == enterKey) {
        this.deactivate();
        return;
      }
      num = e.keyCode - 49;
      if (num >= 0 && num < this.bank.length) {
        this.replace(this.queued_color, this.bank[num]);
        this.deactivate();
      }
    }
    }
  }
  this.draw = function() {
    if (gameStarted) {
        var ctx = gameArea.context;
        var y_offset = curLevel.startBlock.ypos - this.capacity*(blockSize+outlineWidth);
        var x_offset = gameArea.canvas.width - memBankWidth;
        var new_block_y_pos = y_offset + outlineWidth + (this.capacity-1)/2.0*(blockSize+outlineWidth);
        var new_block_x_pos = x_offset + 1.0/2.0*memBankWidth;
        if (this.active) {
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = highlightWidth;
            ctx.strokeRect(x_offset, y_offset, blockSize, this.capacity*(blockSize+outlineWidth));
            ctx.strokeRect(new_block_x_pos, new_block_y_pos, blockSize, blockSize);
            ctx.fillStyle = this.queued_color;
            ctx.fillRect(new_block_x_pos, new_block_y_pos, blockSize, blockSize);
            ctx.font = blockFont;
            ctx.fillStyle = blockTextColor;
            ctx.fillText(String(SequenceLength(this.queued_color)), new_block_x_pos + blockSize / 2 - 6, new_block_y_pos + blockSize / 2 + 5);
        }
        for (var index = 0, back = this.capacity-1; index < this.capacity; ++index, --back) {
          if (index < this.bank.length) {
            ctx.fillStyle = this.bank[index];
          } else {
            ctx.fillStyle = emptyColor;
          }
          var ypos = y_offset + outlineWidth + back*(blockSize+outlineWidth);
          ctx.fillRect(x_offset, ypos, blockSize, blockSize);
          ctx.strokeStyle = outlineColor;
          ctx.lineWidth = outlineWidth;
          ctx.strokeRect(x_offset, ypos, blockSize, blockSize);
          if (index < this.bank.length) {
            ctx.font = blockFont;
            ctx.fillStyle = blockTextColor;
            ctx.fillText(String(SequenceLength(this.bank[index])), x_offset + blockSize / 2 - 6, ypos + blockSize / 2 + 5);
          }
          if (this.active) {
            drawArrow(new_block_x_pos - arrowOffset, new_block_y_pos + 0.5*blockSize, x_offset+blockSize+arrowOffset, ypos + 0.5*blockSize);
            ctx.font = arrowFont;
            ctx.fillStyle = textColor;
            ctx.fillText(String(index+1), x_offset+1.25*blockSize+arrowOffset, ypos + 0.5*blockSize+3*smallOffset);
          }
        }

        if (instructionPhase <= 1 || instructionPhase == 6) {
          ctx.font = blockFont;
          ctx.fillStyle = textColor;
          ctx.fillText("MEMORY BANK",
                       x_offset, y_offset - 20);
        } else if (instructionPhase == 2) {
          ctx.font = blockFont;
          ctx.fillStyle = textColor;
          ctx.fillText("MEMORY BANK",
                       x_offset, y_offset - 20);
          ctx.font = smallTextFont
          ctx.fillStyle = textColor;
          ctx.fillText("This is the memory bank. As you",
                       x_offset, y_offset - 140);
          ctx.fillText("can see, by completing the blue ",
                       x_offset, y_offset - 125);
          ctx.fillText("sequence, you have saved it in",
                       x_offset, y_offset - 110);
          ctx.fillText("memory. Whenever the active block ",
                       x_offset, y_offset - 95);
          ctx.fillText("is saved in memory, you can press ",
                       x_offset, y_offset - 80);
          ctx.fillText("'enter' to autocomplete the skill.",
                       x_offset, y_offset - 65);
          ctx.fillText("Press 'enter' to try it out.",
                       x_offset, y_offset - 50);
        } else if (instructionPhase >= 3 && instructionPhase <= 5) {
          ctx.font = blockFont;
          ctx.fillStyle = textColor;
          ctx.fillText("MEMORY BANK",
                       x_offset, y_offset - 20);
          ctx.font = smallTextFont
          ctx.fillStyle = textColor;
          ctx.fillText("Sometimes you might start down ",
                       x_offset, y_offset - 140);
          ctx.fillText("a path, but wish to go back. ",
                       x_offset, y_offset - 125);
          ctx.fillText("You can press 'space' to ",
                       x_offset, y_offset - 110);
          ctx.fillText("retreat for no extra cost. ",
                       x_offset, y_offset - 95);
          ctx.fillText("Retreat all the way back to ",
                       x_offset, y_offset - 80);
          ctx.fillText("The start block to continue.",
                       x_offset, y_offset - 65);
        } else if (instructionPhase == 7) {
          ctx.font = blockFont;
          ctx.fillStyle = textColor;
          ctx.fillText("MEMORY BANK",
                       x_offset, y_offset - 20);
          ctx.font = smallTextFont
          ctx.fillStyle = textColor;
          ctx.fillText("The memory bank is full right  ",
                       x_offset, y_offset - 110);
          ctx.fillText("now. Complete the red sequence ",
                       x_offset, y_offset - 95);
          ctx.fillText("to see how to overwrite ",
                       x_offset, y_offset - 80);
          ctx.fillText("skills in memory.",
                       x_offset, y_offset - 65);
//          ctx.fillText("memory bank is full.",
//                       x_offset, y_offset - 50);
        } else if (instructionPhase == 8) {
          ctx.font = blockFont;
          ctx.fillStyle = textColor;
          ctx.fillText("MEMORY BANK",
                       x_offset, y_offset - 20);
          ctx.font = smallTextFont
          ctx.fillStyle = textColor;
          ctx.fillText("When full, you can choose",
                       x_offset, y_offset - 155);
          ctx.fillText("to replace an existing",
                       x_offset, y_offset - 140);
          ctx.fillText("memory slot by pressing",
                       x_offset, y_offset - 125);
          ctx.fillText("the number key associated",
                       x_offset, y_offset - 110);
          ctx.fillText("with it. Otherwise, press",
                       x_offset, y_offset - 95);
          ctx.fillText("'enter' to continue without",
                       x_offset, y_offset - 80);
          ctx.fillText("Overwriting. Press '1' to",
                       x_offset, y_offset - 65);
          ctx.fillText("continue.",
                       x_offset, y_offset - 50);
        } else if (instructionPhase == 9 || instructionPhase == 10) {
          ctx.font = blockFont;
          ctx.fillStyle = textColor;
          ctx.fillText("MEMORY BANK",
                       x_offset, y_offset - 20);
          ctx.font = smallTextFont
          ctx.fillStyle = textColor;
          ctx.fillText("Press 'enter' to complete",
                       x_offset, y_offset - 155);
          ctx.fillText("the level and begin the game!",
                       x_offset, y_offset - 140);
          ctx.fillText("One last note: You can begin",
                       x_offset, y_offset - 125);
          ctx.fillText("the next level by pressing",
                       x_offset, y_offset - 110);
          ctx.fillText("'enter'. Try and get the",
                       x_offset, y_offset - 95);
          ctx.fillText("lowest score you can!",
                       x_offset, y_offset - 80);
        } else if (this.active) {
          ctx.font = blockFont;
          ctx.fillStyle = textColor;
          ctx.fillText("MEMORY BANK",
                       x_offset, y_offset - 20);
          ctx.font = smallTextFont
          ctx.fillStyle = textColor;
          ctx.fillText("If you would like, press number key",
                       x_offset, y_offset - 95);
          ctx.fillText("corresponding to memory block you would",
                       x_offset, y_offset - 80);
          ctx.fillText("like to overwrite, or press 'enter' to",
                       x_offset, y_offset - 65);
          ctx.fillText("continue without overwriting.",
                       x_offset, y_offset - 50);

        } else if (this.bank.length < 1) {
          if (!curLevel.activeBlock.isStart) {
            ctx.font = blockFont;
            ctx.fillStyle = textColor;
            ctx.fillText("MEMORY BANK ",
                         x_offset, y_offset - 20);
            ctx.font = smallTextFont
            ctx.fillStyle = textColor;
            ctx.fillText("Reminder: Complete skill blocks to",
                         x_offset, y_offset - 65);
            ctx.fillText("add skills to memory bank. ",
                         x_offset, y_offset - 50);
          }

        } else {
          ctx.font = blockFont;
          ctx.fillStyle = textColor;
          ctx.fillText("MEMORY BANK",
                       x_offset, y_offset - 20);
          if (!curLevel.activeBlock.isStart) {
            ctx.font = smallTextFont
            ctx.fillStyle = textColor;
            ctx.fillText("Reminder: Press 'enter' to ",
                         x_offset, y_offset - 65);
            ctx.fillText("autocomplete skill from memory.",
                         x_offset, y_offset - 50);
          }
        }

     }
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
  this.xpos = (gameArea.canvas.width - memBankWidth) / 2 - blockSize / 2;
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
  this.isStart = false;
  this.hasSequence = true;
  this.width = blockSize;
  this.height = blockSize;
  this.xpos = channel;
  this.ypos = next.ypos + blockSeparation;
  this.color = color;
  this.next = next;
  this.prev = null;
  this.fSequence = GenerateRandomSequence(SequenceLength(color));
  this.bSequence = spaceKey;
  this.useSkillSequence = enterKey;
  this.state = [];

  this.setPrev = function(prev) {
    this.prev = prev;
  }

  this.keyPress = function(e) {
    if (instructionPhase == 1 || instructionPhase == 7) {
      if (e.keyCode == this.fSequence[this.state.length]) {
        this.accept(e.keyCode);
      } else {
        this.error();
      }
    } else if (instructionPhase == 2 || instructionPhase == 9) {
      if (e.keyCode == this.useSkillSequence && mem_bank.contains(this.color)) {
        numRemaining = SequenceLength(this.color) - this.state.length;
        totalKeys += numRemaining;
        levelKeys += numRemaining;
        this.exit(this.next);
      }
    } else if (instructionPhase >= 3 && instructionPhase <= 5) {
      if (e.keyCode == this.bSequence) {
        while (this.prev.color == 'skip') {
          this.prev = this.prev.prev;
        }
        this.exit(this.prev)
      }
    } else {
    if (e.keyCode == this.bSequence) {
      while (this.prev.color == 'skip') {
        this.prev = this.prev.prev;
      }
      this.exit(this.prev)
    } else if (e.keyCode == this.useSkillSequence && mem_bank.contains(this.color)) {
      numRemaining = SequenceLength(this.color) - this.state.length;
      totalKeys += numRemaining;
      levelKeys += numRemaining;
      this.exit(this.next);
    } else {
      if (e.keyCode == this.fSequence[this.state.length]) {
        this.accept(e.keyCode);
      } else {
        this.error();
      }
    }
    }
  }
  this.exit = function(next) {
    ++instructionPhase;
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
      }
      if (next.isStart) {
        curLevel.begun = false;
        chosen_paths.pop();
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
      if (!mem_bank.contains(this.color)) {
        mem_bank.activate(this.color);
      }
      this.exit(this.next);
    }
  }
  this.draw = function() {
    ctx = gameArea.context;
    if (this.active && !mem_bank.active) {
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
  this.isStart = true;
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
    path[0].setPrev(this);
    maxY = Math.max(maxY, path[0].ypos);
  }
  this.ypos = maxY + 2*blockSeparation;
  this.xpos = (gameArea.canvas.width - memBankWidth) / 2 - blockSize / 2;
  this.keyPress = function(e) {
    for (var index = 0; index < this.sequence.length; ++index) {
      if (e.keyCode == this.sequence[index]) {
        if (instructionPhase > 8 ||
            (instructionPhase == 0 && e.keyCode == 49) ||
            (instructionPhase == 6 && e.keyCode == 50)) {
            chosen_paths.push(index);
            user_data['chosen_paths'] = String(chosen_paths);
            this.exit(this.next[index]);
            return;
        }
      }
    }
  }
  this.exit = function(next) {
    ++instructionPhase;
    if (next == null) {
      return;
    } else {
      next.active = true;
      this.active = false;
      curLevel.activeBlock = next;
      curLevel.begun = true;
//      updateGameArea();
    }
  }

  this.draw = function() {
    ctx = gameArea.context;
    if (this.active && !mem_bank.active) {
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = highlightWidth;
      ctx.strokeRect(this.xpos, this.ypos, this.width, this.height);
      ctx.font = smallTextFont
      ctx.fillStyle = textColor;
      if (instructionPhase == 0) {
      ctx.fillText("The objective of this game is to complete a series of levels with as low of a score as possible.",
                   this.xpos - 140, this.ypos + this.height + highlightWidth + 10);
      ctx.fillText("To complete a level, you must traverse from the start block (highlighted in yellow) ",
                   this.xpos - 140, this.ypos + this.height + highlightWidth + 25);
      ctx.fillText("to the goal block (black block at top). To begin a level, press the number key corresponding",
                   this.xpos - 140, this.ypos + this.height + highlightWidth + 40);
      ctx.fillText("to the path you would like to take. For instructional purposes, press '1' this time.",
                   this.xpos - 140, this.ypos + this.height + highlightWidth + 55);
      } else if (instructionPhase == 6) {
        ctx.fillText("Press '2' to proceed down the second path this time.",
                     this.xpos - 140, this.ypos + this.height + highlightWidth + 10);
      } else {
        ctx.fillText("Reminder: Press number key associated with path you want to take.",
                     this.xpos - 140, this.ypos + this.height + highlightWidth + 10);
      }
//      ctx.fillText("For instructional purposes, press '1' to continue.",
//                   this.xpos - 130, this.ypos + this.height + highlightWidth + 70);




    }

    ctx.fillStyle = startColor;
    ctx.fillRect(this.xpos, this.ypos, this.width, this.height);
  }

}


function Meter() {
  this.draw = function() {
    if (!mem_bank.active) {
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
      if (instructionPhase == 1) {
        // Meter instructions
        ctx.font = smallTextFont
        ctx.fillStyle = textColor;
        ctx.fillText("This meter indicates",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset + 60);
        ctx.fillText("progress towards ",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset + 75);
        ctx.fillText("guessing the current ",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset + 90);
        ctx.fillText("sequence. Each correct",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset + 105);
        ctx.fillText("guess will fill one level",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset + 120);
        ctx.fillText("in the meter. Incorrect",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset + 135);
        ctx.fillText("guesses reset progress.",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset + 150);
        ctx.fillText("Each key pressed will",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset + 165);
        ctx.fillText("Increment your score by one.",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset + 180);
        ctx.fillText("Guess the sequence to continue.",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset + 195);
        drawArrow(outlineWidth + 20, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset + 40,
                  outlineWidth + 20, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset + 20);
        // SKill instructions
        ctx.font = smallTextFont
        ctx.fillStyle = textColor;
        ctx.fillText("The active skill block",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset - 200);
        ctx.fillText("is highlighted in yellow.",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset - 185);
        ctx.fillText("To progress, you must",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset - 170);
        ctx.fillText("guess a random ",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset - 155);
        ctx.fillText("sequence of arrow",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset - 140);
        ctx.fillText("keys. The length ",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset - 125);
        ctx.fillText("of the sequence",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset - 110);
        ctx.fillText("is indicated by ",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset - 95);
        ctx.fillText("the number in",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset - 80);
        ctx.fillText("the center of the ",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset - 65);
        ctx.fillText("skill block.",
                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset - 50);
//        ctx.fillText("progress, as seen below.",
//                     outlineWidth, outlineWidth + (curLevel.activeBlock.fSequence.length-1)*(meterBarHeight+1*outlineWidth) + offset - 35);
      }
    }
  }
}

function Score() {
  this.width = scoreWidth;
  this.height = scoreHeight;
  this.xpos = gameArea.canvas.width - memBankWidth - scoreWidth;
  this.ypos = 0 + scoreHeight;

  this.draw = function() {
    var text = "Score: " + totalKeys; //(Math.floor(frameNo/intervalRate) + totalKeys);
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
  blueSequence = GenerateRandomSequence(blueLength);
  purpleSequence = GenerateRandomSequence(purpleLength);
  redSequence = GenerateRandomSequence(redLength);
  greenSequence = GenerateRandomSequence(greenLength);
  orangeSequence = GenerateRandomSequence(orangeLength);
  user_data['blue_sequence'] = String(blueSequence);
  user_data['purple_sequence'] = String(purpleSequence);
  user_data['red_sequence'] = String(redSequence);
  user_data['green_sequence'] = String(greenSequence);
  user_data['orange_sequence'] = String(orangeSequence);
}

function GenerateRandomSequence(len) {
  sequence = [];
  for (var i = 0; i < len; ++i) {
    sequence.push(getRandomASDFInt());
  }
  return sequence;
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
