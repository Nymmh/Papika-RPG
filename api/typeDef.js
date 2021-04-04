const {gql} = require('apollo-server-express');

module.exports.typeDefs = gql`
    type Query {
        users(discordId:String):[Profile!]
        cooldowns(name:String):[Cooldowns!]
        items(name:String,group:ItemGroup):[Items!]
        jobs(name:String,group:JobGroup,rank:Int):[Jobs!]
        environments(type:EnvironmentType):[Environment!]
    }
    type Mutation {
        createUser(auth:String,discordId:String,name:String,avatar:String):[Profile]
        modifyUser(auth:String,discordId:String,reason:String,value:String):[Profile]
        UserWork(auth:String,discordId:String,money:Int,happiness:Int,hunger:Int,sleep:Int,jobexp:Int,nextbill:Int,lastwork:String):[Profile]
        UserSleep(auth:String,discordId:String,sleep:Int,happiness:Int,hunger:Int,reason:String):[Profile]
        UserBuy(auth:String,discordId:String,money:Int,happiness:Int,item:String,amount:Int):[Profile]
        UserEat(auth:String,discordId:String,hunger:Int,happiness:Int,sleep:Int,item:String,itemsleft:Int):[Profile]
    }
    type Profile{
        discordId:String!,
        name:String!,
        money:Int!,
        job:String,
        jobexp:Int,
        jobinfo:[Jobs],
        nextbill:Int,
        lastsleep:String,
        lastwork:String,
        happiness:Int!,
        sleep:Int!,
        hunger:Int!,
        medicalDegree:Boolean,
        engineeringDegree:Boolean,
        ROTCDegree:Boolean,
        culinaryDegree:Boolean,
        businessDegree:Boolean,
        currentSchool:String,
        schoolDays:Int,
        inventory:[Inventory]
    }
    type Inventory{
        discordId:String,
        bed:[ItemValues],
        groceries:Int,
        fastfood:Int,
    }
    type Cooldowns{
        name:String!,
        cooldown:Int!
    }
    type Items{
        _id:String!,
        name:String!,
        price:Int!,
        group:ItemGroup!
        values:[ItemValues!]
        store:[ItemStore!]
    }
    type ItemValues{
        name:String!,
        parent:String!,
        usehappiness:Int,
        hunger:Int,
        sleep:Int,
        happinessbuy:Int,
        badsleep:Int,
        cooldown:Int,
        badsleepmax:Int
    }
    type Jobs{
        _id:String!,
        name:String!,
        income:Int!,
        legal:Boolean!,
        group:JobGroup!,
        rank:Int!,
        members:Int!,
        minexp:Int!,
        maxexp:Int!,
        reqexp:Int!,
        firedchance:String!,
        requiredSchool:String,
    }
    type Environment{
        type:EnvironmentType!,
        weatherType:String,
        cloudType:String,
        temperature:String,
        humidity:String,
        wind:String
    }

    enum ItemGroup{
        Food
        Bed
    },
    enum ItemStore{
        civilian
    }
    enum JobGroup{
        Japari_Park
    }
    enum EnvironmentType{
        Weather
    }
`;