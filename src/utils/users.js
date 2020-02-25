const users = [];


// add user, remove user, get user, gets users in a room

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!username || !room){
        return {
            error: "Username and room are required."
        }
    }

    // check for existing user
    const existingUser = users.find((user) => user.room == room && user.username === username);
    if(existingUser){
        return {
            error: "Username is in use."
        }
    }

    // store user
    const user = {
        id,
        username,
        room
    }

    users.push(user);
    return { user }
}

const removeUser = (id) => {
     // check for existing user
     const index = users.findIndex((user) => user.id === id);
     if(index !== -1){
        return users.splice(index,1)[0];
     } else {
         return {
             error: "User not found"
         }
     }
}