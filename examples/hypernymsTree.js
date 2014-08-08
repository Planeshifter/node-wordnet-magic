var wn = require("../src/index.js");
var util = require("util");


// using Promises
wn.fetchSynset("fish.n.1").then(function(synsetArray){
	synsetArray.getHypernymsTree().each(function(hypernym){
			wn.print(hypernym);
		})
});
