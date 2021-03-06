var mongoose = require('mongoose'); mongoose.connect('mongodb://heroku_app36070442:9441gn6pji392s59nd7t3n9suq@dbh11.mongolab.com:27117/heroku_app36070442');
//mongodb://dbuser:dbpass@host:port/dbname

var Schema = mongoose.Schema;
var salesSchema = new Schema({
    owner: String,
    itemName: String,
    price: Number,
    location: String,
    description: String
});
var salesModel = mongoose.model('SalesModel', salesSchema);
module.exports.salesModel = salesModel;

var wishSchema = new Schema({
    owner: String,
    itemName: String,
    price: Number
});
var wishModel = mongoose.model('WishModel', wishSchema);
module.exports.wishModel = wishModel;

var notifSchema = new Schema({
    owner: String,
    itemName: String,
    price: Number,
    location: String
});
var notifModel = mongoose.model('NotifModel', notifSchema);
module.exports.notifModel = notifModel;


var friendSchema = new Schema({
    owner: String,
    friendName: String
});
var friendModel = mongoose.model('FriendModel', friendSchema);
module.exports.friendModel = friendModel;
