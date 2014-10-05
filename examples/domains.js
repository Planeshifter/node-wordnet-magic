var wordNet = require("../src/index.js");
var wn = wordNet(null, false);

var util = require("util");


wn.fetchSynset("war.n.1").then(function(synset){
	// console.log(synset)
	synset.getDomains().then(function(domain){
		console.log(util.inspect(domain, null, 3))
	});
})

/*
wn.fetchSynset("dance.v.2").then(function(synset){
	synset.getDomainTerms().then(function(domain){
		console.log(util.inspect(domain, null, 3))
	});
})
*/
