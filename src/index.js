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

    socket.emit("message", "Welcome"); // emit to just this connection
    socket.broadcast.emit("message", "A new user has joined"); //send to all except this socket (user)

    socket.on("sendMessage", (message) => {
        io.emit('message', message); // emits to all connection
    });

    socket.on("sendLocation", (location) => {
        io.emit('message', `https://google.com/maps?q=${location.latitude},${location.longtitude}`);
    });

    // use this for when a socket gets disconnected
    socket.on('disconnect', () => {
        io.emit("message", "A user has left"); // the prev user has left so no need for broadcast.
    });
});
 
server.listen(port, () => {
    console.log(`Listening on ${port}`)
}); 