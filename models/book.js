'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Book extends Model {
        static associate(models) {
        }
    }
    Book.init({
        title: DataTypes.STRING,
        pages: DataTypes.INTEGER,
        fileName: DataTypes.STRING,
        cost: DataTypes.INTEGER,
        cover: DataTypes.STRING,
        description: DataTypes.STRING,
        fragment: DataTypes.TEXT,
    }, {
        sequelize,
        modelName: 'Book',
    });
    module.exports.Model = Book;
    return Book;
};