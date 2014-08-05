var wordNet = require("../src/index.js");

var bank = new wordNet.Word("bank");

// using Promises
bank.getSynsets().then(function(synsetArray){
	console.log("The third synset definition is:");
	console.log(String(synsetArray[3]));
	console.log("The sample sentences are:");
	synsetArray[3].getExamples().each(function(data){
		wordNet.print(data);
	});
});