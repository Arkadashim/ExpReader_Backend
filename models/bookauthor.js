'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class BookAuthor extends Model {
        static associate(models) {
            BookAuthor.belongsTo(models.Book);
            BookAuthor.belongsTo(models.Author);
        }
    }
    BookAuthor.init({
    }, {
        sequelize,
        timestamps: false,
        modelName: 'BookAuthor',
    });
    
    module.exports.Model = BookAuthor;
    return BookAuthor;
};