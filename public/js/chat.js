const socket = io();

socket.on("message", (data) => {
    console.log(data);

});

document.querySelector("#message-form").addEventListener('submit', (event) => {
    event.preventDefault();
    
    const message = event.target.elements.message.value;

    socket.emit("sendMessage", message);
});