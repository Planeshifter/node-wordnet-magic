var wn = require("../src/index.js");
var util = require("util");

wn.fetchSynset("bacteria.n.2",function(err, synset){
	console.log(synset)
	synset.causeOf(function(err, data){
		console.log(data)
	});
})