const Eris = require("eris");
var discordBot = null;
var discordCreds = null;

function POST_ID( wMessage , wChannelID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await discordBot.createMessage( wChannelID , wMessage );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}
module.exports.postID = POST_ID;

function POST( wMessage , wChannel ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !discordCreds.channels[ wChannel ] ) { resolve( "channel not known" ); return; }
			await discordBot.createMessage( discordCreds.channels[ wChannel ] , wMessage );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.post = POST;

function POST_ERROR( wStatus ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wStatus ) { resolve(); return; }
			if ( typeof wStatus !== "string" ) {
				try { wStatus = wStatus.toString(); }
				catch( e ) { wStatus = e; }
			}
			await discordBot.createMessage( discordCreds.channels.error , wStatus );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.error = POST_ERROR;

function SHUTDOWN() {
	return new Promise( async function( resolve , reject ) {
		try {
			await discordBot.disconnect();			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.shutdown = SHUTDOWN;

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			discordCreds = require( "../personal.js" ).discord;
			discordBot = new Eris( discordCreds.token );

			discordBot.on( "messageCreate" , async ( msg ) => {
				
				if ( msg[ "author" ][ "id" ] === discordCreds.bot_id ) { return; }

				// Restreaming Channel Messages
				if ( msg.channel.id === discordCreds.channels.restreaming ) {
					if ( msg.content.startsWith( "!stop" ) ) {

					}
					else if ( msg.content.startsWith( "!start" ) || msg.content.startsWith( "!watch" ) ) {
						
						// Start Specific User
						if ( msg.content.includes( "user" ) ) {
							var user = msg.content.split( " " );
							if ( user ) { if ( user[ 2 ] ) { await require( "./states/restreaming.js" ).startUser( user[ 2 ] ); } }
						}
						// Start from Que Position
						else{
							await require( "./states/restreaming.js" ).startQue();
						}
					}					
					else if ( msg.content.startsWith( "!next" ) ) {

					}
					else if ( msg.content.startsWith( "!previous" ) ) {

					}
					else if ( msg.content.startsWith( "!followers" ) ) {
						const followers = await require( "./utils/twitch.js" ).getFollowers();
						await POST_ID( "Following: \n" + followers.join( " , " ) , msg.channel.id );
					}
					else if ( msg.content.startsWith( "!follow" ) ) {
						var user = msg.content.split( " " );
						if ( user ) { if ( user[ 1 ] ) { await require( "./utils/twitch.js" ).follow( user[ 1 ] ); } }
						const followers = await require( "./utils/twitch.js" ).getFollowers();
						await POST_ID( "Following: \n" + followers.join( " , " ) , msg.channel.id );						
					}
					else if ( msg.content.startsWith( "!unfollow" ) ) {
						var user = msg.content.split( " " );
						if ( user ) { if ( user[ 1 ] ) { await require( "./utils/twitch.js" ).unfollow( user[ 1 ] ); } }
						const followers = await require( "./utils/twitch.js" ).getFollowers();
						await POST_ID( "Following: \n" + followers.join( " , " ) , msg.channel.id );						
					}
					else if ( msg.content.startsWith( "!live" ) ) {
						const live = await require( "./utils/twitch.js" ).getLiveUsers();
						await POST_ID( "Live Users == \n" + live.join( " , " ) , msg.channel.id );
					}
					else if ( msg.content.startsWith( "!que" ) ) {
						const que = await require( "./states/restreaming.js" ).getQue();
						await POST_ID( "Que-Index == " + que[ "index" ] + "\nQue == \n" + que[ "que" ].join( " , " ) , msg.channel.id );
					}					
				}

			});

			await discordBot.connect();
			await require( "./utils/generic.js" ).sleep( 500 );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;