var wordNet = require("../src/index.js");
var wn = wordNet(null, true);
var util = require("util");

// get meronyms for finger

wn.fetchSynset("finger.n.1", function(err, synset){
	synset.getMeronyms("part",function(err, data){ console.log(util.inspect(data, null, 3))});
})

