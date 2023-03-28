'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class BookGenre extends Model {
        static associate(models) {
            BookGenre.belongsTo(models.Book);
            BookGenre.belongsTo(models.Genre);
        }
    }
    BookGenre.init({
        
    }, {
        sequelize,
        timestamps: false,
        modelName: 'BookGenre',
    });
    
    module.exports.Model = BookGenre;
    return BookGenre;
};