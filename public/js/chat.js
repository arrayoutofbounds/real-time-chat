const socket = io();

// DOM elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//QS
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true }); // gets query params and ignore "?"

const autoScroll = () => {
    // get new message element
    const $newMessage = $messages.lastElementChild

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight;

    //height of messages container
    const containerHeight = $messages.scrollHeight;

    // how far have i scrolled from the top
    const scrollOffset = $messages.scrollTop + visibleHeight;
    
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight; // total available content we can scroll. scroll to the bottom
    }
}

socket.on("message", (message) => {
    console.log(message);

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll()
});

socket.on("locationMessage", (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll()
})

document.querySelector("#message-form").addEventListener('submit', (event) => {
    event.preventDefault();

    $messageFormButton.setAttribute("disabled", 'disabled');
    
    const message = event.target.elements.message.value;

    socket.emit("sendMessage", message, (error) => {
        $messageFormButton.removeAttribute("disabled"); // re enable regardless of the sent state
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error){
            return console.log(error); 
        }
        console.log("The message was delivered.");
    });
});

document.querySelector("#send-location").addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert("Geo location is not supported by your browser");
    }

    $sendLocationButton.setAttribute("disabled", 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", { latitude: position.coords.latitude, longtitude: position.coords.longitude }, () => {
            $sendLocationButton.removeAttribute("disabled");
        });
    });
});

socket.emit("join", {username, room }, (error) => {
    if(error){
        alert(error);
        location.href = '/';
    }
});

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector("#sidebar").innerHTML = html;
});