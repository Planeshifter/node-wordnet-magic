var wn = require("../src/index.js");
var util = require("util");

wn.fetchSynset("canadian.n.1").then(function(synset){
	console.log(synset)
	synset.getHyponymsTree().then(function(hypernym){
		console.log(util.inspect(hypernym[0], null, 3))
	});
})