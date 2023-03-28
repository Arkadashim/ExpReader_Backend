'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Author extends Model {
        static associate(models) {
        }
    }
    Author.init({
        name: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Author',
        timestamps: false
    });

    module.exports.Model = Author;
    return Author;
};