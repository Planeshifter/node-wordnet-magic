var wordNet = require("../src/index.js");

var bank = new wordNet.Word("bank");

// using Promises
bank.getSynsets().each(function(elem){
	console.log(elem);
});

// using classic node.js callbacks
bank.getSynsets(function(err, data){
	data.forEach(function(elem){
		console.log(elem);
	})
});

