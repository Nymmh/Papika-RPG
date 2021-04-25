const {Users,Schools,UserInventories, ItemValues, Items, Addictions} = require('./models');
let config = require('../json/config.json'),
    moment = require('moment');

exports.modifyUser = (auth,discordId,reason,value)=>{
    modifyUser(auth,discordId,reason,value);
}
function modifyUser(auth,discordId,reason,value){
    if(auth === config.APIAuth){
        if(reason == "jobchange"){
            Users.find({discordId:discordId},(err,res)=>{
                if(!err) if(res[0]){
                    console.log("Modifying user");
                    Users.findOneAndUpdate({discordId:discordId},{job:value,jobexp:0},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                }
            });
        }
        if(reason == "jobpromote"){
            Users.find({discordId:discordId},(err,res)=>{
                if(!err) if(res[0]){
                    console.log("Modifying user");
                    Users.findOneAndUpdate({discordId:discordId},{job:value},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                }
            });
        }
        if(reason == "bills"){
            Users.find({discordId:discordId},(err,res)=>{
                if(!err) if(res[0]){
                    console.log("Modifying user");
                    Users.findOneAndUpdate({discordId:discordId},{money:Number(value),nextbill:30},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                }
            });
        }
        if(reason == "hospitalbills"){
            Users.find({discordId:discordId},(err,res)=>{
                if(!err) if(res[0]){
                    console.log("Modifying user");
                    Users.findOneAndUpdate({discordId:discordId},{money:Number(value),hunger:0},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                }
            });
        }
        if(reason == "schoolquit"){
            Users.find({discordId:discordId},(err,res)=>{
                if(!err) if(res[0]){
                    console.log("Modifying user");
                    Users.findOneAndUpdate({discordId:discordId},{currentSchool:"",schoolDays:0},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                }
            });
        }
        if(reason == "schoolapply"){
            Users.find({discordId:discordId},(err,res)=>{
                if(!err) if(res[0]){
                    let money = res[0].money;
                    Schools.findOne({name:value},(err,res)=>{
                        let newmoney = (money-res.price);
                        lastschool = moment().unix();
                        Users.findOneAndUpdate({discordId:discordId},{currentSchool:res.name,schoolDays:res.days,money:newmoney,lastSchool:lastschool},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                    });
                }
            });
        }
        if(reason == "schooldone"){
            Users.find({discordId:discordId},(err,res)=>{
                if(!err) if(res[0]){
                    console.log("Modifying user");
                    if(value == "Engineering"){
                        Users.findOneAndUpdate({discordId:discordId},{currentSchool:"",schoolDays:0,engineeringDegree:true},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                    }
                    if(value == "ROTC"){
                        Users.findOneAndUpdate({discordId:discordId},{currentSchool:"",schoolDays:0,ROTCDegree:true},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                    }
                    if(value == "Medical"){
                        Users.findOneAndUpdate({discordId:discordId},{currentSchool:"",schoolDays:0,medicalDegree:true},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                    }
                    if(value == "Culinary"){
                        Users.findOneAndUpdate({discordId:discordId},{currentSchool:"",schoolDays:0,culinaryDegree:true},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                    }
                    if(value == "Business"){
                        Users.findOneAndUpdate({discordId:discordId},{currentSchool:"",schoolDays:0,businessDegree:true},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                        });
                    }
                }
            });
        }
        if(reason == "novapejuiceleft"){
            UserInventories.findOneAndUpdate({discordId:discordId},{vapejuiceRemaining:0,vapejuiceStrength:"",vapejuice:""},{new:true},(err,data)=>{
                if(err)console.log(err);else console.log(data)
            });
        }
        if(reason == "vapehit"){
            var empty = false;
            var addicted = false;
            UserInventories.findOne({discordId:discordId},(err,res)=>{
                let vapejuice = res.vapejuice,
                    remaining = res.vapejuiceRemaining,
                    vapejuiceStrength = res.vapejuiceStrength;
                ItemValues.findOne({parent:vapejuiceStrength},(err,res)=>{
                    let vapeHappiness = res.usehappiness,
                        stname = res.name;
                    stname.replace('nic','');
                    remaining = (remaining-2);
                    if(remaining == 0)empty = true;
                    Users.findOne({discordId:discordId},(err,res)=>{
                        let happiness = (res.happiness+vapeHappiness);
                        Users.findOneAndUpdate({discordId:discordId},{happiness:happiness,nicotineWithdrawldays:0},{new:true},(err,data)=>{
                            if(err)console.log(err);else console.log(data)
                            if(stname != "0")var addictedRate = (Math.random() * (100 - 0 + 1) + 0).toFixed(3);
                            Addictions.findOne({name:"nicotine"},(err,res)=>{
                                if(Number(addictedRate)>Number(res.chance))addicted = true;
                                if(stname == '0')addicted = false;
                                if(empty){
                                    UserInventories.findOneAndUpdate({discordId:discordId},{vapejuiceRemaining:0,vapejuiceStrength:"",vapejuice:""},{new:true},(err,data)=>{
                                        if(err)console.log(err);else console.log(data)
                                    });
                                }else{
                                    UserInventories.findOneAndUpdate({discordId:discordId},{vapejuiceRemaining:remaining},{new:true},(err,data)=>{
                                        if(err)console.log(err);else console.log(data)
                                    });
                                }
                                if(addicted){
                                    Users.findOneAndUpdate({discordId:discordId},{nicotineAddiction:true},{new:true},(err,res)=>{
                                        if(err)console.log(err);else console.log(data)
                                    });
                                }
                            });
                        });
                    });
                });
            });
        }
        if(reason == "nicotinewithdrawal"){
            Users.findOne({discordId:discordId},(err,res)=>{
                console.log(res.nicotineWithdrawldays)
                let nicotineWithdrawldays = res.nicotineWithdrawldays;
                if(nicotineWithdrawldays == undefined) nicotineWithdrawldays = 0;
                nicotineWithdrawldays = (nicotineWithdrawldays+1);
                if(nicotineWithdrawldays == 1){
                    Users.findOneAndUpdate({discordId:discordId},{nicotineWithdrawldays:nicotineWithdrawldays},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                }else{
                    Users.findOneAndUpdate({discordId:discordId},{nicotineWithdrawldays:nicotineWithdrawldays,happiness:value},{new:true},(err,data)=>{
                        if(err)console.log(err);else console.log(data)
                    });
                }
            });
        }
    }
}