const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const MongoClient  = require('mongodb').MongoClient;
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeft, getRoomUsers } = require("./utils/users");


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 4000;
const botname = "ChatApp";


const url = "mongodb+srv://vats8:MongoConnect@cluster0.s2vxl.mongodb.net/chatapp-message?retryWrites=true&w=majority"

app.use(express.static(path.join(__dirname, "public")));

const client = new MongoClient(url);

client.connect(function (err) {
    if (err) {
        throw err;
    }

    console.log('MongoDB connected...');
    //Run when some client is connected
    const db = client.db("ChitChat");
    io.on("connection", socket => {
        socket.on("joinRoom", ({ username, room }) => {
            const user = userJoin(socket.id, username, room);
            socket.join(user.room);
            //------------------------retrieving chats from db
            const collectionName = db.collection(user.room);
            // Get chats from mongo collection
            collectionName.find().limit(100).sort({ _id: 1 }).toArray(function (err, res) {
                if (err) {
                    throw err;
                }

                // Emit the messages
                socket.emit("retrieved", res);
                            //welcome user
            socket.emit("message", formatMessage(botname, `Hii ${user.username}... \n Welcome to ChatApp :-)`));
            });



            // //welcome user
            // socket.emit("message", formatMessage(botname, `Hii ${user.username}... \n Welcome to ChitChat`));

            //broadcast when a user joined
            socket.broadcast.to(user.room).emit("message", formatMessage(botname, `${user.username} has joined the chat room`));

            //update room info
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        });


        //listen chat msg
        socket.on("chatMessage", msg => {
            //got the message, now emit to everyone in room
            const user = getCurrentUser(socket.id);
            const newChat = formatMessage(user.username, msg);
            //--------------------------------------------------updating db----------------------------------------------------------------
            const collectionName = db.collection(user.room);
            collectionName.insertOne(newChat, () => {
                io.to(user.room).emit("message", newChat);
            });

        });


        //when a user disconnect
        socket.on("disconnect", () => {
            const user = userLeft(socket.id);

            if (user) {
                io.to(user.room).emit("message", formatMessage(botname, `${user.username} has left the room`));
                //update room info
                io.to(user.room).emit("roomUsers", {
                    room: user.room,
                    users: getRoomUsers(user.room)
                })
            }

        });
    });

});


server.listen(PORT, () => {
    console.log("Server Running...");
});