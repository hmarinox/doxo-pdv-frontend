
/* 
 https://www.toledobrasil.com/blob/manuals/187_pt_manual_1663007651.pdf - Protocolo Prt1
SEND DATA

Este protocolo de comunicação utiliza:
1 Stop Bit;
8 Bits de dados;
Sem paridade.
O envio dos dados é iniciado, quando a balança receber o comando de solicitação “ENQ”.
ENQ = Caracter ASCII (05H) enviado pelo dispositivo externo.

RECEIVED DATA
[STX][PPPPP][ETX] onde:
STX = Caracter ASCII (02 H) – Início da transmissão.
PPPPP = 5 caracteres ASCII relativos ao peso sem ponto decimal. O ponto deve ser tratado via software.
ETX = Caracter ASCII (03 H) – Término da transmissão
*/

const { SerialPort } = require("serialport")

const SIGNAL_CONTROL_ENQ = 5;


let weight = 0;

async function serialList() {
    const list = await SerialPort.list();
     list.forEach( item => console.log( item ) )
    return list.filter((e) => e.productId == "7523").map((e) => e.path)[0];
};

async function SetSerialPort() {
    const path = await serialList()

    if (!path) return null
    const portScale = new SerialPort({
        path: path,
        baudRate: 9600,
        dataBits: 8,
        parity: "none",
        stopBits: 1,
        autoOpen: false,
        

    });
    return portScale
}
let text = "";
function ReceiveData(data) {
    const text = data.toString("ascii");
    console.log("data = ", text)
    const relevantText = text.substring(1, 6);
    const weightInGrams = parseFloat(relevantText);
    const weightInKilograms = weightInGrams / 1000;
    weight = 0;
    weight = parseFloat(weightInKilograms.toFixed(3));
}

async function OpenPort() {
    return new Promise(async (resolve) => {
        const port = await SetSerialPort()
        if (!port)
           return resolve(null)
        if (!port.isOpen) {
            console.log("aqui", port)
            port.open((err) => {
                if (err) {
                    console.log("open error = ",err)
                    return resolve(null)
                }
                console.log("Aberta com sucesso")
                port.on("data", ReceiveData)
            })
        }
        resolve(port)
    })
}
function SendData(port) {
    return new Promise(async (resolve) => {
        if (!port)
            resolve(null)
        const value = Buffer.from([SIGNAL_CONTROL_ENQ]);

        await port.write(value);
        setTimeout(() => {
            resolve(weight)
        }, 25)
    })
}


// export const SerialScale =
// {
//     OpenPort,
//     SendData
// };

async function init() {

    const port = await OpenPort()
    const result = await SendData(port)
    port.on('close', () => {
        console.log("close")
    })
    if (port.isOpen)
        await port.close()
    console.log("result = ", result)
    text = "";
}

init()