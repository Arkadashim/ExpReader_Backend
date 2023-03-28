const Models = require('./models');

Models.sequelize.sync({
    alter: true,
    logging: console.log
}).then(() => 
    console.log("Ok"))
.catch((err) => 
    console.log(err));