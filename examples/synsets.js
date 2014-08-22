var wordNet = require("../src/index.js");
var util = require("util");

var walk = new wordNet.Word("walk","v");

// using classic node.js callbacks, retrieve
// only synsets for verbs
walk.getSynsets(function(err, data){
	console.log(util.inspect(data, null, 3));
	wordNet.print(data)
});

var bank = new wordNet.Word("bank","n");

// using classic node.js callbacks, retrieve
// only synsets for nouns
bank.getSynsets(function(err, data){
	console.log(util.inspect(data, null, 3));
	wordNet.print(data)
});

