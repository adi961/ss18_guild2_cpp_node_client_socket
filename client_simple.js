
const net = require('net')

const connection = {
    host: 'localhost',
    port: '8888'
}

const data = {
    "type": "connection",
    "data":{
        "name": "Adrian"
    }
    
}

const socket = new net.Socket()
socket.setEncoding()

socket.connect(connection, (events) => {

})

socket.on('connect', () => {
    console.log('Connected to server"')
    console.log('sending data', data)
    socket.write(JSON.stringify(data))
})

socket.on('data', (data) => {
    console.log('Data:', data.toString())
})