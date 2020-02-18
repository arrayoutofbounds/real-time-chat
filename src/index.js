const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const app = express()
const server = http.createServer(app);
const io = socketio(server); // configure socket io with the server created. Socket io needs it to be called with server explicity. Because express does it implicitly we could not access it before.

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
 
// when a given client connects
io.on("connection", (socket) => {
    console.log("new web socket connection");

    socket.emit("message", "Welcome");

    socket.on("sendMessage", (message) => {
        io.emit('message', message); // emits to all connection
    });
});
 
server.listen(port, () => {
    console.log(`Listening on ${port}`)
}); 