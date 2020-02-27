const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const { generateMessage, generateLocationMessage } = require("./utils/messages");

const app = express()
const server = http.createServer(app);
const io = socketio(server); // configure socket io with the server created. Socket io needs it to be called with server explicity. Because express does it implicitly we could not access it before.

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
 
// when a given client connects
io.on("connection", (socket) => {
    console.log("new web socket connection");

    // socket.emit("message", generateMessage("Welcome!")); // emit to just this connection
    // socket.broadcast.emit("message", generateMessage("A new user has joined")); //send to all except this socket (user)

    socket.on("join", ({ username, room }, callback) => {
        const {error, user } = addUser({ id: socket.id, username, room }); // socket id is unique

        if(error){
            return callback(error); // let client know that joining failed with error
        }

        socket.join(user.room); // join a given chatroom

        // more specific emit events where it sends to people only in the room
        socket.emit("message", generateMessage("Admin", "Welcome!"));
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined.`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback(); // letting client know that the joining was successfull without an error
    });

    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if(filter.isProfane(message)){
            return callback("Profanity is not allowed.");
        }

        io.to(user.room).emit('message', generateMessage(user.username, message)); // emits to all connection
        //io.emit('message', generateMessage(message)); // emits to all connection
        callback();
    });

    socket.on("sendLocation", (location, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longtitude}`));
        callback();
    });

    // use this for when a socket gets disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left.`)); // the prev user has left so no need for broadcast.
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});
 
server.listen(port, () => {
    console.log(`Listening on ${port}`)
}); 