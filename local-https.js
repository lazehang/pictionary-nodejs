const https = require('https')
const fs = require('fs');
const options = {
    key: fs.readFileSync('./localhost_key_cert/localhost.key', 'utf-8'),
    cert: fs.readFileSync('./localhost_key_cert/localhost.cert', 'utf-8')
};

const serverPort = 443;

module.exports = (app) => {
    const server = https.createServer(options, app);
    server.listen(serverPort);
};