const request = require( "request" );
const cheerio = require( "cheerio" );
const Personal = require( "../../personal.js" ).youtube;
const wURL = "https://www.youtube.com/channel/" + Personal.channel_id + "/videos?view=2&live_view=501&flow=grid";

function GET_LIVE_VIDEOS() {
	return new Promise( async function( resolve , reject ) {
		try {
			var wResults = [];
			request( wURL , function ( err , response , body ) {
				if ( err ) { console.log( err ); resolve( wResults ); return; }
				try { var $ = cheerio.load( body ); }
				catch(err) { resolve( wResults ); return; }
				$( ".yt-lockup-title > a" ).each( function () {
					var wID = $( this ).attr( "href" );
					wID = wID.substring( wID.length - 11 , wID.length );
					//wResults.push( { title: $( this ).text() , id: wID } );
					wResults.push( wID );
				});
				resolve( wResults );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getLiveVideos = GET_LIVE_VIDEOS;
