const RU = require( "../utils/redis.js" );
const RC = require( "../constants/redis.js" );

const SCRIPT_NAME = "restream_twitch_to_youtube_live.py";

function START_USER( wUserName ) {
	return new Promise( async function( resolve , reject ) {
		try {
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.startUser = START_USER;

function START_QUE() {
	return new Promise( async function( resolve , reject ) {
		try {
			var index = await RU.getKey( RC.RESTREAMING.QUE_INDEX );
			if ( !index ) { index = 0; }
			else if ( index === "null" ) { index = 0; }
			else { index = parseInt( index ); }
			await require( "../utils/generic.js" ).pkillProcess( "python3" );
			await require( "../utils/generic.js" ).sleep( 2000 );
			const username = await RU.getFromListByIndex( RC.RESTREAMING.QUE , index );
			await require( "../utils/generic.js" ).startPYScript( SCRIPT_NAME , username );
			await RU.setKey( RC.RESTREAMING.ACTIVE , username );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.startQue = START_QUE;

function GET_QUE() {
	return new Promise( async function( resolve , reject ) {
		try {
			const index = await RU.getKey( RC.RESTREAMING.QUE_INDEX );
			const que = await RU.getFullList( RC.RESTREAMING.QUE );
			resolve({
				index: index ,
				que: que
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getQue = GET_QUE;

function NEXT( wUserName ) {
	return new Promise( async function( resolve , reject ) {
		try {
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.next = NEXT;

function PREVIOUS( wUserName ) {
	return new Promise( async function( resolve , reject ) {
		try {
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.previous = PREVIOUS;

function RESTART() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../utils/generic.js" ).pkillProcess( "python3" );
			await require( "../utils/generic.js" ).sleep( 2000 );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.restart = RESTART;

function STOP() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../utils/generic.js" ).pkillProcess( "python3" );
			await RU.delKey( RC.RESTREAMING.ACTIVE );
			await require( "../utils/generic.js" ).sleep( 2000 );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.stop = STOP;