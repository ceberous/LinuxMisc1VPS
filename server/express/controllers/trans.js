function sendJSONResponse( res , status , content ) { if ( status ) { res.status( status ); } res.json( content ); }

const trans_text_command = "/usr/local/bin/transText";
function TRANS_TEXT( wText ) {
	const result = require( "../../utils/generic.js" ).runCommandGetOutput( trans_text_command , wText );
	const final_obj = { data: { translations: [ { translatedText: result } ] } };
	return final_obj;
}

const path = require( "path" );
const process = require( "process" );
const PersonalFilePath = path.join( process.env.HOME , "WORKSPACE" , "personal_linux_misc_1.js" );
const TransKey = require( PersonalFilePath ).transKey;
module.exports.transText = function( req , res ) {
	if ( !req.body ) { sendJSONResponse( res , 200 , { result: "" } ); return; }
	if ( !req.body.key ) { sendJSONResponse( res , 200 , { result: "" } ); return; }
	if ( req.body.key !== TransKey ) { sendJSONResponse( res , 200 , { result: "" } ); return; }
	if ( !req.body.q ) { sendJSONResponse( res , 200 , { result: "" } ); return; }
	const trans_txt = TRANS_TEXT( decodeURIComponent( req.body.q ) );
	sendJSONResponse( res , 200 , trans_txt ); 
};