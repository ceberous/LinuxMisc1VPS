require("shelljs/global");
const fs = require( "fs" );
const path = require("path");
const StringDecoder = require("string_decoder").StringDecoder;
const decoder = new StringDecoder( "utf8" );
const spawn = require("child_process").spawn;

function W_SLEEP( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
module.exports.sleep = W_SLEEP;

function PKILL_PROCESS( wProcessName ) {
	return new Promise( function( resolve , reject ) {
		try {
			exec( "sudo pkill -9 " + wProcessName , { silent: true ,  async: false } );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.pkillProcess = PKILL_PROCESS;

var PyManager = null;
function START_PY_SCRIPT( wName , ...args ) {
	try {
		const wPyScript = path.join( __dirname , ".." ,  "py_scripts" , wName );
		var arg_list = [ wPyScript ];
		arg_list = arg_list.concat( args );
		console.log( arg_list );
		PyManager = spawn( "python3" , arg_list );
		PyManager.stdout.on( "data" , function( data ) {
			var message = decoder.write( data );
			message = message.trim();
			console.log( message );
		});
		PyManager.stderr.on( "data" , function(data) {
			var message = decoder.write(data);
			message = message.trim();
			console.log( message );
		});			
	}
	catch( error ) { console.log( error ); return( error ); }
}
module.exports.startPYScript = START_PY_SCRIPT;


function START_PROCESS( wName , wArg1 ) {
	try {
		var exec_string = wName;
		if ( wArg1 ) { exec_string = exec_string + " " + wArg1; }
		//exec_string = exec_string + " &";
		console.log( "Launching Process --> " );
		console.log( exec_string );
		exec( exec_string , { silent: true ,  async: false } );
		console.log( "Done Launching" );
		return;
	}
	catch( error ) { console.log( error ); return( error ); }
}
module.exports.startProcess = START_PROCESS;


const RestreamLaunchFP = path.join( __dirname , "./restreamLauncher.js" );
const ConfigFP = path.join( __dirname , ".." , "py_scripts" , "config.json" );
function START_RESTREAM_LAUNCHER( wUserName ) {
	try {
		var config = require( "../py_scripts/config.json" );
		config[ "twitch_channel_name" ] = wUserName;
		fs.writeFileSync( ConfigFP , JSON.stringify( config ) , "utf8" );
		var wEX1 = exec( "node " + RestreamLaunchFP , { silent:true , async: false });
		if ( wEX1.stderr.length > 1 ) { console.log( "ERROR --> Could not Launch Restream" ); return null; }
		console.log( "Launched Restream" );
	}
	catch( error ) { console.log( error ); return( error ); }
}
module.exports.startRestreamLauncher = START_RESTREAM_LAUNCHER;