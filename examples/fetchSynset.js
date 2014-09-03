var wordNet = require("../src/index.js");
var wn = wordNet();

var dog = wn.fetchSynset("dog.n.1");

dog.then(function(synset){
  console.log(synset);
});


wn.fetchSynset("dog.n.1", function(err, synset){
	synset.getExamples().each(function(data){
		wn.print(data);
	});
});
