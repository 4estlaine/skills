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

var levelB0 = [['red', 'red', 'red'],];
var levelB1 = [['red', 'red', 'red', 'red', 'red', 'red'],
               ['blue', 'skip', 'skip', 'skip', 'skip', 'blue']];
var levelB2 = [['blue', 'blue', 'blue', 'blue', 'blue'],
               ['red', 'red', 'red', 'red', 'red'],
               ['orange', 'skip', 'skip', 'skip', 'orange']];
var levelB3 = [['orange', 'orange', 'blue', 'blue', 'blue'],
               ['red', 'red', 'red', 'red', 'red']];
var levelB3 = [['purple', 'purple', 'purple'],
               ['green', 'skip', 'green']];
var levelB4 = [['red', 'red', 'red', 'red', 'red', 'red'],
               ['blue', 'skip', 'skip', 'skip', 'skip', 'blue']];

var levelSetB = [levelB0, levelB1, levelB2, levelB3, levelB4];

var levelSets = [levelSetA, levelSetB];

function chooseLevelSet() {
    var set = Math.floor(Math.random() * (levelSets.length));
    console.log(set);
    return {levels: levelSets[set], set: set};
}