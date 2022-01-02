const fs = require('fs');
const resquestHandler = (req, res) => {
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
        const body = [];
        req.on('data', (chunk) => {
            console.log(chunk)
            body.push(chunk)
        });
        req.on('end', () => {
            const paresedBody = Buffer.concat(body).toString();
            const message = paresedBody.split('=')[1]
            fs.writeFileSync('message.txt', message);
        })
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
module.exports = {
    handler: resquestHandler,
    someText: 'Hello, this is text'
}; 