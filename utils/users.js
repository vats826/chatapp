const users = [];

function userJoin(id, username, room){
    const user = {id, username, room};
    users.push(user);
    return user;
}

//get current user in room == id given                                                                                             
function getCurrentUser(id){
    return users.find(user => user.id === id);
}

//to get all users in room
function getRoomUsers(room){
    return users.filter(user => user.room === room);
}

//user leave chat
function userLeft(id){
    const idx = users.findIndex(user => user.id === id);
    if(idx !== -1){
        return users.splice(idx, 1)[0];
    }
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeft,
    getRoomUsers
};