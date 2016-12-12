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
var levelB5 = [['blue', 'blue', 'blue', 'blue', 'blue', 'blue'],
               ['red', 'skip', 'skip', 'skip', 'skip', 'red']];
var levelB6 = [['blue', 'blue', 'skip', 'blue', 'blue'],
               ['green', 'skip', 'skip', 'skip', 'green'],
               ['red', 'red', 'skip', 'red', 'red']];

var levelSetB = [levelB0, levelB1, levelB2, levelB3, levelB4, levelB5, levelB6];


var levelC0 = [['blue', 'blue', 'blue'],];
var levelC1 = [['blue', 'blue', 'blue', 'blue', 'blue'],
               ['red', 'skip', 'skip', 'skip', 'red']];
var levelC2 = [['orange', 'skip', 'skip', 'skip', 'orange'],
               ['blue', 'blue', 'blue', 'blue', 'blue']];
var levelC3 = [['blue', 'blue', 'skip', 'blue', 'blue'],
               ['purple', 'purple', 'skip', 'skip', 'purple']];
var levelC3 = [['blue', 'blue', 'blue'],
               ['red', 'skip', 'red']];
var levelC4 = [['blue', 'blue', 'red', 'blue', 'blue'],
               ['blue', 'skip', 'orange', 'skip', 'blue']];
var levelC5 = [['purple', 'red', 'skip', 'red', 'purple'],
               ['orange', 'skip', 'blue', 'skip', 'orange']];
var levelC6 = [['blue', 'blue', 'blue', 'blue', 'blue'],
               ['red', 'skip', 'skip', 'skip', 'red']];

var levelSetC = [levelC0, levelC1, levelC2, levelC3, levelC4, levelC5, levelC6];


var levelD0 = [['blue', 'blue', 'blue'],];
var levelD1 = [['blue', 'blue', 'blue', 'blue', 'blue'],
               ['red', 'skip', 'skip', 'skip', 'red']];
var levelD2 = [['green', 'skip', 'skip', 'skip', 'skip', 'skip', 'green'],
               ['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue']];
var levelD3 = [['blue', 'blue', 'skip', 'blue', 'blue'],
               ['green', 'skip', 'green', 'skip', 'green']];
var levelD3 = [['blue', 'blue', 'blue', 'blue', 'blue'],
               ['red', 'skip', 'skip', 'skip', 'red']];
var levelD4 = [['red', 'blue', 'red', 'blue', 'red'],
               ['green', 'green', 'green', 'green', 'green']];
var levelD5 = [['red', 'blue', 'red', 'blue', 'red', 'blue', 'red', 'blue'],
               ['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green']];
var levelD6 = [['red', 'red', 'skip', 'red', 'skip', 'red', 'red'],
               ['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue'],
               ['green', 'green', 'skip', 'skip', 'skip', 'green', 'green']];

var levelSetD = [levelD0, levelD1, levelD2, levelD3, levelD4, levelD5, levelD6];

var levelSets = [levelSetA, levelSetB, levelSetC, levelSetD];

function chooseLevelSet() {
    var set = Math.floor(Math.random() * (levelSets.length));
    console.log(set);
    return {levels: levelSets[set], set: set};
}