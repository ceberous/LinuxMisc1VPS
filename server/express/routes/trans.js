const express = require( "express" );
const router = express.Router();

const transCTRL = require( "../controllers/trans.js" );

router.post( "/text/" , transCTRL.transText );

module.exports = router;