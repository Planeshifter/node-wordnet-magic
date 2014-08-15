var wn = require("../src/index.js");
var util = require("util");


// using Promises
wn.fetchSynset("king.n.10", function(err, synset){
	synset.getHypernymTree(function(err, data){
		// console.log(util.inspect(data, null, 3));
		// wn.print(data);
		console.log(JSON.stringify(data));
	});
});

