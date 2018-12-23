const personal = require( "../personal.js" ).twilio;
const process = require( "process" );
const client = require('twilio')( personal.account_ssid , personal.auth_token );


var result = null;
result = client.calls
  .create({
     machineDetection: 'Enable',
     url: personal.calls.birthday.call_url ,
     to: "+1" + process.argv[ 1 ] ,
     from: personal.from_number
   })
  .then(call => console.log(call.sid))
  .done( console.log( result ) );


setInterval( function() {
	console.log( result );
} , 1000 );