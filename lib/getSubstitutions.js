'use strict';

// MODULES //

var _ = require( 'underscore' );


// CONSTANTS //

var MORPHY_SUBSTITUTIONS = {
	NOUN: [
		{ suffix: 's', ending: ''},
		{ suffix: 'ses', ending: 's'},
		{ suffix: 'ves', ending: 'f'},
		{ suffix: 'xes', ending: 'x'},
		{ suffix: 'zes', ending: 'z'},
		{ suffix: 'ches', ending: 'ch'},
		{ suffix: 'shes', ending: 'sh'},
		{ suffix: 'men', ending: 'man'},
		{ suffix: 'ies', ending: 'y'}
	],
	VERB: [
		{ suffix: 's', ending: ''},
		{ suffix: 'ies', ending: 'y'},
		{ suffix: 'es', ending: 'e'},
		{ suffix: 'es', ending: ''},
		{ suffix: 'ed', ending: 'e'},
		{ suffix: 'ed', ending: ''},
		{ suffix: 'ing', ending: 'e'},
		{ suffix: 'ing', ending: ''}
	],
	ADJECTIVE: [
		{ suffix: 'er', ending: ''},
		{ suffix: 'est', ending: ''},
		{ suffix: 'er', ending: 'e'},
		{ suffix: 'est', ending: 'e'}
	]
};


// GET SUBSTITUTIONS //

/**
* Return a copy of the respective substitutions array.
*
* @param {string} pos - part of speech
* @returns {Array} substitutions instance
*/
function getSubstitutions( pos ) {
	var substitutions;
	switch ( pos ) {
	case 'n':
		substitutions = _.clone( MORPHY_SUBSTITUTIONS.NOUN );
	break;
	case 'v':
		substitutions = _.clone( MORPHY_SUBSTITUTIONS.VERB );
	break;
	case 'a':
		substitutions = _.clone( MORPHY_SUBSTITUTIONS.ADJECTIVE );
	break;
	default:
		substitutions = [];
	}
	return substitutions;
} // end FUNCTION getSubstitutions()


// EXPORTS //

module.exports = getSubstitutions;
