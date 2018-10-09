var express = require('express');

var app = express();
// add socket
var http = require('http').Server(app);
var io = require('socket.io')(http);
//
var port = process.env.PORT ||3232;

// Set public folder as root
app.use(express.static('public'));

// Provide access to node_modules folder from the client-side
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

//
// Redirect all traffic to index.html
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

// add socket

var roomidlist =[];
var themelist =[];
var statelist =[];
var userlist =[];
var max=1;
var curRoomName  = "大廳";
//var roomno = 1;
var i;

io.on('connection', function (socket){
  var room2;
  
    socket.on('certain', function(roomName){
    curRoomName = roomName;
    }); 
  
  socket.join(curRoomName);
  socket.on('roomlist', function(key){
    io.emit('Roomlist', roomidlist);//收到訊息後把清除的資料廣播到client端
    });
  socket.on('roomstate', function(state,roomName,username,theme){
        //socket.emit('Room', state,roomName,username);//收到訊息後把清除的資料廣播到client端
    statelist.push(state);
    userlist.push(username);
    socket.leave("大廳");
    for(i=0;i<=max;i++){
      if(roomidlist[i]==roomName){
        break;
        }
      else if(i==max-1){
        roomidlist.push(roomName);
        themelist.push(theme);
        max=max+1;
        io.emit('Roomlist2', roomidlist);
        break;
      }
    }
    socket.join(roomName);
    io.in(roomName).emit('Room2', state,roomName,username);
    curRoomName = roomName;
    console.log(io.sockets.adapter.rooms[curRoomName]);
    });
  socket.on('drawing',function(data,list) {
    io.in(curRoomName).emit('drawing', data);
    io.in(curRoomName).emit('Room3', data);
    io.emit('Roomlist3', roomidlist,themelist);
    console.log(io.sockets.adapter.rooms[curRoomName]);
  });
  socket.on('pressed', function(key){
    io.in(curRoomName).emit('PlayersMoving', key);//收到訊息後把清除的資料廣播到client端
    });
  io.emit('Roomlist3', roomidlist,themelist);

  console.log("curent is "+curRoomName);

  io.on('leave', function () {
  console.log('leave');
    io.emit('disconnect');
  });

io.on('disconnect', function () {
  console.log('disconnect');
    var k = 0;
    for ( k=0 ; k<=max ; k++ )
      {
      if (roomidlist[i] == curRoomName)
        break;
      }
    if ( k == max )
      {
      io.leave(curRoomName);    // 退出房间
      roomidlist[k].splice(index, 1);
      console.log('disconnect' + curRoomName);
      }
  });


  
});



http.listen(port, function ()  {
  console.info('listen on %d', port);
});
function isRoomExist (roomName, roomList) {
  return roomList[roomName] >= 0;
}





/*
 var index = roomInfo[roomID].indexOf(curRoomName);
    //  returns the position of the first occurrence of a specified value in a string
    if (index !== -1) {
      roomInfo[roomID].splice(index, 1);
      //splice() method adds/removes items to/from an array, and returns the removed item(s).
    }
*/