var wordNet = require("../src/index.js");
var util = require("util");
var king = new wordNet.Word("king");

// using Promises
king.getSynsets().then(function(synsetArray){
	synsetArray[0].getHypernymsTree().each(function(hypernym){
			wordNet.print(hypernym);
		})
});
