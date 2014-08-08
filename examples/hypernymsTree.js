var wn = require("../src/index.js");
var util = require("util");


// using Promises
wn.fetchSynset("bacteria.n.1", function(err, synset){
	synset.getHypernymTree(function(err, data){
		console.log(util.inspect(data, null, 3));
	});
});

