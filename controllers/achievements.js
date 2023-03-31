const eH = require('../middleware/errorHandler');

const UserAchieve = require('../models/userachieves').Model;

// auth + achieveID in body
module.exports.completeAchievement = async function (req, res) {
    try {
        const uID = req.user.id;
        const aID = req.body.achieveID;

        await UserAchieve.update(
            { isCompleted: true },
            { where: { UserId: uID, AchievementId: aID } }
        );
        res.status(200);
    } catch (err) {
        eH(res, err);
    }
}