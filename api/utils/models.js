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
    businessDegree:Boolean,
    currentSchool:String,
    schoolDays:Number,
    lastSchool:String,
    gang:String,
    gangInvites:String,
    nicotineAddiction:Boolean,
    nicotineWithdrawldays:Number,
});
module.exports.UserInventories = mongoose.model('userinventories',{
    discordId:String,
    maxSpace:Number,
    usedSpace:Number,
    backpack:Boolean,
    groceries:Number,
    fastfood:Number,
    vape:String,
    vapejuice:String,
    vapejuiceRemaining:Number,
    vapejuiceStrength:String,
});
module.exports.UserHouseInventory = mongoose.model('houseinventory',{
    discordId:String,
    maxSpace:Number,
    usedSpace:Number,
    storageUpgrade:Number,
    house:String,
    security:String,
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
    cansell:Boolean,
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
    badsleepmax:Number,
    rentCost:Number,
    storage:Number,
});
module.exports.Environments = mongoose.model("environments",{
    type:String,
    weatherType:String,
    cloudType:String,
    temperature:String,
    humidity:String,
    wind:String
});
module.exports.Gangs = mongoose.model("gangs",{
    name:String,
    members:Number,
    funds:Number,
    icon:String,
    crimes:Number,
    leader:String,
    invites:String,
    color:String
});
module.exports.Addictions = mongoose.model("addictions",{
    name:String,
    chance:String,
    withdrawlhappiness:Number
});