const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const bcrypt = require("bcrypt");
const http = require('http');
const socketIo = require('socket.io');
const { pass, isAuthenticated } = require('./localPass');
const { User } = require('./DB');
require('dotenv').config();


const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 4000;

mongoose.connect(process.env.KEY ,{ useNewUrlParser: true, useUnifiedTopology: true });

pass(passport);

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('assets'));
app.set('view engine', 'ejs');
app.use(expressSession({secret: 'mySecret', resave: false, useUnifiedTopology: false}));
app.use(passport.initialize());
app.use(passport.session());

const home = __dirname + "/assets/home.html";
const register = __dirname + "/assets/register.html";
const login = __dirname + "/assets/login.html";
const dashboard = __dirname + "/assets/dash.html";
const info = __dirname + "/assets/info.ejs";
const edit = __dirname + "/assets/edit.ejs";
const chat = __dirname + "/assets/chat.ejs";
const Salt = process.env.SALT;

app.get('/', (req, res) => {
  res.sendFile(home);
})

app.get('/signup', (req, res) => {
  res.sendFile(register);
});

app.post('/confirmed', (req, res) => {
  let name = req.body.name;
  let mail = req.body.email;
  let age0 = req.body.age;
  let password = bcrypt.hashSync(req.body.password, Salt);
  let confirm = bcrypt.hashSync(req.body.confirm, Salt);
  let newUser = {Name: name, email: mail, age: age0, password: password};

  //check if email is already registered!
  User.findOne({ email: mail }).then(user => {
    if(user) {
      res.send("[+] Error: User already exists!");
    }
    }).catch(err => {if (err) { console.error(err); }});
  // if user does not exist confirming password.
  if(confirm === password){
    console.log("[+] Account Registered Successfully!");
    // creating the user
    User.create(newUser).then(users => {
      console.log("Data saved in database! ", users);}).catch(error => {
      console.log(error); });;

    res.redirect('/login');
  }
  else{
    console.log("[+] Please Enter the same password twice");
    res.redirect('/signup');
  }
  
} );

app.get('/login', (req, res) => {
  res.sendFile(login);
});

app.post('/login', 
  passport.authenticate('local', { 
    failureRedirect: '/login' ,
    successRedirect: '/dashboard'})
  );

app.get('/dashboard',isAuthenticated, (req, res) =>{
  res.sendFile(dashboard);
})  

app.get('/profile', isAuthenticated, (req, res) => {
  let data = {name: req.user.Name, email: req.user.email, age: req.user.age};
  res.render(info, data);
});

app.get('/edit', isAuthenticated, (req, res) => {
  let data = {name: req.user.Name, email: req.user.email, age: req.user.age}
  res.render(edit, data);
})

app.get('/chat', isAuthenticated, (req, res) =>{
  res.render(chat, { name: req.user.Name });
});

//socket.io chatting rooms
const users = {};


io.on('connection', (socket) => {
  socket.on('join room', (room, username) => {
    if (!users[room]) {
      users[room] = [];
    }
    users[room].push(username);
    console.log(users);
    socket.join(room);
    io.to(room).emit('update users', users[room]);
  });

  socket.on('chat message', (room, msg, username) => {
    io.to(room).emit('update message', { msg, username: username }); // Use socket.username
  });

  socket.on('disconnect', () => {
    Object.keys(users).forEach((room) => {
      users[room] = users[room].filter((user) => user !== socket.username);
      io.to(room).emit('update users', users[room]);
    });
    
  });
});


server.listen(port, function() {
    console.log(`Listening on port ${port}`);
  });
