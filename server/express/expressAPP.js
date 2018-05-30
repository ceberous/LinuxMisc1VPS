const express = require( "express" );
const path = require( "path" );
const bodyParser = require( "body-parser" );
const ejs = require( "ejs" );

const app = express();
const server = require( "http" ).createServer( app );
const port = process.env.PORT || 6969;

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

module.exports = app;