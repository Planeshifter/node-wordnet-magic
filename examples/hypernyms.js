var wordNet = require("../src/index.js");
var util = require("util");
var king = new wordNet.Word("king");

// using Promises
king.getSynsets("n").then(function(synsetArray){
	console.log(synsetArray)
	synsetArray[0].getHypernymsTree().each(function(hypernym){
			wordNet.print(hypernym);
		})
});
