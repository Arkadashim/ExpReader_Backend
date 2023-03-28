'use strict';
const {
    Model, STRING
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Achievement extends Model {
        static associate(models) {
            
        }
    }
    Achievement.init({
        title: DataTypes.STRING,
        description: DataTypes.STRING,
        image: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Achievement',
    });
    return Achievement;
};