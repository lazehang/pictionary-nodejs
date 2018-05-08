11/5 by harrison
handlebars
socket io <script> can ONLY exist main.hb
added POST route to render room.hb 

public/js
move all client socket js to /public/socketEvent.js
add /public/room.js for event that ONLY occur in room page

server
store n remove active player to/from redis
store n remove active game to/from redis

room
now 2 players is able to join same socket room

how to use
cmd:
sudo service postgresql start
redis-server --daemonize yes
redis-cli
node app

open 2 browsers (incognito mode better)
sign up 2 users , login
go to bottom of lobby
P1 click CREATE ROOM to create room
P2 click RMA to join this room

now both player are in same game room and you can test your code

13/5 by harrison
leave room event added
changes made to canvas-common.js : 
    add socket event
    added z-index to canvas real
    changed $(document) to $("#chalkboard")
    clean things up

14/5
merged canvas-common and room .js (now using room.js)
added css and images for room
added canvas cover
room page mirror action done
added socket route for lobby game list update
