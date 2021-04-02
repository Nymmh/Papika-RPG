const handleError = require('../util/utils').handleError,
      axios = require('axios');
      config = require('../json/config.json'),
      reload = require('require-reload')(require),
      logger = new(reload('../util/logger.js'))(config.logTimestamp),
      utils = require('../util/utils'),
      moment = require('moment'),
      reload = require('require-reload')(require),
      cooldowns = reload('../json/cooldowns.json');
module.exports.jobquit = (Ai, msg)=>{
    /**
     * perm checks
     * @param {boolean} sendMessages
     * @param {boolean} embedLinks
     */
    const sendMessages = msg.channel.permissionsOf(Ai.user.id).has('sendMessages');
    if (sendMessages === false) return;
    let value = "", 
        sndmsg = `<@${msg.author.id}> has quit their job!`,
        reason = "jobquit";
    jobCheck(Ai, msg, value, sndmsg, reason);
}

module.exports.jobapply = (Ai, msg, suffix)=>{
    axios({
        url:config.APIurl,
        method:'post',
        data:{
            query:`
            query($job:String){
                jobs(name:$job){
                  _id
                  rank
                  name
                }
              }`,
            variables:{
                job:suffix
            },
            headers:{
                'Content-Type':'application/json'
            },
        }
    }).then(result=>{
        if(!result.data.data.jobs[0]) return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, I could not find the job with the name ${suffix}.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        if(result.data.data.jobs[0].rank > 1)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, You can not apply to a job with a rank higher then 1.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
        var value = result.data.data.jobs[0]._id,
            reason = "apply",
            sndmsg = '',
            jobname = result.data.data.jobs[0].name;
        jobCheck(Ai, msg, value, sndmsg, reason, jobname);
    });
}

module.exports.jobwork = (Ai,msg)=>{
    var value = "",
    reason = "work",
    sndmsg = '';
    jobCheck(Ai, msg, value, sndmsg, reason);
}

function jobCheck(Ai, msg, value, sndmsg, reason, jobname){
    axios({
        url:config.APIurl,
        method:'post',
        data:{
            query:`
            query($discordId:String){
                users(discordId:$discordId){
                  job
                  jobexp
                  money
                  happiness
                  sleep
                  hunger
                  nextbill
                  lastwork
                  jobinfo{
                    name
                    income
                    legal
                    minexp
                    maxexp
                    firedchance
                  }
                }
              }`,
            variables:{
                discordId:msg.author.id
            },
            headers:{
                'Content-Type':'application/json'
            },
        }
    }).then(result=>{
        if(reason == "jobquit"){
            if(!result.data.data.users[0].job || result.data.data.users[0].job == ''){
                sndmsg = `<@${msg.author.id}>, you don't have a job.`;
                return Ai.createMessage(msg.channel.id,sndmsg).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            }else{
                jobChange(Ai, msg, value, sndmsg);
            }
        }else if(reason == "apply"){
            if(result.data.data.users[0].job == value) return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you can not apply to a job you already have.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            sndmsg = `<@${msg.author.id}>, you are now a ${jobname}`;
            jobChange(Ai, msg, value, sndmsg);
        }else if(reason == "work"){
            if(result.data.data.users[0].job == "" || result.data.data.users[0].job == null || result.data.data.users[0].job == undefined)return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you don't have a job.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
            let happiness = result.data.data.users[0].happiness,
                money = result.data.data.users[0].money,
                sleep = result.data.data.users[0].sleep,
                hunger = result.data.data.users[0].hunger,
                income = result.data.data.users[0].jobinfo[0].income,
                legal = result.data.data.users[0].jobinfo[0].legal,
                minexp = result.data.data.users[0].jobinfo[0].minexp,
                maxexp = result.data.data.users[0].jobinfo[0].maxexp,
                firedchance = result.data.data.users[0].jobinfo[0].firedchance,
                jobexp = result.data.data.users[0].jobexp,
                nextbill = result.data.data.users[0].nextbill,
                lastwork = result.data.data.users[0].lastwork;
            processWork(Ai, msg, value, sndmsg, reason, happiness, money, hunger, sleep, income, legal, minexp, maxexp, firedchance, jobexp, nextbill, lastwork);
        }
    });
}
function jobChange(Ai, msg, value, sndmsg){
     axios({
         url:config.APIurl,
         method:'post',
         data:{
             query:`
             mutation($auth: String, $discordId: String, $reason: String, $value: String) {
                modifyUser(auth: $auth, discordId: $discordId, reason: $reason, value: $value) {
                   discordId
                 }
               }                  
             `,
             variables:{
                 auth:config.APIAuth,
                 discordId:msg.author.id,
                 reason:"jobchange",
                 value:value
             },
             headers:{
                 'Content-Type':'application/json'
             },
         }
     }).then(result=>{
         logger.green(`User Change for ${msg.author.id} >> ${msg.author.username}`);
         if(sndmsg != "dontsend")return Ai.createMessage(msg.channel.id,sndmsg).catch(err => {handleError(Ai, __filename, msg.channel, err)});
     });
}

function processWork(Ai, msg, value, sndmsg, reason, happiness, money, hunger, sleep, income, legal, minexp, maxexp, firedchance, jobexp, nextbill, lastwork){
    let {handleBills} = require('./utils/handleBills');
    if((moment().unix() - Number(lastwork)) < cooldowns.work) return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you can't work work for another ${Math.abs(((moment().unix() - Number(lastwork))-cooldowns.work))} seconds.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
    let newmoney = (Number(money)+Number(income));
    let randomsleep = utils.getRandomInt(1,20),
        newSleep = (sleep - randomsleep),
        randomhappiness = utils.getRandomInt(1,3),
        newHappiness = (happiness - randomhappiness),
        randomHunger = utils.getRandomInt(1,15),
        newHunger = (hunger - randomHunger),
        randomEXP = utils.getRandomInt(minexp,maxexp),
        newexp = (jobexp + randomEXP),
        newnextbill = (nextbill - 1),
        firedRate = (Math.random() * (100 - 0 + 1) + 0).toFixed(3),
        fired = false;
    if(newSleep <= 0){
        //fell asleep at work
        firedchance = Math.abs((Number(firedchance)+newSleep));
        Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you fell asleep at work!`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
    }else if(newSleep <= 10 && newSleep>0){
        //falling alsleep
        firedchance = (Number(firedchance)+10);
        Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are starting to fall asleep at work.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
    }
    if(newSleep <= 25 && newSleep>10){
        //falling alsleep
        Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you are getting tired.`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
    }
    console.log(firedRate)
    console.log(firedchance)
    if(Number(firedRate)<firedchance){
        fired = true;
        newHappiness = (newHappiness-10);
        Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, you have been fired from your job!`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
    }
    axios({
        url:config.APIurl,
        method:'post',
        data:{
            query:`
            mutation($auth: String, $discordId: String, $money: Int, $happiness: Int, $hunger: Int, $sleep: Int, $jobexp: Int, $nextbill: Int) {
                UserWork(auth: $auth, discordId: $discordId, money: $money, happiness: $happiness, hunger:$hunger sleep: $sleep, jobexp: $jobexp, nextbill:$nextbill) {
                  discordId
                }
              }                  
            `,
            variables:{
                auth:config.APIAuth,
                discordId:msg.author.id,
                money:newmoney,
                happiness:newHappiness,
                sleep:newSleep,
                hunger:newHunger,
                jobexp:newexp,
                nextbill:newnextbill,
            },
            headers:{
                'Content-Type':'application/json'
            },
        }
    }).then(()=>{
        logger.green(`User Change for ${msg.author.id} >> ${msg.author.username}`);
        workmsg = `you worked at you job and gained ${income}${config.moneyname}'s`;
        if(newnextbill == 0)handleBills(Ai,msg,newmoney)
        if(fired){
            workmsg = `you worked you last shift and gained ${income}${config.moneyname}'s`;
            sndmsg = "dontsend";
            value = "";
            jobChange(Ai, msg, value, sndmsg)
        }
        return Ai.createMessage(msg.channel.id,`<@${msg.author.id}>, ${workmsg}`).catch(err => {handleError(Ai, __filename, msg.channel, err)});
    });
}