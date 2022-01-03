const http = require('http');

const express = require('express');

const app = express();

app.use('/', (req, res, next) => {
    next();
});

app.use('/add-product', (req, res, next) => {
    console.log('In the another middleware');
    res.send('<h1>The "Add product" Page</h1>');
    next();
});

app.use((req, res, next) => {
    console.log('In the another middleware');
    res.send('<h1>Hello from Express.js</h1>');
});

app.listen(3000)
