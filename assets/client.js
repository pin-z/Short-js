// client side for chat --socket.io
$(function () {
    const socket = io();
  
    let username;
    let room;
  
    $('#joinRoom').click(() => {
      room = $('#roomInput').val();
      username = $('#usernameInput').val();
      socket.emit('join room', room, username);
  
      $('#roomInput').prop('disabled', true);
      $('#usernameInput').prop('disabled', true);
      $('#joinRoom').prop('disabled', true);
    });
  
    $('#chat-message').click(() =>  {
      const message = $('#messageInput').val();
      socket.emit('chat message', room, message, username);
      $('#messageInput').val('');
      return false;
    });
  
    socket.on('update message', (data) => {
      $('#messages').append(`<div class="message-box">${data.username}: <br> ${data.msg}</div><br>`);
    });
  
    socket.on('update users', (usersList) => {
      $('#users').empty();
      usersList.forEach((user) => {
        $('#users').append(`<li>${user} joined the ${room} room</li>`);
      });
    });
  });
  
  