
module.exports.insensitiveLike = (firstString, secondString) => {
    firstString = firstString.toUpperCase();
    secondString = secondString.toUpperCase();

    var regExp = new RegExp(`^.*${firstString}.*$`, "g");
    return secondString.match(regExp);
}