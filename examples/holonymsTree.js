/*
Source: http://en.wikipedia.org/wiki/Holonymy
Holonymy defines the relationship between a term denoting the whole and a term denoting a part of, 
or a member of, the whole. That is,

    'X' is a holonym of 'Y' if Ys are parts of Xs, or
    'X' is a holonym of 'Y' if Ys are members of Xs.
*/

/*
 Example:
 According to WordNet, 'bark' is a holonym of 'root', of 'trunk' and of 'branch.':
 */

var wn = require("../src/index.js");
var util = require("util");

// get Holonym tree for bark:
var bark = new wn.Word("bark");
bark.getSynsets().then(function(synsetArray){
    console.log("We wish to retrieve the holonyms for the synset with the definition:");
    console.log(synsetArray[0].definition);
	synsetArray[0].getHolonymsTree().each(function(holonym){
			console.log(util.inspect(holonym.holonymOf));
		})
});


//get Holonym tree for word

wn.fetchSynset("lock.n.1", function(err, synset){
	synset.getHolonymsTree(function(err, data){ 
      console.log(util.inspect(data, null, 1)); 
	  wn.print(data) 
      });
})

