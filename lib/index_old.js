// WordNet Revealing Closure Pattern:

function makeWordNet(input_path, preload){


	wn.isVerb = function( str, callback ){
		var word = wn.morphyPromise( str );
		var res = word.then(function(data){
			var posArray = data.pick( "part_of_speech" );
			return posArray.contains( "v" );
		});
		return res.nodeify( callback );
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
		  var posArray = data.pick("part_of_speech");
		  return posArray.contains("a") || posArray.contains("s");
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

	wn.fetchSynset = function(identifier, callback){
		var ret;
	  var inputs = identifier.split(".");
	  if (!wn.preload){
		  var query = "SELECT s.synsetid AS synsetid, s.definition AS definition, s.pos AS pos, l.lexdomainname AS lexdomain FROM wordsXsensesXsynsets AS s LEFT JOIN lexdomains AS l ON l.lexdomainid = s.lexdomainid ";
		  query += "WHERE s.pos = $pos AND s.lemma = $lemma AND s.sensenum = $sensenum";

		  ret = db.eachAsync(query,{
			$lemma: inputs[0],
			$pos: inputs[1],
			$sensenum: inputs[2]
		   });
	  } else {
		  ret = wn.WORDSxSENSESxSYNSETSxLEXDOMAINS.then(function(d){
			  var search_lemma = inputs[0];
			  var res;
			  var candidateSet = d[search_lemma];
			  for (var i = 0; i < candidateSet.length; i++)
			  {
				  if (candidateSet[i].pos === inputs[1] && candidateSet[i].sensenum === inputs[2]){
					  res = candidateSet[i];
				  }
			  }
			  return res;
		  });
	  }

	   return ret.then(_appendLemmas).then(function(data){
		 return new wn.Synset(data);
	   }).nodeify(callback);
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

		  if(obj.holonymOf){
			  this.holonymOf = obj.holonymOf;
		  }

		  if(obj.domain_type){
			  this.domain_type = obj.domain_type;
		  }

		  if(obj.term_type){
			  this.term_type = obj.term_type;
		  }
	};

	wn.Synset.prototype = {
			  constructor: wn.Synset,
			  fetchSynset: function(callback){
				  var inputs = obj.split(".");

				  var query = "SELECT s.synsetid, s.definition, s.pos, l.lexdomainname AS lexdomain FROM wordsXsensesXsynsets AS s LEFT JOIN lexdomains AS l ON l.lexdomainid = s.lexdomainid";
				  query += "WHERE s.pos = $pos AND s.lemma = $lemma AND s.sensenum = $sensenum";

				  var ret = db.eachAsync(query,{
					   $lemma: inputs[0],
					   $pos: inputs[1],
					   $sensenum: inputs[2]
					 });

				  ret.then(function(data){
					  this.synsetid = data.synsetid;
					  this.definition = data.definition;
					  this.pos = data.pos;
					  this.lexdomain = data.lexdomain;

					  callback
				  });

				  fetched = true;
			  },
			  getExamples: function(callback){
				  var promise = _findSamplesArray(this.synsetid).map(function(item){
					return new wn.Example(item);
				  });
				  return promise.nodeify(callback);
			  },
			  getLemmas: function(callback){
				var promise = _findLemmasArray(this.synsetid).map(function(item){
					return new wn.Word(item.lemma);
				});
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
				  var promise = _findHyponymsArray(this.synsetid).map(_appendLemmas).map(function(item){
					   return new wn.Synset(item);
				  });
				  return promise.nodeify(callback);
			  },
			  getHyponymsTree: function(callback){
				  function getHyponymsFromId(input){
					  return _findHyponymsArray(input).map(_appendLemmas).map(function(item){
						  item.hyponym = getHyponymsFromId(item.synsetid);
						  return Promise.props(item);
					  }).map(function(item){
						 var obj = new wn.Synset(item);
						 return obj;
					  });
				  }
				  var promise = getHyponymsFromId(this.synsetid);
				  return promise.nodeify(callback);
			  },
			  getHolonyms: function(type, callback){
				  var promise = _findHolonymsArray(this.synsetid, type).map(_appendLemmas).map(function(item){
					  return new wn.Synset(item);
				  });
				  return promise.nodeify(callback);
			  },
			  getMeronyms: function(type, callback){
				  var promise = _findMeronymsArray(this.synsetid, type).map(_appendLemmas).map(function(item){
					 return new wn.Synset(item);
				  });
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
			  getDomains: function(callback){

				  var classification;

				  function _findDomainsArray(synsetid){
					  var arr;
					  if (!wn.preload){
							var query = "SELECT synset2id, linkid FROM semlinks WHERE synset1id = $synset1id AND linkid IN (91, 93, 95)";
							arr = db.allAsync(query, {
								$synset1id: synsetid
							});
					  } else {
							arr = wn.SEMLINKS.then(function(data){
								return data.filter(function(e){
									return e.synset1id === synsetid && [91,93,95].contains(e.linkid);
								});
							});
					  }

						return arr.map(function(data){
							var obj = {};
							obj.synsetid = data.synset2id;

							switch(data.linkid){
							  case 91:
								classification = "topic";
							  break;
							  case 93:
								classification = "region";
							  break;
							  case 95:
								classification = "usage";
							  break;
							}

							return _findSynsetDefFromId(obj);
						});
					}

				  var promise = _findDomainsArray(this.synsetid).map(_appendLemmas).map(function(item){
					  item.domain_type = classification;
					  return new wn.Synset(item);
				  });
				  return promise.nodeify(callback);
			  },
			  getDomainTerms: function(callback){

				  var classification;

				  function _findDomainTermsArray(synsetid){
					  var arr;
					  if (!wn.preload){
							var query = "SELECT synset1id, linkid FROM semlinks WHERE synset2id = $synset2id AND linkid IN (92, 94, 96)";
							arr = db.allAsync(query, {
								$synset2id: synsetid
							});
						} else {
							arr = wn.SEMLINKS.then(function(data){
								return data.filter(function(e){
									return e.synset2id === synsetid && [92,94,96].contains(e.linkid);
								});
							});
						}

						return arr.map(function(data){
							var obj = {};
							obj.synsetid = data.synset1id;
							switch(data.linkid){
							  case 92:
								classification = "topic";
							  break;
							  case 94:
								classification = "region";
							  break;
							  case 96:
								classification = "usage";
							  break;
							}

						return _findSynsetDefFromId(obj);
		  });
					}

				  var promise = _findDomainTermsArray(this.synsetid).map(_appendLemmas).map(function(item){
					  item.term_type = classification;
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
	};

	wn.Example.prototype = {
			constructor: wn.Example,
			toString: function(){
				return this.sample;
			}
	};

	wn.print = function(obj){
		switch(obj.constructor){
		case Array:
			for (var i = 0; i < obj.length; i++){
				wn.print(obj[i]);
			}
		break;
		case wn.Synset:
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
	};

	function _findSisterTermsArray(synsetid){
		var hypernymIdArray = _findHypernymsArray(synsetid);
		return hypernymIdArray.map(function(data){
			var arr;
			if (!wn.preload){
				var query = "SELECT synset1id FROM semlinks WHERE synset2id = $synset2id AND linkid = 1";
				arr =  db.allAsync(query,{
					$synset2id: data.synsetid
				});
			} else {
				arr = wn.SEMLINKS.SISTERS.then(function(resultSet){
					return resultSet[data.synsetid] || [];
				});			}
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
		var arr;
		if (!wn.preload){
			var query = "SELECT synset2id FROM semlinks WHERE synset1id = $synset1id AND linkid = 2";
			 arr =  db.allAsync(query,{
				$synset1id: synsetid
			});
		} else {
			arr = wn.SEMLINKS.filter(function(e){
				return e.synset1id === synsetid && e.linkid === 1;
			});
		}

		return arr.map(function(data){
			var obj = {};
			obj.synsetid = data.synset2id;
			return _findSynsetDefFromId(obj);
		});
	}

	function _findCauseOfArray(synsetid){
		var arr;
		if (!wn.preload){
			var query = "SELECT synset2id FROM semlinks WHERE synset1id = $synset1id AND linkid = 23";
			arr = db.allAsync(query, {
			$synset1id: synsetid
		});
		} else {
			arr = wn.SEMLINKS.filter(function(e){
				return e.linkid === 23 && e.synset1id === synsetid;
			});
		}
		return arr.map(function(data){
			var obj = {};
			obj.synsetid = data.synset2id;
			return _findSynsetDefFromId(obj);
		});
	}

	function _appendLemmas(data){
		var promise = _findLemmasArray(data.synsetid).map(function(item){
			return new wn.Word(item.lemma);
		});
		var ret = data;
		ret.words = promise;
		return Promise.props(ret);
	}

	function _findHolonymsArray(synsetid, type){
		/*
		linkids are:
		part: 11
		member: 13
		substance: 15
		*/
		var ids;
		var linkid;
		var arr;

		if(type){
		  type = Array.isArray(type) ? type : new Array(type);
		  ids = type.map(function(elem){
			switch (elem) {
			case "part" : return 11;
			case "member" : return 13;
			case "substance" : return 15;
			}
		  });
		  linkid = "IN (" + ids.join(",") + ")";
		} else {
		  linkid = "IN (11,13,15)";
		}
		if (!wn.preload){
			var query = "SELECT synset1id FROM semlinks WHERE synset2id = $synset2id AND linkid " + linkid;
			arr = db.allAsync(query, {
				$synset2id: synsetid
			});
		}
		else {
			arr = wn.SEMLINKS.then(function(data){
				var ret = data.filter(function(e){
					if (type){
						return e.synset2id === synsetid && ids.contains(e.linkid);
					} else {
						return e.synset2id === synsetid;
					}
				});
				return ret;
			});
		}
		return arr.map(function(data){
			var obj = {};
			obj.synsetid = data.synset1id;
			return _findSynsetDefFromId(obj);
		});
	}

	function _findMeronymsArray(synsetid, type){
		/*
		linkids are:
		part: 12
		member: 14
		substance: 16
		*/
		var synID = synsetid;
		var linkid;
		if(type){
		  type = Array.isArray(type) ? type : new Array(type);
		  var ids = type.map(function(elem){
			  switch (elem) {
			  case "part" : return 12;
			  case "member" : return 14;
			  case "substance" : return 16;
			  }
		  });
		  linkid = "IN (" + ids.join(",") + ")";
		} else {
		  linkid = "IN (12,14,16)";
		}

		var arr;
		if(!wn.preload){
			var query = "SELECT synset1id FROM semlinks WHERE synset2id = $synset2id AND linkid " + linkid;
			arr = db.allAsync(query, {
				$synset2id: synID
			});
		} else {
			arr = wn.SEMLINKS.then(function(data){
				var ret = data.filter(function(e){
					return e.synset2id === synsetid && ids.contains(e.linkid);
				});
				return ret;
			});
		}
		return arr.map(function(data){
			var obj = {};
			obj.synsetid = data.synset1id;
			return _findSynsetDefFromId(obj);
		});
	}

	function _findHypernymsArray(synsetid){
		var arr;
		if (!wn.preload){
			var query = "SELECT synset2id FROM semlinks WHERE synset1id = $synset1id AND linkid = 1";
			arr =  db.allAsync(query,{
				$synset1id: synsetid
			});
		} else {
			arr = wn.SEMLINKS.HYPERNYMS.then(function(e){
				return e[synsetid] || [];
			});
		}
		var ret = arr.map(function(d){
			var obj = {};
			obj.synsetid = d.synset2id;
			return _findSynsetDefFromId(obj);
		});
		return ret;
	}

	function _findSamplesArray(synsetid){
		if(!wn.preload){
	  var query = "SELECT * FROM samples WHERE synsetid = $synsetid";
	  return db.allAsync(query,{
		  $synsetid: synsetid
	  });
		}
		else {
			var ret = wn.SAMPLES.then(function(d){
				return d[synsetid];
			});
			return ret;
		}
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
	  }
	  return Promise.all(SynsetArray);
	}

	function _findSynsetDefFromId( data ) {
		var ret;
		if ( !wn.preload ) {
			var query = "SELECT ss.synsetid, ss.pos, ld.lexdomainname AS lexdomain, ss.definition";
			query += " FROM synsets AS ss INNER JOIN lexdomains AS ld ON ld.lexdomainid = ss.lexdomainid";
			query += " WHERE synsetid = $synsetid";
			ret = db.eachAsync( query, {
				$synsetid: data.synsetid
			});
		} else {
			ret = wn.SYNSETSxLEXDOMAINS.then( function( returnSet ) {
				return returnSet[data.synsetid];
			});
		}
		return ret;
	}

	return wn;
}


module.exports = makeWordNet;
