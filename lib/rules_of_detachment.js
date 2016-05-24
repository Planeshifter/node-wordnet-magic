'use strict';


/**
* Apply rules of detachment to obtain base forms for supplied word.
*
* @param {string} word - input word
* @param {string} pos - part of speech
* @param {Array} substitutions - Morphy substitutions
* @param {Array} dictionary - WordNet dictionary
* @returns {Array} base forms
*/
function rulesOfDetachment( word, pos, substitutions, dictionary ) {
	var newEnding;
	var recResult;
	var newWord;
	var result = [];
	var suffix;
	var elem;
	var i;

	for ( i = 0; i < dictionary.length; i++ ) {
		elem = dictionary[ i ];
		if ( elem.lemma === word ) {
			if ( elem.pos  === pos ) {
				var obj = new this.Word( elem.lemma );
				obj.part_of_speech = elem.pos;
				result.push( obj );
			}
		}
	}

	for ( i = 0; i < substitutions.length; i++ ) {
		suffix = substitutions[ i ].suffix;
		newEnding = substitutions[ i ].ending;

		if ( word.endsWith(suffix) === true ) {
			newWord = word.substring( 0, word.length - suffix.length ) + newEnding;
			substitutions.splice( i, 1 );
			if ( newWord.endsWith( 'e' ) && !word.endsWith( 'e' )){
				substitutions.push( {
					suffix: 'e',
					ending: ''
				} );
			}
			recResult = rulesOfDetachment( newWord, pos, substitutions, dictionary );
			if ( Array.isArray( recResult ) ) {
				result = result.concat( recResult );
			} else {
				result.push( recResult );
			}
		}
	}
	return result;
} // end FUNCTION rulesOfDetachment()


// EXPORTS //

module.exports = rulesOfDetachment;
