var wordNet = require("../src/index.js");

wordNet.isVerb("find").then(console.log);

wordNet.isVerb("kingdom", function(err, res){
	console.log(res);
});

wordNet.isVerb("kill", function(err, res){
	console.log(res);
});

wordNet.isNoun("tiger").then(console.log);

wordNet.isNoun("filthy").then(console.log);

wordNet.isAdjective("filthy").then(console.log);

wordNet.isAdverb("helpfully").then(console.log)