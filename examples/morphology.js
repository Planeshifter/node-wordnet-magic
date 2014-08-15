var wordNet = require("../src/index.js");

// wordNet.morphy("scared","v").then(console.log);

var scare = new wordNet.Word("scared");

scare.getSynsets().then(wordNet.print)


/*
wordNet.morphy("better","a").then(console.log);

wordNet.morphy("denied","v").then(console.log);

wordNet.morphy("churches","n").then(console.log);

wordNet.morphy("structures","n").then(console.log);

wordNet.morphy("walking").then(console.log);

wordNet.morphy("taught","v").then(console.log);

wordNet.morphy("fruitful").then(console.log);

wordNet.morphy("loci", "n" , function(err, data){
	console.log(data);
})

wordNet.morphy("timed", null, function(err, data){
  console.log(data);
})

wordNet.morphy("kissed", "v", function(err, data){
	console.log(data);
})

wordNet.morphy("minions", "n", function(err, data){
	console.log(data);
})
*/