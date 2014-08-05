var wordNet = require("../src/index.js");

var dog = new wordNet.Word("dog");

// using Promises
dog.getSynsets().then(function(synsetArray){
	console.log("The first synset definition is:");
	console.log(String(synsetArray[0]));
	console.log("Other words which share the same synset are:");
	synsetArray[0].getLemmas().then(function(word){
		console.log(word);
	});
});