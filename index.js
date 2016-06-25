/*
 * run with
 * node --harmony_destructuring . /dev/cu.usbmodem134
 */

'use strict';
const Firebase = require('firebase');
const config = require('./config.json');
const serialport = require("serialport");
const SerialPort = serialport.SerialPort;
const GRID_WIDTH = 32;
const GRID_HEIGHT = 16;
const DB_EVENT_CHILD_ADDED = 'child_added';
const DB_EVENT_CHILD_CHANGED = 'child_changed';
const port_path = process.argv[process.argv.length-1];

const port = new SerialPort(port_path, {
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1
});

// map 255 (or anything over 0) to 1, else 0
function colorVal(val){
  return val > 0 ? 1 : 0;
}

function rgbToArray(color){
  return color.substring(4, color.length-1)
    .replace(/ /g, '')
    .split(',');
}

function posColorToParts(pos, color){
  var posParts = pos.split(' ');
  var colorParts = rgbToArray(color);
  return {
    x : posParts[0],
    y : posParts[1],
    r : colorVal(colorParts[0]),
    g : colorVal(colorParts[1]),
    b : colorVal(colorParts[2])
  };
}

function toSerialCommandBuf({x,y,r,g,b}){
  return Buffer.from(`^${x} ${y} ${r} ${g} ${b};`);
}

function sendSerialCommands(cmdBuf){
  port.write(cmdBuf, function(err, bytesWritten) {
    if (err) {
      return console.log('Error: ', err.message);
      // bail out
      throw err;
    }
    console.log(bytesWritten, 'bytes written');
  });
}

function debugSerialCommands(cmdBuf){
  console.log( cmdBuf.toString() );
}

function dbChildChanged(sn){
  /* key : 3 1
   * val : rgb(0, 255, 255)
   */
  console.log(sn.key, sn.val());
  // debugSerialCommands(toSerialCommandBuf( posColorToParts(sn.key, sn.val()) ));
  sendSerialCommands(toSerialCommandBuf( posColorToParts(sn.key, sn.val()) ));
}

Firebase.initializeApp({
  databaseURL: "https://pixelmaker-be478.firebaseio.com/",
  serviceAccount: config
});

port.on('open', function () {
  const fbRef = Firebase.database().ref();
  fbRef.on(DB_EVENT_CHILD_ADDED, dbChildChanged);
  fbRef.on(DB_EVENT_CHILD_CHANGED, dbChildChanged);
});
