var assert = require("assert");
var wordNet = require('../src/index.js')();

describe('wordNet', function () {
	  describe('Word', function () {
		  var word;
		  it('creates a new word', function (done) {
			  word = new wordNet.Word("king");
			  assert(word instanceof wordNet.Word);
			  done();
		      });  
		     
	  });
	  describe('Synset', function(){
		 var synsetProm =  new wordNet.Word("bank").getSynsets();
		 synsetProm.then(function(data){
			 it('retrieves synsets for specific word',function(done){
					var firstSynset = data[0];
					assert(firstSynset instanceof wordNet.Synset);
				 });
		 });
	
	  });
}); 
