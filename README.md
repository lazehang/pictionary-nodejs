# deploy-weekly-chat-room

### Chat-Room
communication channels : web socket
store the messages : redis
facebook authentcation : social login , passport
mobile responsive : bootstrap
unit test for the database logic : jasmine
deploy : System Admin
---
msg : jquery / socket.io / redis
create / join / leave rm : jquery / socket.io / redis

html : 
/index.html
/room.html

app :
express
body-parser
http
io
redis
redis-store
socket.io.session
passport

router :
get     /
get     /login
post    /login
get     /auth/facebook
get     /auth/facebook/callback
get     /room
get     /logout
get     /error

---
### Deploy &Dev
deployed : 
    nginx willm deal with http(s) , no need to set up yourself
    may need to restart redis : `sudo redis-server`

dev : 
    set up https to test FB login :
    (this will cause socket.io to fail)
    ```
    const https = require('https')
    const options = {
        key: fs.readFileSync('localhost.key', 'utf-8'),
        cert: fs.readFileSync('localhost.cert', 'utf-8')
    };
    const serverPort = 443;
    const server = https.createServer(options, app);
    ...
    server.listen(serverPort);
    ```
    
    use `sudo node app`

    Valid OAuth Redirect URIs : 
        https://localhost/auth/facebook/callback ,
        https://harrixon.stream/auth/facebook/callback
---

Login : 
local ok
FB ok
single user ok
multi user looks ok


ref : 
@redis session-store : 
    maxAge = null ||  10 * 60 * 1000
@router.js : 
    req.session.passport.user
@socketRouter.js : 
    socket.session.passport.user
    socket.session.passport.roomID 

---

Chat room :
1 socket session
    1 namespace
        emit stuf according to sender
            msgBlk = {
                sender: sender,
                msg: msg
            }

n socket session
    1 namespace
        msg

canvas event : 
color
fill bg
eraser
clear
pen x3


lobby :

    check box for public/private room
    text box for password if private room
    create btn for submit

js
    socket on createRoom

