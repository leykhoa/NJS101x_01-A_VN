const http = require('http');
const fs = require('fs');
function rqListenner(req, res) {
    const url = req.url
    const method = req.method;
    if (url === "/") {
        res.write('<html>');
        res.write('<head><title>Message</title></head>');
        res.write('<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Submit</button></input></form></body');
        res.write('</html>');
        return res.end();
    }
    if (url === '/message' && method === 'POST') {
        fs.writeFileSync('message.txt', 'DUMMY');
        res.statusCode = 302;
        res.setHeader('Localtion', '/');
        return res.end();

    }
    res.setHeader('Content-Type', 'text/html')
    res.write('<html>');
    res.write('<head><title>My Page</title></head>');
    res.write('<body><h1>Hello from Node.js Server</h1></body');
    res.write('</html>');
    res.end();
}
const server = http.createServer(rqListenner)
server.listen(3000);
