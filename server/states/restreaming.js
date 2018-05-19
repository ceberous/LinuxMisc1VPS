const RU = require( "../utils/redis.js" );
const RC = require( "../constants/redis.js" );

const SCRIPT_NAME = "restream_twitch_to_youtube_live.py";
const MANUAL_PROCESS = "/usr/local/bin/startRestream";

const YTPersonal = require( "../../personal.js" ).youtube;
const YTNormalBase = "https://www.youtube.com/watch?v=";
const YTGamingBase = "https://gaming.youtube.com/watch?v=";

function GET_LIVE_YT_URLS() {
	return new Promise( async function( resolve , reject ) {
		try {
			console.log( "here in live videos" );
			const WatchID = await require( "../utils/youtube.js" ).getLiveVideos();
			if ( WatchID ) {
				await require( "../discordManager.js" ).post( "<" + YTNormalBase + WatchID[ 0 ] + ">\n" + "<" + YTGamingBase + WatchID[ 0 ] + ">" , "restreaming" );
			}
			resolve( WatchID );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getLiveYTURLS = GET_LIVE_YT_URLS;

function START_USER( wUserName ) {
	return new Promise( async function( resolve , reject ) {
		try {
			console.log( "START_USER Stage 1" );
			await require( "../utils/generic.js" ).pkillProcess( "python3" );
			await require( "../utils/generic.js" ).pkillProcess( "vlc" );
			await require( "../utils/generic.js" ).sleep( 2000 );
			require( "../utils/generic.js" ).startRestreamLauncher( wUserName );
			console.log( "START_USER Stage 2" );
			await RU.setKey( RC.RESTREAMING.ACTIVE , wUserName );
			await require( "../discordManager.js" ).post( "Starting --> " + wUserName , "restreaming" );
			await require( "../utils/generic.js" ).sleep( 3000 );
			console.log( "START_USER Stage 3" );
			await GET_LIVE_YT_URLS();
			console.log( "START_USER Done" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.startUser = START_USER;

function START_QUE() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../utils/twitch.js" ).getLiveUsers();
			var final_index = 0;
			var fetched_index = await RU.getKey( RC.RESTREAMING.QUE_INDEX );
			if ( fetched_index ) {
				if ( fetched_index !== "null" ) { final_index = parseInt( fetched_index ); }
				else { await RU.setKey( RC.RESTREAMING.QUE_INDEX , 0 );  }
			}
			else { await RU.setKey( RC.RESTREAMING.QUE_INDEX , 0 ); }
			const username = await RU.getFromListByIndex( RC.RESTREAMING.QUE , final_index );
			await START_USER( username );
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
			await RU.incrementInteger( RC.RESTREAMING.QUE_INDEX );
			var index = await RU.getKey( RC.RESTREAMING.QUE_INDEX );
			index = parseInt( index );
			await require( "../utils/generic.js" ).pkillProcess( "python3" );
			await require( "../utils/generic.js" ).pkillProcess( "vlc" );
			await require( "../utils/generic.js" ).sleep( 2000 );
			var username = await RU.getFromListByIndex( RC.RESTREAMING.QUE , index );
			if ( !username ) { 
				index = 0; 
				username = await RU.getFromListByIndex( RC.RESTREAMING.QUE , index );
				await RU.setKey( RC.RESTREAMING.QUE_INDEX , 0 );
			}
			await START_USER( username );	
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.next = NEXT;

function PREVIOUS( wUserName ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await RU.decrementInteger( RC.RESTREAMING.QUE_INDEX );
			var index = await RU.getKey( RC.RESTREAMING.QUE_INDEX );
			index = parseInt( index );
			if ( index < 0 ) {
				index = await RU.getListLength( RC.RESTREAMING.QUE );
				index = parseInt( index );
				index = index - 1;
				await RU.setKey( RC.RESTREAMING.QUE_INDEX , index );
			}
			await require( "../utils/generic.js" ).pkillProcess( "python3" );
			await require( "../utils/generic.js" ).pkillProcess( "vlc" );
			await require( "../utils/generic.js" ).sleep( 2000 );
			var username = await RU.getFromListByIndex( RC.RESTREAMING.QUE , index );
			if ( !username ) { 
				index = 0;
				username = await RU.getFromListByIndex( RC.RESTREAMING.QUE , index );
				await RU.setKey( RC.RESTREAMING.QUE_INDEX , 0 );
			}
			await START_USER( username );				
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
			await require( "../utils/generic.js" ).pkillProcess( "vlc" );
			await require( "../utils/generic.js" ).sleep( 2000 );
			await START_QUE();
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
			await require( "../utils/generic.js" ).pkillProcess( "vlc" );
			await RU.delKey( RC.RESTREAMING.ACTIVE );
			await require( "../utils/generic.js" ).sleep( 2000 );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.stop = STOP;