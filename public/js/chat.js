const socket = io();

socket.on("message", (data) => {
    console.log(data);

});

document.querySelector("#message-form").addEventListener('submit', (event) => {
    event.preventDefault();
    
    const message = event.target.elements.message.value;

    socket.emit("sendMessage", message, (confirmationMessage) => {
        console.log("The message was delivered.", confirmationMessage);
    });
});

document.querySelector("#send-location").addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert("Geo location is not supported by your browser");
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", { latitude: position.coords.latitude, longtitude: position.coords.longitude });
    });
});