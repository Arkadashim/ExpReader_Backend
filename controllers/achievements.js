const eH = require('../middleware/errorHandler');
const { Sequelize } = require('../models');

const Achievement = require('../models/achievement').Model;
const UserAchieve = require('../models/userachieves').Model;

// auth + achieveID in body
module.exports.completeAchievement = async function (req, res) {
    try {
        const uID = req.user.id;
        const aID = req.body.achieveID;

        await UserAchieve.findOrCreate({ where: { UserId: uID, AchievementId: aID } });

        res.status(200).end();
    } catch (err) {
        eH(res, err);
    }
}

// auth in header
module.exports.getUserAchievements = async function (req, res) {
    try {
        const uID = req.user.id;

        const _ach = await UserAchieve.findAll({
            raw: true,
            where: { UserId: uID },
            include: { model: Achievement, attributes: [] },
            attributes: [
                [Sequelize.col('Achievement.id'), 'id'],
                [Sequelize.col('Achievement.title'), 'title'],
                [Sequelize.col('Achievement.description'), 'description'],
                [Sequelize.col('Achievement.image'), 'image']
            ]
        });

        res.status(200).json(_ach);
    } catch (err) {
        eH(res, err);
    }
}

module.exports.getAllAchievements = async function (req, res) {
    try {

        const _ach = await Achievement.findAll({
            raw: true,
            attributes: [
                'id', 'title', 'description', 'image'
            ]
        });

        res.status(200).json(_ach);
    } catch (err) {
        eH(res, err);
    }
}