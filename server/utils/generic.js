require("shelljs/global");
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
		exec( exec_string , { silent: true ,  async: false } );
	}
	catch( error ) { console.log( error ); return( error ); }
}
module.exports.startProcess = START_PROCESS;