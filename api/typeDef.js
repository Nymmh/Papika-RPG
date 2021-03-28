const {gql} = require('apollo-server-express');

module.exports.typeDefs = gql`
    type Query {
        users(discordId:String):[Profile!]
        cooldowns(name:String):[Cooldowns!]
        items(name:String,group:ItemGroup):[Items!]
        jobs(name:String,group:JobGroup,rank:Int):[Jobs!]
    }
    type Profile{
        discordId:String!,
        name:String!,
        money:Int!
    }
    type Cooldowns{
        name:String!,
        cooldown:Int!
    }
    type Items{
        name:String!,
        price:Int!,
        group:ItemGroup!
    }
    type Jobs{
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
    }

    enum ItemGroup{
        Food
    }
    enum JobGroup{
        Japari_Park
    }
`;