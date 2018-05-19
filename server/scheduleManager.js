const schedule = require( "node-schedule" );

const RU = require( "./utils/redis.js" );
const RC = require( "./constants/redis.js" );

const PreferredStreamer = require( "../personal.js" ).twitch.preferred_streamer;

var SCHEDULE = [];

function INITIALIZE() {
	return new Promise( function( resolve , reject ) {
		try {
			const twitchUpdate = schedule.scheduleJob( "*/1 * * * *" , async function() {
  				console.log( "Running Twitch Live User Update JOB" );
  				const current_live = await require( "./utils/twitch.js" ).getLiveUsers();
  				if ( current_live ) {
  					if ( current_live.length > 0 ) {
						const currently_active = await RU.getKey( RC.RESTREAMING.ACTIVE );
  						if ( !currently_active ) {
  							console.log( "no currently restreaming" );
  							if ( current_live.indexOf( PreferredStreamer ) !== -1 ) {
  								console.log( "Preferred Streamer is Online and we are not steraming anything !!!" );
								require( "./states/restreaming.js" ).startUser( PreferredStreamer );
  							}
  						}
  						else {
  							if ( current_live.indexOf( currently_active ) === -1 ) {
  								console.log( "The Stream we were restreaming went offline" );
  								await require( "./states/restreaming.js" ).stop();
  							}
  							else if ( current_live.indexOf( PreferredStreamer ) !== -1 ) {
  								if ( PreferredStreamer !== currently_active ) {
  									console.log( "We were streaming something else , but now preferred streamer is online" );
  									require( "./states/restreaming.js" ).startUser( PreferredStreamer );
  								}
  							}
  						}
  					}
  				}
			});
			SCHEDULE.push({
				name: "twitch live users update" ,
				pid: twitchUpdate
			});
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;