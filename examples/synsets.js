var wordNet = require("../src/index.js");

var bank = new wordNet.Word("bank");

// using Promises
// get all synsets of bank which are nouns
bank.getSynsets("n").each(function(elem){
	console.log(elem);
});

// using classic node.js callbacks, retrieve
// only synsets for verbs
bank.getSynsets("v",function(err, data){
	data.forEach(function(elem){
		console.log(elem);
	})
});

