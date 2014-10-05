var wordNet = require("../src/index.js");
var wn = wordNet(null, true);

var util = require("util");

wn.fetchSynset("american.n.3").then(function(synset){
	console.log(synset)
	synset.getHyponyms().then(function(hyponym){
		console.log(util.inspect(hyponym, null, 3))
	});
})
