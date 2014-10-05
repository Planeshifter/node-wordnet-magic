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

var wordNet = require("../src/index.js");
var wn = wordNet(null, true);

var util = require("util");
var bark = new wn.Word("bark");

// get Holonyms:

/*
bark.getSynsets().then(function(synsetArray){
    console.log("We wish to retrieve the holonyms for the synset with the definition:");
    console.log(synsetArray[3].definition);
	synsetArray[3].getHolonyms().each(function(holonym){
		console.log(util.inspect(holonym));
		})
});
*/


// get Holonym for ship

wn.fetchSynset("ship.n.1", function(err, synset){
	//console.log(synset)
	synset.getHolonyms(null, function(err, data){ console.log(util.inspect(data, null, 3)); });
})


