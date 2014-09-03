var wordNet = require("../src/index.js");
var wn = wordNet();

// wordNet.morphy("scared","v").then(console.log);

var scare = new wn.Word("scared");

scare.getSynsets().then(wn.print)


/*
wn.morphy("better","a").then(console.log);

wn.morphy("denied","v").then(console.log);

wn.morphy("churches","n").then(console.log);

wn.morphy("structures","n").then(console.log);

wn.morphy("walking").then(console.log);

wn.morphy("taught","v").then(console.log);

wn.morphy("fruitful").then(console.log);

wn.morphy("loci", "n" , function(err, data){
	console.log(data);
})

wn.morphy("timed", null, function(err, data){
  console.log(data);
})

wn.morphy("kissed", "v", function(err, data){
	console.log(data);
})

wn.morphy("minions", "n", function(err, data){
	console.log(data);
})
*/