var wn = require("../src/index.js");
var util = require("util");
var dog = new wn.Word("dog");


/*
dog.getSynsets().then(function(synsetArray){
	synsetArray[0].getSisterTerms().each(function(sister){
		wn.print(sister);
		})
});
*/

wn.fetchSynset("bank.n.2", function(err, synset){
	synset.getSisterTerms(function(err, data){ console.log(data) });
})
