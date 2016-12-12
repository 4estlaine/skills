var level0 = [['blue', 'blue', 'blue'],];
var level1 = [['blue', 'blue', 'blue'],
              ['red', 'skip', 'red']];
var level2 = [['blue', 'blue', 'blue', 'blue', 'blue'],
              ['red', 'skip', 'skip', 'skip', 'red']];
var level3 = [['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue'],
              ['red', 'skip', 'skip', 'skip', 'skip', 'skip', 'skip', 'red']];
var level4 = [['purple', 'purple', 'purple'],
              ['green', 'skip', 'green']];
var level5 = [['blue', 'green', 'blue'],
              ['purple', 'red', 'red']];
var level6 = [['blue', 'blue', 'blue', 'blue'],
              ['red', 'red', 'skip', 'red']];
var level7 = [['orange', 'blue', 'blue'],
              ['orange', 'red', 'red']];
var level8 = [['green', 'green', 'purple'],
              ['purple', 'red', 'purple']];



var levelSetA = [level0, level1, level2, level3, level4, level5, level6, level7];

var levelSets = [levelSetA];

function chooseLevelSet() {
    var set = Math.floor(Math.random() * (levelSets.length));
    return {levels: levelSets[set], set: set};
}