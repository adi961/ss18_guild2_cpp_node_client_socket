const net = require('net')
const libui = require('libui-node')
const timestamp = require('unix-timestamp')
const bonjour = require('bonjour')()

var ip,
    port,
    uuid,
    userName

const socket = new net.Socket()
socket.setEncoding()

bonjour.find({ type: 'tcp' }, function (service) {
    console.log('Found an chat server:', service)
    if(service.txt.service == 'cpp'){
        ipTextBox.text = service.referer.address
        portTextBox.text = service.port
        connection.host = service.referer.address
        connection.port = service.port
    }
  })

libui.Ui.init()

var win = new libui.UiWindow('Code chat protocol', 640, 480, false)


var hbox = new libui.UiHorizontalBox()
hbox.padded = true
win.setChild(hbox)

var vbox = new libui.UiVerticalBox()
vbox.padded = true
hbox.append(vbox, true)

var nameTextBox = new libui.UiEntry()
vbox.append(nameTextBox, false)

var ipTextBox = new libui.UiEntry()
vbox.append(ipTextBox, false)

var portTextBox = new libui.UiEntry()
vbox.append(portTextBox, false)

var connectBtn = new libui.UiButton();
connectBtn.text = 'Connect'
connectBtn.onClicked(connect)
vbox.append(connectBtn, false)

var chatBox = new libui.UiMultilineEntry()
chatBox.enabled = false
chatBox.readOnly = true
vbox.append(chatBox, true)



var chatTextBox = new libui.UiEntry()
chatTextBox.enabled = false
//vbox.append(chatTextBox, false)

var sendBtn = new libui.UiButton();
sendBtn.enabled = false
sendBtn.text = 'Send >>>'
sendBtn.onClicked(sendMessage)

var sendGrid = new libui.UiGrid()
sendGrid.padded = true
sendGrid.append(chatTextBox, 0, 0, 70, 1, 0, 0, 0, 1)
sendGrid.append(sendBtn, 100, 0, 2, 1, 0, 0, 0, 1)
vbox.append(sendGrid, false)

win.onClosing(function () {
    win.close();
    libui.stopLoop();
});

win.show();

libui.startLoop();

//event callbacks
function connect() {
    if(nameTextBox.text != '' && ipTextBox.text != '' && portTextBox.text != ''){
        ip = ipTextBox.text
        socket.connect(connection, (events) => {

        })
    }else{
        chatBox.text = 'Please enter username an IP address'
    }

}

socket.on('connect', () => {
    const payload = {
        "type": "connection",
        "data":{
            "name": nameTextBox.text
        }
    }

    socket.write(JSON.stringify(payload))
    console.log('Send username')
})

function sendMessage() {
    if(chatTextBox != '') {
        const data = {
            type: "message",
            data:{
                uuid: uuid,
                content: chatTextBox.text
            }
            
        }

        socket.write(JSON.stringify(data))
        chatTextBox.text = ''
    }
    
}


function createDispMsg(payload, fromMe) {
    var message
    
    if(fromMe == false) {
        message = '### \t ' + payload.user_name.toUpperCase() + '\t at: ' + 
        timestamp.toDate(payload.timestamp)+ '\t ### \n \t\t' + payload.content + '\n###\n\n'
    } else {
        const spaces = '\t\t\t\t\t\t\t\t\t\t\t\t\t'
        message = spaces + '### \t ME\t at: ' + 
        timestamp.toDate(payload.timestamp)+ '\t ### \n \t\t' + spaces + payload.content + '\n' + spaces + '###\n\n'
    }
    return message
}

//function sendMess

socket.on('data', function(data) {
    const payload = JSON.parse(data)
    console.log('paylaod:', payload)

    if(payload.type == 'error'){
        if(payload.data.key == '-1'){
            chatBox.text = payload.data.message
        }
        console.log('error!:',payload)
    }else if(payload.type == 'uuid'){
        uuid = payload.data.uuid
        userName = nameTextBox.text
        sendBtn.enabled = true
        chatTextBox.enabled = true
        chatBox.enabled = true
        ipTextBox.enabled = false
        nameTextBox.enabled = false
        portTextBox.enabled = false
        connectBtn.enabled = false
        //sendMessage('Hello World!') 
    } else if(payload.type == 'message') {
            console.log('Received message:', payload.data)
            if(payload.data.user_name == userName){
                console.log('recieved message:', payload.data)
            chatBox.append(createDispMsg(payload.data, true))
            } else {
                console.log('recieved message:', payload.data)
            chatBox.append(createDispMsg(payload.data, false))
            }
    }
})