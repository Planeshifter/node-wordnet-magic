var wordNet = require("../src/index.js");

var white = new wordNet.Word("white");

white.getAntonyms().then(function(synsetArray){
	console.log(synsetArray);
});

var high = new wordNet.Word("high");
high.getAntonyms().then(function(antonymArray){
	console.log(antonymArray);
})