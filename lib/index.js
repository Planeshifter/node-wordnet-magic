'use strict';

// MODULES //

var getSynsetString = require( './getSynsetString.js' );
var sqlite3 = require( 'sqlite3' ).verbose();
var Promise = require( 'bluebird' );
var _ = require( 'underscore' );
var fs = require( 'fs' );
var path = require( 'path' );


// Extend prototype objects...

// Strings:
if (!String.prototype.hasOwnProperty( 'repeat' ) ) {
	String.prototype.repeat = function( num ) {
		return new Array( num + 1 ).join( this );
	};
}

if (!String.prototype.hasOwnProperty("endsWith")){
	String.prototype.endsWith = function( str ) {
		var myRegExp = new RegExp(str + "$");
		return myRegExp.test(this);
	};
}


// Arrays:
if ( !Array.prototype.hasOwnProperty( 'pick' ) ) {
	Array.prototype.pick = function( name ) {
		return this.map( function( elem ) {
			return elem[name];
		});
	};
}

if ( !Array.prototype.hasOwnProperty( 'contains' ) ) {
	Array.prototype.contains = function( elem ) {
		var q;
		for ( q = 0; q < this.length; q++ ) {
			if ( elem === this[q] ) {
				return true;
			}
		}
		return false;
	};
}

// WORDNET //

/* WordNet Revealing Closure Pattern: */
function makeWordNet( inputPath, preload ) {
	var exists;
	var file;
	var db;
	if ( !inputPath ) {
		// Initialize with standard path...
		file =  path.normalize( __dirname + '/../data/sqlite-31.db' );
		exists = fs.existsSync( file );
		if ( exists ) {
				db = Promise.promisifyAll( new sqlite3.Database( file ) );
		} else {
			console.log( 'Couldn\'t find file \'sqlite-31.db\' in data subdirectory. ' +
				'Please supply the correct path by using .registerDatabase(path), otherwise ' +
				'the module does not work.' );
		}
	} else {
		// Initialize with supplied path...
		db = Promise.promisifyAll( new sqlite3.Database( inputPath ) );
	}

	var wn = {};
	wn.preload = preload ? preload : false;

	if ( wn.preload === true ) {
		wn.SAMPLES = db.allAsync( "SELECT * FROM samples" ).then( function( d ) {
			return _.groupBy(d, "synsetid");
		});
		wn.SEMLINKS = db.allAsync( "SELECT synset1id, synset2id, linkid FROM semlinks" );

		wn.SEMLINKS.HYPERNYMS = db.allAsync("SELECT synset1id, synset2id, linkid FROM semlinks WHERE linkid = 1").then(function(d){
			return _.groupBy(d, "synset1id");
		});

		wn.SEMLINKS.SISTERS = db.allAsync("SELECT synset1id, synset2id, linkid FROM semlinks WHERE linkid = 1").then(function(d){
			return _.groupBy(d, "synset2id");
		});

		var long_query = "SELECT s.synsetid AS synsetid, s.definition AS definition, s.pos AS pos, s.lemma AS lemma, " +
			"s.sensenum AS sensenum, l.lexdomainname AS lexdomain " +
			"FROM wordsXsensesXsynsets AS s LEFT JOIN lexdomains AS l ON l.lexdomainid = s.lexdomainid";

		wn.WORDSxSENSESxSYNSETSxLEXDOMAINS = db.allAsync(long_query).then(function(d){
			return _.groupBy(d, "lemma");
		});

		var synXlex_query = "SELECT ss.synsetid AS synsetid, ss.pos AS pos, ld.lexdomainname AS lexdomain, ss.definition AS definition";
		synXlex_query += " FROM synsets AS ss INNER JOIN lexdomains AS ld ON ld.lexdomainid = ss.lexdomainid";
		wn.SYNSETSxLEXDOMAINS = db.allAsync(synXlex_query).then(function(d){
			return _.indexBy(d, "synsetid");
		});
	}


	// METHODS //

	wn.morphy = function morphy( str, pos, callback ) {
		return wn.morphyPromise( str, pos ).nodeify( callback );
	}; // end METHOD morphy()

	wn.morphyPromise = require( './morphy.js' );

	return wn;
} // end FUNCTION makeWordNet()


// EXPORTS //


module.exports = makeWordNet;
