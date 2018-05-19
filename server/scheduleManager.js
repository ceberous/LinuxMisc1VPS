const schedule = require( "node-schedule" );

const RU = require( "./utils/redis.js" );
const RC = require( "./constants/redis.js" );

var SCHEDULAR = null;

function INITIALIZE() {
	return new Promise( function( resolve , reject ) {
		try {
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;