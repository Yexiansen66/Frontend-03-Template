const http = require('http');
const fs = require('fs');
const PORT = 8666;
http.createServer((req, res) => {
    let body = [];
    req.on('error', e => console.log(e))
        .on('data', chunk => {
            body.push(chunk)
        })
        .on('end', () => {
            body = Buffer.concat(body).toString();
            console.log(`body: ${body}`);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(fs.readFileSync("./index.html").toString());
        })
}).listen(PORT);

console.log(`Http server is runing on ${PORT}`);