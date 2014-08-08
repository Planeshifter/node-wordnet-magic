var wn = require("../src/index.js");
var util = require("util");

wn.fetchSynset("leak.v.1",function(err, synset){
	synset.causeOf(function(err, data){
		console.log(data)
	});
})