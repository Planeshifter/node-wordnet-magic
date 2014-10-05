var wordNet = require("../src/index.js");

var wn = wordNet(null, false);

console.log(wn instanceof wordNet)

var white = new wn.Word("white");

white.getAntonyms().then(function(synsetArray){
	console.log(synsetArray);
});

var high = new wn.Word("high");
high.getAntonyms().then(function(antonymArray){
	console.log(antonymArray);
})
