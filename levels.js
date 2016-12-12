var levelA0 = [['blue', 'blue', 'blue'],];
var levelA1 = [['blue', 'blue', 'blue'],
              ['red', 'skip', 'red']];
var levelA2 = [['blue', 'blue', 'blue', 'blue', 'blue'],
              ['red', 'skip', 'skip', 'skip', 'red']];
var levelA3 = [['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue'],
              ['red', 'skip', 'skip', 'skip', 'skip', 'skip', 'skip', 'red']];
var levelA4 = [['purple', 'purple', 'purple'],
              ['green', 'skip', 'green']];
var levelA5 = [['blue', 'green', 'blue'],
              ['purple', 'red', 'red']];
var levelA6 = [['blue', 'blue', 'blue', 'blue'],
              ['red', 'red', 'skip', 'red']];
var levelA7 = [['orange', 'blue', 'blue'],
              ['orange', 'red', 'red']];
var levelA8 = [['green', 'green', 'purple'],
              ['purple', 'red', 'purple']];

var levelSetA = [levelA0, levelA1, levelA2, levelA3, levelA4, levelA5, levelA6, levelA7];

var levelSets = [levelSetA];

function chooseLevelSet() {
    var set = Math.floor(Math.random() * (levelSets.length));
    return {levels: levelSets[set], set: set};
}