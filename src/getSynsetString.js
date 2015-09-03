'use strict';

// MODULES //

var isArray = require( 'validate.io-array' );


// GET SYNSET STRING //

/**
* FUNCTION getSynsetString( input, depth )
*	Obtain a string representation of a WordNet object including its hypernyms / hyponyms.
*
* @param {Object} input - wordNet object
* @param {Number} depth - current indentation depth
* @returns {String} string representation
*/
function getSynsetString( input, depth ){
	var current_depth = depth + 1;
	var words;
	if ( isArray(input.words) ) {
		words = input.words.map( function( item ) {
			return item.lemma;
		});
	} else {
		words = new Array( input.lemma );
	}
	var str = "S: (" + input.pos + ") ";
	str += words.join( ", " );
	str += " (" + input.definition + ")";

	if ( input.hypernym ) {
		if ( isArray( input.hypernym ) ){
			input.hypernym.forEach( function( elem ) {
				var times = current_depth * 4;
				var spaces = String( " " ).repeat( times );
				str += "\n" + spaces + getSynsetString( elem, current_depth );
			});
		} else{
			str += "  " + getSynsetString( input.hypernym, current_depth );
		}
	}
	if ( input.hyponym ) {
		if ( isArray(input.hyponym) ) {
			input.hyponym.forEach( function( elem ) {
				var times = current_depth * 4;
				var spaces = String(" ").repeat( times );
				str += "\n" + spaces + getSynsetString( elem, current_depth );
			});
		} else {
			str += "  " + getSynsetString( input.hyponym, current_depth );
		}
	}
	return str;
} // end FUNCTION getSynsetString()


// EXPORTS //

module.exports = getSynsetString;
