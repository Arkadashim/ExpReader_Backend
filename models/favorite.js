'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Favorite extends Model {
        static associate(models) {
            Favorite.belongsTo(models.User);
            Favorite.belongsTo(models.Book);
        }
    }
    Favorite.init({
    }, {
        sequelize,
        modelName: 'Favorite',
        timestamps: false
    });

    module.exports.Model = Favorite;
    return Favorite;
};