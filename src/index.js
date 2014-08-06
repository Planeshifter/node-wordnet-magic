var sqlite3 = require('sqlite3').verbose();
var util = require('util');
var Promise = require('bluebird');
var join = Promise.join;
var _ = require('underscore');
var fs = require('fs');

// initialize standard path
var file = '../data/sqlite-31.db';
var db;
var exists = fs.existsSync(file);
if (exists){ 
  db = Promise.promisifyAll(new sqlite3.Database(file));
} else {
	if("Couldn't find file 'sqlite-31.db' in data subdirectory. " +
			"Please supply the correct path by using .registerDatabase(path), otherwise " +
			"the module does not work.");
}

// extend prototype objects

// String
if (!String.prototype.hasOwnProperty("repeat")){
  String.prototype.repeat = function(num){
    return new Array( num + 1 ).join( this );
  }
}

if (!String.prototype.hasOwnProperty("endsWith")){
  String.prototype.endsWith = function(str){
    var myRegExp = new RegExp(str + "$"); 
    return myRegExp.test(this);
  }
}


// Array
if (!Array.prototype.hasOwnProperty("pick")){
	Array.prototype.pick = function(name){
		return this.map(function(elem){
			return elem[name];
		});
	}
}

if (!Array.prototype.hasOwnProperty("contains")){
	Array.prototype.contains = function(elem){
		for (var q = 0; q < this.length; q++){
	      if (elem == this[q]) {
	        return true;
	      }
	    }
		return false;	
	}
}

// wordNet package namespace

var wn = {};

wn.registerDatabase = function(path){
	db = Promise.promisifyAll(new sqlite3.Database(path));
}

wn.MORPHY_SUBSTITUTIONS = {
		  NOUN:
	      [{ suffix: 's', ending: ''},
	       { suffix: 'ses', ending: 's'},  
	       { suffix: 'ves', ending: 'f'},
		   { suffix: 'xes', ending: 'x'},  
		   { suffix: 'zes', ending: 'z'},  
		   { suffix: 'ches', ending: 'ch'},
		   { suffix: 'shes', ending: 'sh'},
		   { suffix: 'men', ending: 'man'}, 
		   { suffix: 'ies', ending: 'y'}],
		  VERB:
	      [{ suffix: 's', ending: ''},
	       { suffix: 'ies', ending: 'y'},
	       { suffix: 'es', ending: 'e'}, 
	       { suffix: 'es', ending: ''},
	       { suffix: 'ed', ending: 'e'}, 
	       { suffix: 'ed', ending: ''},  
	       { suffix: 'ing', ending: 'e'},
	       { suffix: 'ing', ending: ''}],  
		  ADJECTIVE:
	      [{ suffix: 'er', ending: ''},
	       { suffix: 'est', ending: ''}, 
	       { suffix: 'er', ending: 'e'}, 
	       { suffix: 'est', ending: 'e'}]
		};


wn.morphy = function(input_str, pos, callback){
	return wn.morphyPromise(input_str, pos).nodeify(callback);
}

wn.morphyPromise = function(input_str, pos){
	
	if(!pos){
	  var arr = ["n","v","a","r","s"];
	  var resArray = [];
	  for (var i = 0; i <= 4; i++){
	    resArray.push(wn.morphyPromise(input_str, arr[i]));
	} 
	return Promise.all(resArray).then(function(data){
	  var reducedArray = [];
	  for (var i = 0; i < data.length; i++){
		  var current = data[i];
		  reducedArray.push(current);
	  }
	  return _.flatten(reducedArray);
	})
	}

	var substitutions;
	switch(pos){
	  case "n":
	    substitutions = _.clone(wn.MORPHY_SUBSTITUTIONS.NOUN);
	  break;
	  case "v":
	    substitutions = _.clone(wn.MORPHY_SUBSTITUTIONS.VERB);
	  break;
	  case "a":
	    substitutions = _.clone(wn.MORPHY_SUBSTITUTIONS.ADJECTIVE);
	  break;
	  default:
	    substitutions = [];
	}
	
	if (!wn.DICTIONARY){
	  var query = "SELECT DISTINCT ws.lemma AS lemma, syn.pos AS pos FROM words AS ws LEFT JOIN senses AS sen ON ws.wordid = sen.wordid LEFT JOIN ";
	  query += "synsets AS syn ON sen.synsetid = syn.synsetid"
	  wn.DICTIONARY = db.allAsync(query).map(function(elem){
		    var obj = {};
		    obj.lemma = elem.lemma;
		    obj.pos = elem.pos;
			return obj;
		});
	}
	
	if (!wn.EXCEPTIONS){
	  var query2 = "SELECT lemma, morph, pos FROM morphology";
	  wn.EXCEPTIONS = db.allAsync(query2);
	}
	
	var wordsPromise = Promise.join(wn.DICTIONARY, wn.EXCEPTIONS, function(dictionary, exceptions){
		
		function rulesOfDetachment(word, substitutions){
		  var result = [];

		  dictionary.filter(function(elem){
			  return elem.lemma === word;
		  }).forEach(function(elem){
			if (elem.pos === pos){
			  var obj = new wn.Word(elem.lemma);			    
			  obj.part_of_speech = elem.pos;
		      result.push(obj);
			}  
		  })
		 	  
		  for (var i = 0; i < substitutions.length; i++){
			  
			  var suffix = substitutions[i].suffix;
			  var new_ending = substitutions[i].ending;
			  
			  if (word.endsWith(suffix) === true){
				  var new_word = word.substring(0, word.length - suffix.length) + new_ending;
				  substitutions.splice(i,1);
				  if (new_word.endsWith("e") && !word.endsWith("e")){
				    substitutions.push({suffix: 'e', ending:''});
				  }
				  var recResult = rulesOfDetachment(new_word, substitutions);
				  Array.isArray(recResult) ? result = result.concat(recResult) : result.push(recResult);
			  }
		  }
		  return result;
		}
	
	var found_exceptions = [];
	var exception_morphs = exceptions.map(function(elem){
		return elem.morph;
	})

	
	var index = exception_morphs.indexOf(input_str);
	while(index !== -1){
		if(exceptions[index].pos === pos){
			var base_word = new wn.Word(exceptions[index].lemma);
			base_word.part_of_speech = pos;
			found_exceptions.push(base_word);
		}
		
	var index = exception_morphs.indexOf(input_str, index + 1);
	}
	
	if (found_exceptions.length > 0){
	  return found_exceptions;
	}
	else {
	  if(pos === "n" && input_str.endsWith("ful")){
		  suffix = "ful";
		  input_str = input_str.slice(0, input_str.length - suffix.length);
	  } else {
		  suffix = "";
	  }
	  return rulesOfDetachment(input_str, substitutions);
	}
	});
    return wordsPromise;
};

wn.isVerb = function(str, callback){
	var word = wn.morphyPromise(str);
	var res = word.then(function(data){
      var posArray = data.pick("part_of_speech");
	  return posArray.contains("v");
	});
	return res.nodeify(callback);
};

wn.isNoun = function(str, callback){
	var word = wn.morphyPromise(str);
	var res = word.then(function(data){
      var posArray = data.pick("part_of_speech");
	  return posArray.contains("n");
	});
	return res.nodeify(callback);
};

wn.isAdjective = function(str, callback){
	var word = wn.morphyPromise(str);
	var res = word.then(function(data){
		console.log(data)
      var posArray = data.pick("part_of_speech");
	  return posArray.contains("a") || posArray.cotains("s");
	});
	return res.nodeify(callback);
};

wn.isAdverb = function(str, callback){
	var word = wn.morphyPromise(str);
	var res = word.then(function(data){
      var posArray = data.pick("part_of_speech");
	  return posArray.contains("r");
	});
	return res.nodeify(callback);
};

wn.Word = function(str){
  this.lemma = str;
  this.part_of_speech = null;
};

wn.Word.prototype = {
  constructor: wn.Word,
  getSynsets: function(pos, callback){
	var self = this;
	self.part_of_speech = pos || self.part_of_speech; 
	
	function _findSynsetsArray(word){
	  return _findWordId(word).then(_findSynsetsFromId);
	}
	
	function _findWordId(str){	
	  return db.eachAsync("SELECT wordid FROM words WHERE lemma = $str",{
	    $str: str
	  });
	}
	
	function _findSynsetsFromId(data){
		switch(self.part_of_speech){
		case null:
			var query = "SELECT synsetid FROM senses WHERE wordid = $wordid";
			var ret =  db.allAsync(query,{
				   $wordid: data.wordid,
				 });
		break;
		default: 
		     var query = "SELECT senses.synsetid FROM senses INNER JOIN synsets ON synsets.synsetid = senses.synsetid";
			 query +=" WHERE wordid = $wordid AND pos = $pos";  
		     var ret =  db.allAsync(query,{
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
		};
	 return Promise.all(SynsetArray);
	 }
	
	 function _findSynsetDefFromId(data){
       var query = "SELECT ss.synsetid, ss.pos, ld.lexdomainname AS lexdomain, ss.definition";
	   query += " FROM synsets AS ss INNER JOIN lexdomains AS ld ON ld.lexdomainid = ss.lexdomainid"; 
	   query += " WHERE synsetid = $synsetid";
	   return db.eachAsync(query, {
		 $synsetid: data.synsetid
	   });
	  }
	 
    var promise =  _findSynsetsArray(this.lemma).then(_formSynsetsArray).map(_appendLemmas).map(function(item){
      return new wn.Synset(item);
    });
    return promise.nodeify(callback);
  },
  getAntonyms: function(pos, callback){
	  
	var self = this;
	self.part_of_speech = pos || self.part_of_speech;
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
		switch(self.part_of_speech){
		case null:
			var query = "SELECT synsetid FROM senses WHERE wordid = $wordid";
			var ret =  db.allAsync(query,{
				   $wordid: data.wordid,
				 });
		break;
		default: 
		     var query = "SELECT senses.synsetid FROM senses INNER JOIN synsets ON synsets.synsetid = senses.synsetid";
			 query +=" WHERE wordid = $wordid AND pos = $pos";  
		     var ret =  db.allAsync(query,{
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
		};
	 return Promise.all(SynsetArray);
	 }
	
	 function _findSynsetDefFromId(data){
       var query = "SELECT ss.synsetid, ss.pos, ld.lexdomainname AS lexdomain, ss.definition";
	   query += " FROM synsets AS ss INNER JOIN lexdomains AS ld ON ld.lexdomainid = ss.lexdomainid"; 
	   query += " WHERE synsetid = $synsetid";
	   return db.eachAsync(query, {
		 $synsetid: data.synsetid
	   });
	  }
    var promise =  _findSynsetsArray(this.lemma).then(_formAntonymsArray);
    return promise.nodeify(callback);
  },
};

// Synset Class
wn.Synset = function(obj){
  this.synsetid = obj.synsetid;
  this.words = obj.words;
  this.definition = obj.definition;
  this.pos = obj.pos;
  this.lexdomain = obj.lexdomain;
  
  if(obj.hypernym){
    this.hypernym = obj.hypernym;
  }
  
  if(obj.hyponym){
	  this.hyponym = obj.hyponym;
  }
  
};

wn.Synset.prototype = {
		  constructor: wn.Synset,
		  getExamples: function(callback){
			  var promise = _findSamplesArray(this.synsetid).map(function(item){
				return new wn.Example(item);  
			  });
			  return promise.nodeify(callback);
		  },
		  getLemmas: function(callback){
			var promise = _findLemmasArray(this.synsetid).map(function(item){
				return new wn.Word(item.lemma);
			})  
			return promise.nodeify(callback);
		  },
		  getHypernyms: function(callback){
			  var promise = _findHypernymsArray(this.synsetid).map(_appendLemmas).map(function(item){
				   return new wn.Synset(item);
			  });
			  return promise.nodeify(callback);			  
		  },
		  getHypernymsTree: function(callback){
			function getHypernymFromId(input){
				return _findHypernymsArray(input).map(_appendLemmas).map(function(item){
					item.hypernym = getHypernymFromId(item.synsetid);
					return Promise.props(item);
				}).map(function(item){
					var obj = new wn.Synset(item);
					return obj;
				});	
			}  
			var promise = getHypernymFromId(this.synsetid);
			return promise.nodeify(callback);
		  },
		  getHyponyms: function(callback){
			  function getHyponymsFromId(input){
					return _findHyponymsArray(input).map(_appendLemmas).map(function(item){
						item.sister_term = getHyponymsFromId(item.synsetid);
						return Promise.props(item);
					}).map(function(item){
						var obj = new wn.Synset(item);
						return obj;
					});	
				}  
				var promise = getHyponymsFromId(this.synsetid);
				return promise.nodeify(callback);
		  },
		  getHyponymsTree: function(callback){
			  function getHyponymsFromId(input){
				  return _findHyponymsArray(input).map(_appendLemmas).map(function(item){
					  item.hyponym = getHyponymsFromId(item.synsetid);
				  }).map(function(item){
					 var obj = new wn.Synset(item);
					 return obj;
				  });
			  }
			  var promise = getHyponymsFromId(this.synsetid);
			  return promise.nodeify(callback);
		  },
		  getHolonyms: function(callback){
			  var promise = _findHolonymsArray(this.synsetid).map(_appendLemmas).map(function(item){
				  return new wn.Synset(item);
			  });
			  return promise.nodeify(callback);
		  },
		  getHolonymsTree: function(callback){
			  var counter = 0;
			  function getHolonymFromId(input){
				  return _findHolonymsArray(input).map(_appendLemmas).map(function(item){
					  var obj = new wn.Synset(item);
					  if (counter < 20)
					  {
					  obj.holonymOf = getHolonymFromId(obj.synsetid);
					  counter++;
					  }
					  return Promise.props(obj);
				  });
			  };
              var promise = getHolonymFromId(this.synsetid);
			  return promise.nodeify(callback);
		  },
		  getSisterTerms: function(callback){
			  var promise = _findSisterTermsArray(this.synsetid).map(_appendLemmas).map(function(item){
				  return new wn.Synset(item);
			  });
			  return promise.nodeify(callback);
		  },
		  causeOf: function(callback){
			  var promise = _findCauseOfArray(this.synsetid).map(_appendLemmas).map(function(item){
				  return new wn.Synset(item);
			  });
			  return promise.nodeify(callback);
		  },
		  toString: function(){
			  return this.definition;
		  },
		};

// Example Class
wn.Example = function(obj){
	this.synsetid = obj.synsetid;
	this.sampleid = obj.sampleid;
	this.sample = obj.sample;
}

wn.Example.prototype = {
		constructor: wn.Example,
		toString: function(){
			return this.sample;
		}
}

wn.print = function(obj){
	switch(obj.constructor){
	case wn.Synset:
		function getSynsetString(input, depth){
		  var current_depth = depth + 1;
		  var words;
		  if(Array.isArray(input.words)){
		    words = input.words.map(function(item){
		  	  return item.lemma;
		    })
		  } else {
			  words = Array(input.lemma);
		  }
		  var str = "S: (" + input.pos + ") ";
		  str += words.join(", ");
		  str += " (" + input.definition + ")";
		  if(input.hypernym)
			  {
			  if(Array.isArray(input.hypernym)){
			    input.hypernym.forEach(function(elem){
				  var space = String(" ");
				  var times = current_depth * 4;
				  var spaces = space.repeat(times);
		          str += "\n" + spaces + getSynsetString(elem, current_depth);
			    });
			  } else{
			    str += "  " + getSynsetString(input.hypernym, current_depth);  
			    }
			  }
		  if(input.holonym)
		  {
		    if(Array.isArray(input.holonym)){
			    input.holonym.forEach(function(elem){
				  var space = String(" ");
				  var times = current_depth * 4;
				  var spaces = space.repeat(times);
		          str += "\n" + spaces + getSynsetString(elem, current_depth);
			    });
		  } else {
			     str += "  " + getSynsetString(input.hypernym, current_depth);  
			     }
	      }
		  if(input.hyponym)
		  {
		    if(Array.isArray(input.hyponym)){
			    input.hyponym.forEach(function(elem){
				  var space = String(" ");
				  var times = current_depth * 4;
				  var spaces = space.repeat(times);
		          str += "\n" + spaces + getSynsetString(elem, current_depth);
			    });
		  } else {
			     str += "  " + getSynsetString(input.hyponym, current_depth);  
			     }
	      }
		return str;
	    }
		var synsetString = getSynsetString(obj, 0);
		console.log(synsetString);
	break;
	case wn.Word:
		console.log("L: " + obj.lemma);
	break;
	case wn.Example:
		console.log("E: " + obj.sample);
	break;
	}
}

function _findSisterTermsArray(synsetid){
	var hypernymIdArray = _findHypernymsArray(synsetid);
	return hypernymIdArray.map(function(data){
		console.log(data)
		var query = "SELECT synset1id FROM semlinks WHERE synset2id = $synset2id AND linkid = 1";
		var arr =  db.allAsync(query,{
			$synset2id: data.synsetid
		});
		arr = arr.map(function(data){
			var obj = {};
			obj.synsetid = data.synset1id;
			return _findSynsetDefFromId(obj);
		}).map(_appendLemmas);
		var ret = data;
		ret.hyponym = arr;
		return Promise.props(ret);
	});
}

function _findHyponymsArray(synsetid){
	var query = "SELECT synset2id FROM semlinks WHERE synset1id = $synset1id AND linkid = 2";
	var arr =  db.allAsync(query,{
		$synset1id: synsetid
	});
	return arr.map(function(data){
		var obj = {};
		obj.synsetid = data.synset2id;
		return _findSynsetDefFromId(obj);
	});
}

function _findCauseOfArray(synsetid){
	var query = "SELECT synset2id FROM semlinks WHERE synset1id = $synset1id AND linkid = 23";
	var arr = db.allAsync(query, {
		$synset1id: synsetid
	});
	return arr.map(function(data){
		var obj = {};
		obj.synsetid = data.synset2id; 
		return _findSynsetDefFromId(obj);
	})
}

function _appendLemmas(data){
	var promise = _findLemmasArray(data.synsetid).map(function(item){
		return new wn.Word(item.lemma);
	})  
	var ret = data;
	ret.words = promise;
	return Promise.props(ret);
}

function _findHolonymsArray(synsetid){
	var query = "SELECT synset2id FROM semlinks WHERE synset1id = $synset1id AND linkid IN (11,12,13)";
	var arr = db.allAsync(query, {
		$synset1id: synsetid
	});
	return arr.map(function(data){
		var obj = {};
		obj.synsetid = data.synset2id; 
		return _findSynsetDefFromId(obj);
	})
}

function _findHypernymsArray(synsetid){
	var query = "SELECT synset2id FROM semlinks WHERE synset1id = $synset1id AND linkid = 1";
	var arr =  db.allAsync(query,{
		$synset1id: synsetid
	});
	return arr.map(function(data){
		var obj = {};
		obj.synsetid = data.synset2id;
		return _findSynsetDefFromId(obj);
	});
}

function _findSamplesArray(synsetid){
  var query = "SELECT * FROM samples WHERE synsetid = $synsetid";
  return db.allAsync(query,{
	  $synsetid: synsetid
  });
}

function _findLemmasArray(synsetid){
	var query = "SELECT words.lemma FROM words INNER JOIN senses ON words.wordid = senses.wordid WHERE senses.synsetid = $synsetid";
	return db.allAsync(query,{
		$synsetid: synsetid
	});
}

function _formSynsetsArray(data){
  var SynsetArray = [];
  for (var i = 0; i < data.length; i++){
	var obj =  _findSynsetDefFromId(data[i]);
    SynsetArray.push(obj);
  };
  return Promise.all(SynsetArray);
};

function _findSynsetDefFromId(data){
  var query = "SELECT ss.synsetid, ss.pos, ld.lexdomainname AS lexdomain, ss.definition";
  query += " FROM synsets AS ss INNER JOIN lexdomains AS ld ON ld.lexdomainid = ss.lexdomainid"; 
  query += " WHERE synsetid = $synsetid";
  return db.eachAsync(query, {
    $synsetid: data.synsetid
  });
};

module.exports = wn;