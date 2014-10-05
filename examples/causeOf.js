var wordNet = require("../src/index.js");
var util = require("util");

var wn = wordNet(null, true);

wn.fetchSynset("leak.v.1",function(err, synset){
	synset.causeOf(function(err, data){
		console.log(data)
	});
})
