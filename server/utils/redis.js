const redis = require( "../redisManager.js" ).redis;


function REDIS_SET_KEY( wKey , wVal ) {
	return new Promise( function( resolve , reject ) {
		try { redis.set( wKey , wVal , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); resolve( "error" ); }
	});
}

function REDIS_GET_KEY( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { redis.get( wKey , function( err , key ) { resolve( key ); }); }
		catch( error ) { console.log( error ); resolve( "null" ); }
	});
}

function REDIS_DELETE_KEY( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { redis.del( wKey , function( err , keys ) { resolve( keys ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_GET_FULL_LIST( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { redis.lrange( wKey , 0 , -1 , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); resolve( "list probably doesn't even exist" ); }
	});
}

function REDIS_INCREMENT_INTEGER( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { redis.incr( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_DECREMENT_INTEGER( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { redis.decr( wKey , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_SET_LIST_FROM_ARRAY( wKey , wArray ) {
	return new Promise( function( resolve , reject ) {
		try { redis.rpush.apply( redis , [ wKey ].concat( wArray ).concat( function( err , keys ){ resolve( keys ); })); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_GET_FROM_LIST_BY_INDEX( wKey , wIndex ) {
	return new Promise( function( resolve , reject ) {
		try { redis.lindex( wKey , wIndex , function( err , key ) { resolve( key ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.setKey= REDIS_SET_KEY;
module.exports.getKey = REDIS_GET_KEY;
module.exports.delKey = REDIS_DELETE_KEY;
module.exports.getFullList = REDIS_GET_FULL_LIST;
module.exports.setListFromArray = REDIS_SET_LIST_FROM_ARRAY;
module.exports.getFromListByIndex = REDIS_GET_FROM_LIST_BY_INDEX;
module.exports.incrementInteger = REDIS_INCREMENT_INTEGER;
module.exports.decrementInteger = REDIS_DECREMENT_INTEGER;