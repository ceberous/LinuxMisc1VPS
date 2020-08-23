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

let VALID_NON_VOIP = false;
let CONFERENCE_NAME = false;
let CONFERENCE_ID_POOL = [];

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


// https://github.com/TwilioDevEd/call-forwarding-node/blob/master/routes/index.js
// app.post( "/twiliocallsanitizerconfrence" , function( req , res ) {
// 	let success = false;
// 	try {
// 		const response = new twilio.twiml.VoiceResponse();
// 		response.say( "Forwarding" );
// 		response.dial().conference( "meetup" , {
// 			"startConferenceOnEnter": "true"
// 		});
// 		// response.dial( personal.twilio_creds.forward_phone_number )
// 		//console.log( response );
// 		res.set('Content-Type', 'text/xml');
// 		response.hangup();
// 		return res.send( response.toString() );
// 		success = true;
// 	}
// 	catch( e ) { console.log( e ); }
// 	if ( !success ) {
// 		const twiml = new twilio.twiml.VoiceResponse();
// 		twiml.say( "wadu" );
// 		res.writeHead( 200 , { "Content-Type": "text/xml" });
// 		res.end( twiml.toString() );
// 	}
// });

app.post( "/twiliocallsanitizerconfrence" , function( req , res ) {
	let success = false;
	try {
		const response = new twilio.twiml.VoiceResponse();
		response.say( "Forwarding" );
		response.dial().conference( "meetup" , {
			"startConferenceOnEnter": "true"
		});
		// response.dial( personal.twilio_creds.forward_phone_number )
		//console.log( response );
		res.set('Content-Type', 'text/xml');
		response.hangup();
		return res.send( response.toString() );
		success = true;
	}
	catch( e ) { console.log( e ); }
	if ( !success ) {
		const twiml = new twilio.twiml.VoiceResponse();
		twiml.say( "wadu" );
		res.writeHead( 200 , { "Content-Type": "text/xml" });
		res.end( twiml.toString() );
	}
});


app.post( "/twiliojoinconference" , function( req , res ) {
	const request_conference_name = req.query.id;
	if ( CONFERENCE_ID_POOL.length > 0 ) {
		if ( CONFERENCE_ID_POOL[ 0 ] === request_conference_name ) {
			// We return TwiML to enter the same conference
			//const twiml = new twilio.twiml.VoiceResponse();
			let joining_name = CONFERENCE_ID_POOL.pop();
			// twiml.dial( function( node ) {
			// 		node.conference( joining_name , {
			// 		startConferenceOnEnter: true
			// 	});
			// });
			const twiml = new twilio.twiml.VoiceResponse();
			twiml.dial( function( node ) {
				node.conference( joining_name , {
					//waitUrl: "http://twimlets.com/holdmusic?Bucket=com.twilio.music.rock",
					startConferenceOnEnter: false
				});
			});
			res.set( 'Content-Type' , 'text/xml' );
			res.send( twiml.toString() );
			return;
		}
	}
	twiml.say( "wadu" );
	res.writeHead( 200 , { "Content-Type": "text/xml" });
	res.end( twiml.toString() );
});

function ConnectParty( to_number , from_number , confrence_name ) {
	return new Promise( function( resolve , reject ) {
		try {
			// response.dial().conference( confrence_name ).create({
			// 	from: from_number ,
			// 	to: to_number
			// }).then( participant => {
			// 	console.log( participant.callSid );
			// 	resolve();
			// 	return;
			// });


			//var VoiceResponse = require('twilio').twiml.VoiceResponse;
			let twilio_client = require( "twilio" )( personal.twilio_creds.ACCOUNT_SID , personal.twilio_creds.AUTH_TOKEN );
			//const response = new twilio.twiml.VoiceResponse();
			console.log( `"Connnecting: ${to_number} to ${confrence_name}` );
			twilio_client.conferences( confrence_name ).create({
				from: from_number ,
				to: to_number
			}).then( participant => {
				console.log( participant.callSid );
				resolve();
				return;
			});
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function ConnectBothParties( party_one = {} , party_two = {} , confrence_name ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const result = await Promise.all([
				ConnectParty( party_one.to , party_one.from , confrence_name ) ,
				ConnectParty( party_two.to , party_two.from , confrence_name )
			]);
			resolve();
			return;
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}

function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

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
									console.log( "Its a real non-voip call!" );
									console.log( carrier_type );
									console.log( "From: " +  req.body["Caller"] )
									console.log( "Forwarding To: " + personal.twilio_creds.conference_pivot_number );
									await ConnectBothParties(
										{
											to: req.body["Caller"] ,
											from: personal.twilio_creds.from_phone_number
										} ,
										{
											to: personal.twilio_creds.forward_phone_number ,
											from: personal.twilio_creds.from_phone_number
										} ,
										"wadu"
									);
									const response = new twilio.twiml.VoiceResponse();
									response.say( "connected" );
									res.set('Content-Type', 'text/xml');
									//response.hangup();
									return response.send( response.toString() );
									success = true;
								}
								else if ( carrier_type === "voip" ) {
									console.log( "Its a voip call!" );
									console.log( carrier_type );
									console.log( "From: " +  req.body["Caller"] )
									console.log( "Forwarding To: " + personal.twilio_creds.conference_pivot_number );

									// setTimeout( function() {
									// 	ConnectBothParties(
									// 		{
									// 			to: req.body["Caller"] ,
									// 			from: personal.twilio_creds.from_phone_number
									// 		} ,
									// 		{
									// 			to: personal.twilio_creds.forward_phone_number ,
									// 			from: personal.twilio_creds.from_phone_number
									// 		} ,
									// 		"wadu"
									// 	);
									// } , 1000 );

									// const response = new twilio.twiml.VoiceResponse();

									//response.set( 'Content-Type' , 'text/xml' );
									//response.say( "calling you back" );
									// response.say( "calling you back" );
									// response.redirect({
									// 	method: 'POST'
									// }, 'https://ceberous.org/' );
									// let VALID_NON_VOIP = false;
									// let VALID_NON_VOIP_NUMBER_PHONE_NUMBER = false;

									//response.set( 'Content-Type' , 'text/xml' );
									//response.hangup();
									// let party_one_response = await response.dial().conference( confrence_name ).create({
									// 	from: req.body["Caller"] ,
									// 	to: from: personal.twilio_creds.from_phone_number
									// };
									// let party_two_response = await response.dial().conference( confrence_name ).create({
									// 	to: personal.twilio_creds.forward_phone_number
									// 	from: personal.twilio_creds.from_phone_number ,
									// };
									// const response = new twilio.twiml.VoiceResponse();
									// VALID_NON_VOIP = req.body["Caller"];
									// CONFERENCE_NAME = "wadu";
									// response.say(
									// 	//{ voice:'woman' } , 'Welcome to our hotline. This could take a moment, please wait.')
									// 	//waitUrl: "http://twimlets.com/holdmusic?Bucket=com.twilio.music.rock",
									// 	//startConferenceOnEnter: false
									// .dial( {} , function( err ) {
									// 	this.conference( 'example' );
									// });

									// conference name will be a random number between 0 and 10000
									const conferenceName = Math.floor( Math.random() * 10000 ).toString();
									CONFERENCE_ID_POOL.push( conferenceName );
									CONFERENCE_ID_POOL.push( conferenceName );
									console.log( CONFERENCE_ID_POOL );

									// Create a call to your mobile and add the conference name as a parameter to
									// the URL.
									let twilio_client = require( "twilio" )( personal.twilio_creds.ACCOUNT_SID , personal.twilio_creds.AUTH_TOKEN );

									twilio_client.calls.create({
										from: personal.twilio_creds.conference_pivot_number,
										to: personal.twilio_creds.forward_phone_number ,
										url: "https://ceberous.org/twiliojoinconference?id=" + conferenceName
									});
									twilio_client.calls.create({
										from: personal.twilio_creds.conference_pivot_number,
										to: req.body["Caller"] ,
										url: "https://ceberous.org/twiliojoinconference?id=" + conferenceName
									});

									// Now return TwiML to the caller to put them in the conference, using the
									// same name.
									const twiml = new twilio.twiml.VoiceResponse();
									// twiml.dial( function( node ) {
									// 	node.conference( conferenceName , {
									// 		//waitUrl: "http://twimlets.com/holdmusic?Bucket=com.twilio.music.rock",
									// 		startConferenceOnEnter: false
									// 	});
									// });
									res.set('Content-Type', 'text/xml');
									res.say( "calling you back" );
									res.send( twiml.toString());
									//return res.send( response.toString() );
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