const mongoose = require('mongoose');

module.exports.Users = mongoose.model("users",{
    discordId:String,
    name:String,
    money:Number,
});

module.exports.Cooldowns = mongoose.model("cooldowns",{
    name:String,
    cooldown:Number,
});

module.exports.Items = mongoose.model("items",{
    name:String,
    price:Number,
    group:String
});
module.exports.Jobs = mongoose.model("jobs",{
    name:String,
    income:Number,
    legal:Boolean,
    group:String,
    rank:Number,
    members:Number,
    minexp:Number,
    maxexp:Number,
    reqexp:Number,
    firedchance:String,
});