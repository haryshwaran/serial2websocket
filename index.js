var SerialPort = require('serialport');
var webSocket = require('ws');
var args = process.argv.slice(2);
const wss = new WebSocket.Server({ port: 8080 });

let mode=args[0];
var port=undefined
if(mode == 'list'){
    listSerial();
}

if(mode == 'start'){
    if(typeof args[1] == 'undefined'){
        console.log('FATAL: serial port ID missing, exiting');
        process.exit(1);
    }
    let portID = args[1]
    startSerial(portID)
}

wss.on('connection', function connection(ws) {
      ws.on('message', function incoming(message) {
              console.log('received: %s', message);
                });

        ws.send('something');
});

function startSerial(portID){
    console.log('Starting serial port');
    port = new SerialPort(portID,{
        baudRate: 9600,
        parser: SerialPort.parsers.readline('\n')
    });
    port.on('open', function(){
        console.log('Serial Port Opend');
        port.on('data', function(data){
            console.log(data.toString());
        });
    });

    port.on('error', function(err) {
        console.log('Error: '+err.message);
    });

    port.on('disconnect', function () {
        console.log('Serial port disconnected');
    })
}

function listSerial(){
    SerialPort.list(function (err, ports) {
      ports.forEach(function(port) {
        if(typeof port.manufacturer != 'undefined'){
                console.log(port.comName);
                console.log(port.pnpId);
                console.log(port.manufacturer);
            }
     });
    });
}

function closeSerial(){

}

process.on('SIGINT',function () {
    console.log('Caught Interrupt,closing serial port');
    if(port.isOpen()){
        port.close(function() {
            console.log('Closed serial port, exiting');
            process.exit(0)
        });
    }else{
        process.exit(0);
    }
})
