const http = require('http');
function rqListenner(req, res) {
    console.log(req.url, req.method, req.headers);
    //process.exit();
    res.setHeader('Content-Type', 'text/html')
    res.write('<html>');
    res.write('<head><title>My Page</title></head>');
    res.write('<body><h1>Hello from Node.js Server</h1></body');
    res.write('</html>');
    res.end();
}
const server = http.createServer(rqListenner)
server.listen(3000);
