const express = require('express');
const db = require('./config/database');
const bodyParser = require('body-parser'); 
const passport = require('passport');
const fs = require('node:fs');
const path = require('node:path');

//testing db
db.authenticate()
.then(() => console.log('Connection to database completed!'))
.catch(err => console.log(err));

const app = express();

// adding body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// adding passport
app.use(passport.initialize());
require('./middleware/passport')(passport);

//ROUTES
const mainRoute = 'api';
const routesFiles = fs.readdirSync('routes');

for (let file of routesFiles) {
    const fileName = file.split('.').slice(0, -1).join('.');
    app.use(`/${mainRoute}/${fileName}`, require(`./routes/${fileName}`));
}

// set public resources
app.use('/public', express.static(path.join(__dirname,'public')));

// port of server and starting
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}!`));