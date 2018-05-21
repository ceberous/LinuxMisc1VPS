function sendJSONResponse( res , status , content ) { if ( status ) { res.status( status ); } res.json( content ); }

const trans_text_command = "/usr/local/bin/transText";
function TRANS_TEXT( wText ) {
	const result = require( "../../utils/generic.js" ).runCommandGetOutput( trans_text_command + " '" + wText + "'" );
	const final_obj = { data: { translations: [ { translatedText: result } ] } };
	return final_obj;
}

const TransKey = require( "../../../personal.js" ).transKey;
module.exports.transText = function( req , res ) {
	if ( req.body.key !== TransKey ) { sendJSONResponse( res , 200 , { result: "" } ); return; }
	if ( !req.body.q ) { sendJSONResponse( res , 200 , { result: "" } ); return; }
	const trans_txt = TRANS_TEXT( decodeURIComponent( req.body.q ) );
	sendJSONResponse( res , 200 , trans_txt ); 
};