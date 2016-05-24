/* global require, describe, it */
'use strict';

// MODULES //

var chai = require( 'chai' );
var chaiAsPromised = require( 'chai-as-promised' );

chai.use( chaiAsPromised );
chai.use( require( 'chai-things' ) );

var wordNet = require( './../lib/' )();


// VARIABLES //

var expect = chai.expect;
var assert = chai.assert;


// TESTS //

describe( '', function tests() {

	it( 'should export a function', function test() {
		expect( wordNet.morphy ).to.eventually.be.a( 'function' );
	});

});
