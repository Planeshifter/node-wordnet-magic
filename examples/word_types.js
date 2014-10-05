var wordNet = require("../src/index.js");
var wn = wordNet(null, true);

wn.isVerb("find").then(console.log);

wn.isVerb("kingdom", function(err, res){
	console.log(res);
});

wn.isVerb("kill", function(err, res){
	console.log(res);
});

wn.isNoun("tiger").then(console.log);

wn.isNoun("happy").then(console.log);

wn.isAdjective("filthy").then(console.log);

wn.isAdverb("helpfully").then(console.log);

wn.isNoun("callback", function(err, data){ console.log(data)});

wn.isNoun("promise").then(console.log);
