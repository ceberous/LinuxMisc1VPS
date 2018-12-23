#!/usr/bin/python3
import time , sys , os
from twilio.rest import Client
sys.path.insert( 1 , os.path.join( sys.path[0] , '..' ) )
from personal import *
TwilioClient = Client( twilioAccountSSID , twilioAuthToken )
toNumber = "+1" + sys.argv[ 1 ]
# machine_detection="Enable" ,
new_call = TwilioClient.calls.create(  url=twilioBirthdayCallURL , to=toNumber , from_=twilioFromNumber , method="POST" )

answered = False
for i in range( 500 ):
    time.sleep( 1 )
    new_call = new_call.update()
    status = new_call.status
    print( status )
    if status == "in-progress":
    	answered = True