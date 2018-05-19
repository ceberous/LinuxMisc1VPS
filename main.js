process.on( "unhandledRejection" , function( reason , p ) {
    console.error( reason, "Unhandled Rejection at Promise" , p );
    console.trace();
});
process.on( "uncaughtException" , function( err ) {
    console.error( err , "Uncaught Exception thrown" );
    console.trace();
});

const port = process.env.PORT || 6969;
//const ip = require("ip");

var app = localIP = server = wss = null;

( async ()=> {

	await require( "./server/redisManager.js" ).loadRedis();
	
	//app = require( "./server/EXPRESS/expressAPP.js" );
	//server = require( "http" ).createServer( app );
	//wss = new WebSocket.Server({ server });
	// await require( "./server/websocketManager.js" ).initialize( port );
	// wss.on( "connection" , require( "./server/websocketManager.js" ).onConnection ); 

	await require( "./server/discordManager.js" ).initialize();
	await require( "./server/scheduleManager.js" ).initialize();

	// server.listen( port , async function() {
	// 	const localIP = ip.address();
	// 	console.log( "\tServer Started on :" );
	// 	console.log( "\thttp://" + localIP + ":" + port );
	// 	console.log( "\t\t or" );
	// 	console.log( "\thttp://localhost:" + port );
	// });


	process.on( "unhandledRejection" , async function( reason , p ) {
	    //await require( "./server/discordManager.js" ).error( reason );
	});
	process.on( "uncaughtException" , async function( err ) {
	    //await require( "./server/discordManager.js" ).error( err );
	});

	process.on( "SIGINT" , async function () {
		await require( "./server/discordManager.js" ).shutdown();
		setTimeout( async ()=> {
			await require( "./server/utils/generic.js" ).pkillProcess( "python3" );
			await require( "./server/utils/generic.js" ).pkillProcess( "vlc" );
			process.exit(1);
		} , 2000 );
	});

})();