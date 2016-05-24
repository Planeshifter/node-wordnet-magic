'use strict';

function Word( str, pos ) {
	this.lemma = str;
	if ( pos ) {
		this.part_of_speech = pos;
	}
}


{
  constructor: wn.Word,
  getSynsets: function(callback){
	var self = this;
	var ret, query;

	self.part_of_speech = self.part_of_speech || null;

	function _findSynsetsArray(data){
		switch(self.part_of_speech){
		case null:
			if(!wn.preload){
				query = "SELECT s.synsetid AS synsetid, s.definition AS definition, s.pos AS pos, l.lexdomainname AS lexdomain FROM wordsXsensesXsynsets AS s LEFT JOIN lexdomains AS l ON l.lexdomainid = s.lexdomainid";
				query += " WHERE s.lemma = $lemma ORDER BY s.pos, s.sensenum";
				ret =  db.allAsync(query,{
					   $lemma: data,
					 });
			} else {
				ret = wn.WORDSxSENSESxSYNSETSxLEXDOMAINS.then(function(d){
					return d[data];
				});
			}
		break;
		default:
			if (!wn.preload){
				query = "SELECT s.synsetid AS synsetid, s.definition AS definition, s.pos AS pos, l.lexdomainname AS lexdomain FROM wordsXsensesXsynsets AS s LEFT JOIN lexdomains AS l ON l.lexdomainid = s.lexdomainid";
				query += " WHERE s.pos = $pos AND s.lemma = $lemma ORDER BY s.sensenum";
				ret =  db.allAsync(query, {
					$lemma: data,
					$pos: self.part_of_speech
				});
			} else {
				ret = wn.WORDSxSENSESxSYNSETSxLEXDOMAINS.then(function(d){
					var candidateSet = d[data];
					var res = [];
					for ( var i = 0; i < candidateSet.length; i++ ) {
						if ( candidateSet[i].pos === self.part_of_speech ) {
							res.push(candidateSet[i]);
						}
					}
					return res;
				});
			}
		}
		return ret;
	  }

	function _formSynsetsArray(data){
	  var SynsetArray = [];
		for (var i = 0; i < data.length; i++){
		  var obj =  _findSynsetDefFromId(data[i]);
		  SynsetArray.push(obj);
		}
		 return Promise.all(SynsetArray);
		 }

	var promise =  _findSynsetsArray(this.lemma).then(_formSynsetsArray).map(_appendLemmas).map(function(item){
	  return new wn.Synset(item);
	});
	return promise.nodeify(callback);
  },
  getAntonyms: function(callback){

	var self = this;
	self.part_of_speech = self.part_of_speech || null;
	var word = this.lemma;

	function _formAntonymsArray(synsetid){
	  var query = "SELECT sw.lemma AS lemma, dw.lemma AS antonym, sdefinition AS synset FROM sensesXlexlinksXsenses AS l ";
	  query += "LEFT JOIN words AS sw ON l.swordid = sw.wordid LEFT JOIN words AS dw ON l.dwordid = dw.wordid ";
	  query += "WHERE sw.lemma ='" + word + "' AND linkid=30 AND spos='a' ORDER BY ssensenum";
	  return db.allAsync(query);
	}

	function _findSynsetsArray(word){
	  return _findWordId(word).then(_findSynsetsFromId);
	}

	function _findWordId(str){
	  return db.eachAsync("SELECT wordid FROM words WHERE lemma = $str",{
		$str: str
	  });
	}

	function _findSynsetsFromId(data){
  var query, ret;
		switch(self.part_of_speech){
		case null:
			query = "SELECT synsetid FROM senses WHERE wordid = $wordid";
			ret =  db.allAsync(query,{
				   $wordid: data.wordid,
				 });
		break;
		default:
			 query = "SELECT senses.synsetid FROM senses INNER JOIN synsets ON synsets.synsetid = senses.synsetid";
				 query +=" WHERE wordid = $wordid AND pos = $pos";
			 ret =  db.allAsync(query,{
			   $wordid: data.wordid,
			   $pos: self.part_of_speech
			 });
		}
		return ret;
	  }

	function _formSynsetsArray(data){
		var SynsetArray = [];
		for (var i = 0; i < data.length; i++){
		  var obj =  _findSynsetDefFromId(data[i]);
		  SynsetArray.push(obj);
		}
	 return Promise.all(SynsetArray);
	 }

	 function _findSynsetDefFromId(data){
			var ret;
			if (!wn.preload){
			  var query = "SELECT ss.synsetid, ss.pos, ld.lexdomainname AS lexdomain, ss.definition";
			  query += " FROM synsets AS ss INNER JOIN lexdomains AS ld ON ld.lexdomainid = ss.lexdomainid";
			  query += " WHERE synsetid = $synsetid";
			  ret = db.eachAsync(query, {
				$synsetid: data.synsetid
			  });
			} else {
				ret = wn.SYNSETSxLEXDOMAINS.then(function(returnSet){
					return returnSet[data.synsetid];
				});
			}
			return ret;
	  }

	var promise =  _findSynsetsArray(this.lemma).then(_formAntonymsArray);
	return promise.nodeify(callback);
  },
  getPolysemyCount: function(pos, callback){
	  this.part_of_speech = pos;
	  var synsetArrayProm = this.getSynsets();
	  synsetArrayProm = synsetArrayProm.then(function(array){
		 var polysemy_count = array.length;
		 return polysemy_count;
	  });
	  return synsetArrayProm.nodeify(callback);
  },
};


// EXPORTS //

module.exports = Word;
