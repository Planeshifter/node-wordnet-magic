var wordNet = require("../src/index.js");
var util = require("util");

var kiss = new wordNet.Word("walk","v");

// using classic node.js callbacks, retrieve
// only synsets for verbs
kiss.getSynsets(function(err, data){
	// console.log(util.inspect(data, null, 3));
	wordNet.print(data)
});



