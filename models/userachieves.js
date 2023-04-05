'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class UserAchieves extends Model {
        static associate(models) {
            UserAchieves.belongsTo(models.User);
            UserAchieves.belongsTo(models.Achievement);
        }
    }
    UserAchieves.init({
        // isCompleted: DataTypes.BOOLEAN,
    }, {
        sequelize,
        timestamps: false,
        modelName: 'UserAchieves',
    });
    module.exports.Model = UserAchieves;
    return UserAchieves;
};