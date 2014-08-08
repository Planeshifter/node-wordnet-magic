var wn = require("../src/index.js");
var util = require("util");


// using Promises

/*
var king = new wn.Word("king");
king.getSynsets("n").then(function(synsetArray){
	console.log(synsetArray)
	synsetArray[0].getHypernym().each(function(hypernym){
			wn.print(hypernym);
		})
});
*/


wn.fetchSynset("king.n.10").then(function(synset){
	console.log(synset)
	synset.getHypernym().then(function(hypernym){
		console.log(util.inspect(hypernym, null, 3))
	});
})