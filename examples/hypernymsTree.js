var wordNet = require("../src/index.js");
var wn = wordNet(null, false);

var util = require("util");


// using Promises
wn.fetchSynset("king.n.10", function(err, synset){
  console.time("argh")
	synset.getHypernymsTree(function(err, data){
		// console.log(util.inspect(data, null, 3));
		// wn.print(data)
    console.timeEnd("argh");
		console.log(JSON.stringify(data));
	});
});

/*
wn.fetchSynset("golf.n.1", function(err, synset){
	synset.getHypernymsTree(function(err, data){
		// console.log(util.inspect(data, null, 3));
	 wn.print(data);
	});
});
*/
