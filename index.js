import { SerialPort } from 'serialport'
import convert from 'color-convert'


console.log("Scifflebox tester");

const port = new SerialPort({
    path: 'COM4',
    baudRate: 921600
})


port.on('data', bufferMsg);



let msgBuffer = Buffer;

const WAITING = 0;
const START_RECEIVED = 1;
const PORT_NUM_RECEIVED = 2;
const END_RECEIVED = 3;

let readState = WAITING;
let currentScanner = -1;
let currentMsg = "";

function bufferMsg(data) {
    for (const byte of data.values()) {
        switch (byte) {
            case 17:               
                currentMsg = "";
                break;
            case 18:               
                console.log(currentMsg)
                break;                        
            default:
                if (byte < 32) {
                    currentMsg += "Scanner " + byte + ": ";               
                } else {
                    currentMsg+=String.fromCharCode(byte);
                }
                break;
        }
    }
}

function createTPM2Message(data) {
    const HEADER = [0xC9]; // 0
	const TYPE = [0xDA]; // 1					
	const ENDBYTE = [0x36];

    //cal length
    var length_upper = Math.floor(data.length / 256);
	var length_lower = data.length % 256;

    var data = HEADER.concat(TYPE).concat([length_upper, length_lower]).concat(data).concat(ENDBYTE);
	var buf = Buffer.from(data);
    return buf;
}

function sendTPM2Frame(data) {
    const buf = createTPM2Message(data);
    // console.log(buf);
    port.write(buf);
}

let baseHue = 0;
let baseColor = () => { return convert.hsv.rgb(baseHue, 100, 100) };


setInterval(() => {
    baseHue += 1;
    if (baseHue > 360) {
        baseHue = 0;
    }

    let videoFrame = [];   

    for (let i = 0; i < 24*24; i++) {
        videoFrame = [...videoFrame, ...baseColor()];
    }

    sendTPM2Frame(videoFrame);    
}, 30);




