var wordNet = require("../src/index.js");

wordNet.isVerb("find").then(console.log);

wordNet.isVerb("kingdom", function(err, res){
	console.log(res);
});

wordNet.isVerb("kill", function(err, res){
	console.log(res);
});

wordNet.isNoun("tiger").then(console.log);

wordNet.isNoun("happy").then(console.log);

wordNet.isAdjective("filthy").then(console.log);

wordNet.isAdverb("helpfully").then(console.log);

wordNet.isNoun("callback", function(err, data){ console.log(data)});

wordNet.isNoun("promise").then(console.log);