var wordNet = require("../src/index.js");
var wn = wordNet(null, false);

var util = require("util");

var kiss = new wn.Word("kiss","v");

// using classic node.js callbacks, retrieve
// only synsets for verbs
kiss.getPolysemyCount("v", function(err, data){
	console.log(data);
});
