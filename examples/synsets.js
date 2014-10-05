var wordNet = require("../src/index.js");
var wn = wordNet(null, false);
var util = require("util");

var walk = new wn.Word("walk","v");

// using classic node.js callbacks, retrieve
// only synsets for verbs
walk.getSynsets(function(err, data){
	console.log(util.inspect(data, null, 3));
	wn.print(data)
});

var bank = new wn.Word("bank","n");

// using classic node.js callbacks, retrieve
// only synsets for nouns
bank.getSynsets(function(err, data){
	console.log(util.inspect(data, null, 3));
	wn.print(data)
});

