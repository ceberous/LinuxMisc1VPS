process.on( "unhandledRejection" , function( reason , p ) {
    console.error( reason, "Unhandled Rejection at Promise" , p );
    console.trace();
});
process.on( "uncaughtException" , function( err ) {
    console.error( err , "Uncaught Exception thrown" );
    console.trace();
});

const port = process.env.PORT || 6969;
const ip = require("ip");
const WebSocket = require( "ws" );
//const tmi = require( "tmi.js" );

//const TwitchMusicBotCreds = require( "./personal.js" ).twitch_music_bot;
var twitchIRCClient = undefined;
var LatestID = "dQw4w9WgXcQ";

function twitch_say( wMessage ) { 
    return new Promise( async function( resolve , reject ) {
        try {
            await twitchIRCClient.say( TwitchMusicBotCreds.channel , wMessage );
            resolve();
        }
        catch( error ) { console.log( error ); reject( error ); }
     }); 
}

var app = localIP = server = wss = null;

( async ()=> {

	await require( "./server/redisManager.js" ).loadRedis();
	
	app = require( "./server/express/expressAPP.js" );
	server = require( "http" ).createServer( app );
	// wss = new WebSocket.Server({ server });
	// await require( "./server/websocketManager.js" ).initialize( port );
	// wss.on( "connection" , function( message ){
	// 	if ( wMSG !== LatestID ) {
	// 		LatestID = wMSG;
	// 		console.log( "Updated LatestID to --> " + LatestID );
	// 	}		
	// }); 

	await require( "./server/discordManager.js" ).initialize();
	require( "./server/scheduleManager.js" ).initialize();

	//await require( "./server/utils/twitch.js" ).getLiveUsers();

	server.listen( port , async function() {
		const localIP = ip.address();
		console.log( "\tServer Started on :" );
		console.log( "\thttp://" + localIP + ":" + port );
		console.log( "\t\t or" );
		console.log( "\thttp://localhost:" + port );
	});


	process.on( "unhandledRejection" , async function( reason , p ) {
	    await require( "./server/discordManager.js" ).error( reason );
	});
	process.on( "uncaughtException" , async function( err ) {
	    await require( "./server/discordManager.js" ).error( err );
	});

	process.on( "SIGINT" , async function () {
		await require( "./server/discordManager.js" ).shutdown();
		setTimeout( async ()=> {
			// await STATE_MANAGER.stop();
			await require( "./server/states/restreaming.js" ).stop();
			process.exit(1);
		} , 2000 );
	});

	await require( "./server/discordManager.js" ).error( "LinuxMisc1 === ONLINE" );

})();