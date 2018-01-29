const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Wemo = require('wemo-client');
const wemo = new Wemo();

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

wemo.discover(function(err, deviceInfo) {
  console.log('Wemo Device Found: %j', deviceInfo);

  if ( deviceInfo.deviceType === 'urn:Belkin:device:insight:1' ) {
    connectToDevice( deviceInfo );
  }

});

function connectToDevice( deviceInfo ) {
    // Get the client for the found device
    var client = wemo.client(deviceInfo);

    // You definitely want to listen to error events (e.g. device went offline),
    // Node will throw them as an exception if they are left unhandled
    client.on('error', function(err) {
      console.log('Error: %s', err.code);
    });

    // Handle BinaryState events
    client.on('binaryState', function(value) {
      console.log('Binary State changed to: %s', value);
    });

    client.on( 'insightParams', function(binaryState, instantPower, data) {
        console.log(binaryState, instantPower, data);
        io.emit( 'instantPower', instantPower );
        io.emit( 'data', data );
    } );
    //
    client.getInsightParams( function(binaryState, instantPower, data) {
        console.log(binaryState, instantPower, data);
    } );

    // Turn the switch on
    client.setBinaryState(1);
}
