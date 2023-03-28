'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Genre extends Model {
        static associate(models) {
        }
    }
    Genre.init({
        genre: DataTypes.STRING
    }, {
        sequelize,
        timestamps: false,
        modelName: 'Genre',
    });

    module.exports.Model = Genre;
    return Genre;
};