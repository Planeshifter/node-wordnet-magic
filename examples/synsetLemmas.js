var wordNet = require("../src/index.js");
var wn = wordNet(null, true);

var dog = new wn.Word("dog");

// using Promises
dog.getSynsets().then(function(synsetArray){
	console.log("The first synset definition is:");
	console.log(String(synsetArray[0]));
	console.log("Other words which share the same synset are:");
	synsetArray[0].getLemmas().then(function(word){
		console.log(word);
	});
});

wn.fetchSynset("dog.n.1", function(err, synset){
	synset.getLemmas(function(err, data){ console.log(data) });
})
