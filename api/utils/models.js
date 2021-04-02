const mongoose = require('mongoose');

module.exports.Users = mongoose.model("users",{
    discordId:String,
    name:String,
    avatar:String,
    money:Number,
    job:String,
    jobexp:Number,
    lastsleep:String,
    lastwork:String,
    nextbill:Number,
    happiness:Number,
    sleep:Number,
    hunger:Number,
    medicalDegree:Boolean,
    engineeringDegree:Boolean,
    ROTCDegree:Boolean,
    culinaryDegree:Boolean,
    currentSchool:String,
    schoolDays:Number,
});
module.exports.UserInventories = mongoose.model('userinventories',{
    discordId:String,
    bed:String,
    groceries:Number,
    fastfood:Number,
});
module.exports.Cooldowns = mongoose.model("cooldowns",{
    name:String,
    cooldown:Number,
});
module.exports.Items = mongoose.model("items",{
    name:String,
    price:Number,
    group:String,
    store:String
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
    requiredSchool:String
});
module.exports.Schools = mongoose.model("schools",{
    name:String,
    price:Number,
    days:Number
});
module.exports.ItemValues = mongoose.model("itemvalues",{
    name:String,
    parent:String,
    usehappiness:Number,
    hunger:Number,
    sleep:Number,
    happinessbuy:Number,
    badsleep:Number,
    cooldown:Number,
    badsleepmax:Number
});
module.exports.Environments = mongoose.model("environments",{
    type:String,
    weatherType:String,
    cloudType:String,
    temperature:String,
    humidity:String,
    wind:String
});