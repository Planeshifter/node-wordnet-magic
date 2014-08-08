var wn = require("../src/index.js");
var util = require("util");

// get meronyms for finger

wn.fetchSynset("finger.n.1", function(err, synset){
	synset.getMeronyms("part",function(err, data){ console.log(util.inspect(data, null, 3))});
})

