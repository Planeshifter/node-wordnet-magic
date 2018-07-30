'use strict';

// MODULES //

var Promise = require( 'bluebird' );
var _ = require( 'underscore' );
var getSubstitutions = require( './getSubstitutions.js' );
var rulesOfDetachment = require( './rules_of_detachment.js' );


// CONSTANTS //

var POS_TAGS = [ 'n', 'v', 'a', 'r', 's' ];


/**
* Extract base form of supplied word using Morphy algorithm.
*
* @param {string} str - input string
* @param {string} pos - part of speech
* @returns {Promise} results promise
*/
function morphyPromise( str, pos ) {
	/* jshint: -WO40 */
	var substitutions;
	var query;
	var i;
	if ( !pos ) {
		var resArray = [];
		for ( i = 0; i < POS_TAGS.length; i++ ){
			resArray.push( morphyPromise( str, POS_TAGS[i] ) );
		}
		return Promise.all( resArray ).then( function onDone( data ) {
			var reducedArray = [];
			var j;
			for ( j = 0; j < data.length; j++ ) {
				reducedArray.push( data[ j ] );
			}
			return _.flatten( reducedArray );
		});
	}

	substitutions = getSubstitutions( pos );

	if ( !this.DICTIONARY ) {
		query = 'SELECT DISTINCT ws.lemma AS lemma, syn.pos AS pos FROM words AS ws LEFT JOIN senses AS sen ON ws.wordid = sen.wordid LEFT JOIN ';
		query += 'synsets AS syn ON sen.synsetid = syn.synsetid';
		this.DICTIONARY = this.db.allAsync( query ).map( function mapper( elem ) {
			var obj = {
				lemma: elem.lemma,
				pos: elem.pos
			};
			return obj;
		});
	}

	if ( !this.EXCEPTIONS ) {
		query = 'SELECT lemma, morph, pos FROM morphology';
		this.EXCEPTIONS = db.allAsync( query );
	}

	var wordsPromise = Promise.join( this.DICTIONARY, this.EXCEPTIONS, function( dictionary, exceptions ) {
		var foundExceptions = [];
		var exceptionMorphs = exceptions.map( function( elem ) {
			return elem.morph;
		});
		var baseWord;
		var suffix;
		var index = exceptionMorphs.indexOf( str );

		while ( index !== -1 ) {
			if ( exceptions[index].pos === pos ) {
				baseWord = new this.Word( exceptions[index].lemma );
				baseWord.part_of_speech = pos;
				foundExceptions.push( baseWord );
			}
			index = exceptionMorphs.indexOf( str, index + 1 );
		}

		if ( foundExceptions.length > 0 ) {
			return foundExceptions;
		} else {
			if ( pos === 'n' && str.endsWith( 'ful' ) ) {
				suffix = 'ful';
				str = str.slice( 0, str.length - suffix.length );
			} else {
				suffix = '';
			}
			return rulesOfDetachment( str, substitutions );
		}
	});

	return wordsPromise;
} // end FUNCTION morphyPromise()


// EXPORTS //

module.exports = morphyPromise;
