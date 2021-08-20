const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

//getting username and room from url using cdn of Qs library
const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
})

//console.log(username, room);

const socket = io();

//Join chatroom
socket.emit("joinRoom", {username,room});

//get room info
socket.on("roomUsers", ({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
})


//message from server
socket.on("message", message =>{
   // console.log(message);
    outputMessage(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//updating chats from db
socket.on("retrieved", (chats)=>{
    if(chats.length){
        for(var x = 0;x <chats.length;x++){
            // Build out message div
            console.log(chats[x]);
            const div = document.createElement("div");
            div.classList.add("message");
            div.innerHTML = `<p class="meta">${chats[x].username}<span> ${chats[x].time}</span></p>
            <p class="text">
                ${chats[x].text}
            </p>`;
            document.querySelector('.chat-messages').appendChild(div); 
        }
    }
});

//Message submit
chatForm.addEventListener("submit", (e)=>{

    //preveting form from submission in file i.e. it's usual behaviour
    e.preventDefault();

    //Get msg content
    const msg = e.target.elements.msg.value;


    //emitting the msg to server
    socket.emit("chatMessage", msg);

    //clearing msg bar
    e.target.elements.msg.value = "";
    //again targeting msg bar
    e.target.elements.msg.focus();

});

//output msg from dom
function outputMessage(message){
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${message.username}<span> ${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;                                                                                                                          
    document.querySelector('.chat-messages').appendChild(div);
}


//Add room name to dom
function outputRoomName(room){
    roomName.innerText=room;
}

//Add user names to dom
function outputUsers(users){
    userList.innerHTML=`
        ${users.map(user => `<li>${user.username}</li>`).join("")}`;
}