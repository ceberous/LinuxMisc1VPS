const request = require( "request" );
const cheerio = require( "cheerio" );
const Personal = require( "../../personal.js" ).youtube;
const wURL = "https://www.youtube.com/user/" + Personal.channel_id + "/videos?view=2&live_view=501&flow=grid";
function GET_LIVE_VIDEOS() {
	return new Promise( async function( resolve , reject ) {
		try {
			var wResults = [];
			console.log( wURL );
			request( wURL , function ( err , response , body ) {
				if ( err ) { console.log( err ); reject( err ); return; }
				try { var $ = cheerio.load( body ); }
				catch(err) { reject( "cheerio load failed" ); return; }
				// $( "#items" ).find( "a" ).each( function() {
				// 	console.log($(this).attr('href'));
				// });
				var items = $( "#items" );
				console.log( $( items[0] ).html() );
				var links = $( "#items" ).find( "a" );
				for ( var i = 0; i < links.length; ++i ) {
					console.log( $( links[ i ] ).attr( "href" ) );
				}
				//console.log( links );
				//$( "#items" ).each( function () {
					// var final_id = null;
					// var dimissable = $( this ).children( "#dismissable" );
					// var details = $( dismissable[ 0 ] ).children( "#details" );
					// var meta = $( details[ 0 ] ).children( "#meta" );
					// if ( meta ) {
					// 	if ( meta[ 0 ] ) {
					// 		var id = $( meta[ 0 ] ).children();
					// 		if ( id ) {
					// 			for ( var i = 0; i < id.length; ++i ) {
					// 				var tmp_id = $( id[ i ] ).children();
					// 			}
					// 		}
					// 	}
					// }
					
					//var wID = $( this ).attr( "href" );
					//wID = wID.substring( wID.length - 11 , wID.length );
					//wResults.push( { title: $( this ).text() , id: wID } );
					//wResults.push( wID );
				//});
				//console.log( wResults );
				resolve( wResults );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getLiveVideos = GET_LIVE_VIDEOS;