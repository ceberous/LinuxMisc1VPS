const express = require( "express" );
const path = require( "path" );
const process = require( "process" );
const bodyParser = require( "body-parser" );
const ejs = require( "ejs" );
const request = require( "request" );

const app = express();
const server = require( "http" ).createServer( app );
const port = process.env.PORT || 6969;

const personal = require( "../../personal.js" );

const twilio = require( "twilio" );

function sendJSONResponse( res , status , content ) { if ( status ) { res.status( status ); } res.json( content ); }

// https://www.twilio.com/docs/lookup/tutorials/carrier-and-caller-name
function TwilioLookupNumber( phone_number ) {
	return new Promise( function( resolve , reject ) {
		try {
			let twilio_client = require( "twilio" )( personal.twilio_creds.ACCOUNT_SID , personal.twilio_creds.AUTH_TOKEN );
			twilio_client.lookups.phoneNumbers( phone_number )
			.fetch({
				type: ['carrier']
			})
			.then( number_info => {
				console.log( number_info.carrier );
				resolve( number_info );
				return;
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

// View Engine Setup
app.set( "views" , path.join( __dirname , "../../client" , "views" ) );
app.set( "view engine" , "ejs" );
app.engine( "html" , require( "ejs" ).renderFile );

// Set Static Folder
app.use( express.static( path.join( __dirname , "../../client"  ) ) );

// Setup Middleware
//app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );


// Cross-Origin Stuff
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});


// Main-Routes
app.get( "/" , function( req , res , next ) {
	res.render( 'index.html' );
});

const transRoutes = require( "./routes/trans.js" );
app.use( "/trans/" , transRoutes );

// const specialRoutes = require( "./routes/special.js" );
// app.use( "/special/" , specialRoutes );

const AccessToken = require( "twilio" ).jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const PersonalFilePath = path.join( process.env.HOME , "WORKSPACE" , "personal_linux_misc_1.js" );
const twilio_creds = require( PersonalFilePath ).twilio_creds;
const ckey = require( PersonalFilePath ).ckey;
const ckey_length = require( PersonalFilePath ).ckey_length;
app.post( "/twiliovtoken" , function( req , res ) {

	if ( !req.body.ckey ) { console.log( "No CKEY" ); sendJSONResponse( res , 200 , { result: "" } ); return; }
	if ( req.body.ckey.length !== ckey_length ) { console.log( "CKEY Length === " + req.body.ckey.length.toString() ); sendJSONResponse( res , 200 , { result: "" } ); return; }
	if ( req.body.ckey !== ckey ) { console.log( "CKEY Sent === " + req.body.ckey ); console.log( "CKEY ===" + ckey );  sendJSONResponse( res , 200 , { result: "" } ); return; }

	//var identity = randomName();
	var identity = twilio_creds.groupVideo3.identity;

	// Create an access token which we will sign and return to the client,
	// containing the grant we just created.
	var token = new AccessToken(
		twilio_creds.ACCOUNT_SID ,
		twilio_creds.groupVideo3.API_KEY ,
		twilio_creds.groupVideo3.API_SECRET
	);

	// Assign the generated identity to the token.
	token.identity =  Math.random().toString( 36 ).substring( 7 );

	// Grant the access token Twilio Video capabilities.
	var grant = new VideoGrant();
	token.addGrant( grant );

	// Serialize the token to a JWT string and include it in a JSON response.
	res.send({
		identity: identity,
		token: token.toJwt()
	});

});

app.post( "/twiliocall" , function( req , res ) {

	// if ( !req.body.ckey ) { console.log( "No CKEY" ); sendJSONResponse( res , 200 , { result: "" } ); return; }
	// if ( req.body.ckey.length !== ckey_length ) { console.log( "CKEY Length === " + req.body.ckey.length.toString() ); sendJSONResponse( res , 200 , { result: "" } ); return; }
	// if ( req.body.ckey !== ckey ) { console.log( "CKEY Sent === " + req.body.ckey ); console.log( "CKEY ===" + ckey );  sendJSONResponse( res , 200 , { result: "" } ); return; }

	const twiml = new twilio.twiml.VoiceResponse();
	twiml.say( "Haley is Awake , Haley is Awake , Haley is Awake" );
	res.writeHead( 200 , { "Content-Type": "text/xml" });
	res.end( twiml.toString() );

});

app.post( "/twiliocallwater" , function( req , res ) {

	const twiml = new twilio.twiml.VoiceResponse();
	twiml.say( "Haley Needs a Drink of Water , Haley Needs a Drink of Water , Haley Needs a Drink of Water" );
	res.writeHead( 200 , { "Content-Type": "text/xml" });
	res.end( twiml.toString() );

});

app.post( "/twiliobirthdaycall" , function( req , res ) {

	const twiml = new twilio.twiml.VoiceResponse();
	twiml.play( { loop: 1 } , personal.twilio.calls.birthday.play_url );
	res.writeHead( 200 , { "Content-Type": "text/xml" });
	res.end( twiml.toString() );

});

// https://www.twilio.com/console/lookup
app.post( "/twiliocallsanitizer" , async function( req , res ) {
	let success = false;
	try {
		let addons = JSON.parse( req.body["AddOns"] );
		// console.log( addons );
		if ( addons ) {
			if ( addons["results"] ) {
				if ( addons["results"]["twilio_carrier_info"] ) {
					if ( addons["results"]["twilio_carrier_info"]["result"] ) {
						if ( addons["results"]["twilio_carrier_info"]["result"]["carrier"] ) {
							let carrier_type = addons["results"]["twilio_carrier_info"]["result"]["carrier"]["type"];
							if ( carrier_type ) {
								if ( carrier_type !== "voip" ) {
									console.log( carrier_type );
									console.log( req.body["Caller"] )
									console.log( personal.twilio_creds.forward_phone_number );
									console.log( "Its a real non-voip call!" );
									const response = new twilio.twiml.VoiceResponse();
									//response.say( "Connecting" );
									response.dial( personal.twilio_creds.forward_phone_number , {
										//hangupOnStar: "true"
									});
									//console.log( response );
									//res.set('Content-Type', 'text/xml');
									return res.send( response.toString() );
									success = true;
								}
							}
						}
					}
				}
			}
		}
	}
	catch( e ) { console.log( e ); }
	if ( !success ) {
		const twiml = new twilio.twiml.VoiceResponse();
		twiml.say( "wadu" );
		res.writeHead( 200 , { "Content-Type": "text/xml" });
		res.end( twiml.toString() );
	}
});

app.get( "/rainguage" , function( req , res ) {


	console.log( req );
	console.log( req.params );
	console.log( req.query );
	console.log( req.body );

	sendJSONResponse( res , 200 , { result: "10 inches" } );

});

app.post( "/radar" , function( req , res ) {


	// console.log( req );
	// console.log( req.params );
	// console.log( req.query );
	// console.log( req.body );

	if ( req["headers"]["key"] === personal.radarKey ) {
		console.log( personal.radarKey );
		console.log( "ok , we need to send message to raspi via ssh tunnel to open radar on tv" );

		request.get( 'http://localhost:9003/radar' , function( radar_err , radar_res , radar_body ) {
			sendJSONResponse( res , 200 , { 'fulfillmentText': "ok, opening radar on tv" } );
		});

	}
	else {
		sendJSONResponse( res , 200 , { 'fulfillmentText': "love siento" } );
	}

});

module.exports = app;