'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class UserStat extends Model {
        static associate(models) {
            UserStat.belongsTo(models.User);
        }
    }
    UserStat.init({
        readBooks: DataTypes.INTEGER,
        readPages: DataTypes.INTEGER,
    }, {
        sequelize,
        timestamps: false,
        modelName: 'UserStat',
    });
    return UserStat;
};