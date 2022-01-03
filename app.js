const http = require('http');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');



app.use(bodyParser.urlencoded({ extended: false }))

app.use(adminRoutes);

app.use(shopRoutes);

app.use((req, res) => {
    res.status(404).send('<h1>Page not found!</h1>')
})

app.listen(3000);
