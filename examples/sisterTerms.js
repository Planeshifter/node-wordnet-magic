var wordNet = require("../src/index.js");
var util = require("util");
var dog = new wordNet.Word("dog");

dog.getSynsets().then(function(synsetArray){
	synsetArray[0].getSisterTerms().each(function(sister){
		wordNet.print(sister);
		})
});
