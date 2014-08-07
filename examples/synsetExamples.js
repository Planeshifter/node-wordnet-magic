var wn = require("../src/index.js");

// using callbacks

wn.fetchSynset("bank.n.1", function(err, synset){
	console.log("The first synset definition is:")
	synset.getExamples(function(err, data){
		console.log(data)
	});
});

//using Promises
var bank = new wn.Word("bank");
bank.getSynsets().then(function(synsetArray){
	console.log("The fourth synset definition is:");
	console.log(String(synsetArray[3]));
	console.log("The sample sentences are:");
	synsetArray[3].getExamples().each(function(data){
		wn.print(data);
	});
});

