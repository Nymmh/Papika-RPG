const {Environments} = require('./models');
const {getRandomInt} = require('./utils');
const weatherTypes = ["Light Rain", "Heavy Rain", "Thunderstorm", "Monsoon", "Hurricanes", "Sunny", "Cloudy", "Hot", "Cold", "Dry", "Wet", "Windy", "Sand Storm", "Snow Storm", "Tornado", "Humid", "Foggy", "Snow", "Thundersnow", "Hail", "Sleet", "Blizzard", "Mist"],
      cloudTypes = ['Partially Cloudy', 'Cloudy', 'Overcast', 'Clear'];

function generateWeather(){
    var randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
    randomClouds = cloudTypes[Math.floor(Math.random()*cloudTypes.length)],
    temperature = 0,
    humidity = 0,
    wind = 0;
    if(randomWeather === 'Light Rain'){
        randomWeather = '🌦️ '+randomWeather;
        temperature = getRandomInt(0, 27);
        humidity = Number(getRandomInt(50,80)).toFixed(0);
        wind = Number(getRandomInt(1.60,11.26)).toFixed(1)
    }else if(randomWeather === 'Heavy Rain'){
        randomWeather = '🌧️ '+randomWeather;
        temperature = getRandomInt(0, 27);
        humidity = Number(getRandomInt(80,100)).toFixed(0);
        wind = Number(getRandomInt(12.87,20.90)).toFixed(1)
    }else if(randomWeather === 'Thunderstorm'){
        randomWeather = '⛈️ '+randomWeather;
        randomClouds = 'Very Cloudy';
        temperature = getRandomInt(0, 15);
        humidity = Number(getRandomInt(90,100)).toFixed(0);
        wind = Number(getRandomInt(30.57,38.62)).toFixed(1)
    }else if(randomWeather === 'Monsoon'){
        randomWeather = '⛈️ '+randomWeather;
        randomClouds = 'Very Cloudy';
        temperature = getRandomInt(3.6, 27.05);
        humidity = Number(getRandomInt(84.2,100)).toFixed(0);
        wind = Number(getRandomInt(62.76,86.90)).toFixed(1)
    }else if(randomWeather === 'Hurricanes'){
        randomWeather = '🌊 '+randomWeather;
        randomClouds = 'Very Cloudy';
        temperature = getRandomInt(26, 36);
        humidity = Number(getRandomInt(70,95)).toFixed(0);
        wind = Number(getRandomInt(119,251)).toFixed(1)
    }else if(randomWeather === 'Sunny'){
        randomWeather = '☀️ '+randomWeather;
        temperature = getRandomInt(-25, 40);
        humidity = Number(getRandomInt(0,70)).toFixed(0);
        wind = Number(getRandomInt(0,28.96)).toFixed(1)
    }else if(randomWeather === 'Cloudy'){
        randomWeather = '☁️ '+randomWeather;
        temperature = getRandomInt(-25, 25);
        humidity = Number(getRandomInt(0,70)).toFixed(0);
        wind = Number(getRandomInt(0,28.96)).toFixed(1)
    }else if(randomWeather === 'Hot'){
        randomWeather = '☀️ '+randomWeather;
        randomClouds = 'Clear';
        temperature = getRandomInt(20, 48);
        humidity = Number(getRandomInt(0,40)).toFixed(0);
        wind = Number(getRandomInt(0,4.82)).toFixed(1)
    }else if(randomWeather === 'Cold'){
        randomWeather = '❄️ '+randomWeather;
        randomClouds = 'Very Cloudy';
        temperature = getRandomInt(-40, 10);
        humidity = Number(getRandomInt(0,10)).toFixed(0);
        wind = Number(getRandomInt(0,4.82)).toFixed(1)
    }else if(randomWeather === 'Dry'){
        randomWeather = '☀️ '+randomWeather;
        temperature = getRandomInt(5, 25);
        humidity = Number(getRandomInt(0,2)).toFixed(0);
        wind = Number(getRandomInt(0,4.82)).toFixed(1)
    }else if(randomWeather === 'Wet'){
        randomWeather = '💧 '+randomWeather;
        temperature = getRandomInt(5, 20);
        humidity = Number(getRandomInt(40,80)).toFixed(0);
        wind = Number(getRandomInt(0,28.96)).toFixed(1)
    }else if(randomWeather === 'Windy'){
        randomWeather = '💨 '+randomWeather;
        temperature = getRandomInt(-15, 30);
        humidity = Number(getRandomInt(0,60)).toFixed(0);
        wind = Number(getRandomInt(19.31,74.02)).toFixed(1)
    }else if(randomWeather === 'Sand Storm'){
        randomWeather = '💨 '+randomWeather;
        temperature = getRandomInt(-27.22, 32.22);
        humidity = Number(getRandomInt(0,0)).toFixed(0);
        wind = Number(getRandomInt(75,95)).toFixed(1)
    }else if(randomWeather === 'Snow Storm'){
        randomWeather = '🌨️ '+randomWeather;
        randomClouds = 'Very Cloudy';
        temperature = getRandomInt(-45, 0);
        humidity = Number(getRandomInt(0,15)).toFixed(0);
        wind = Number(getRandomInt(40.23,56)).toFixed(1)
    }else if(randomWeather === 'Tornado'){
        randomWeather = '🌪️ '+randomWeather;
        randomClouds = 'Very Cloudy';
        temperature = getRandomInt(12, 27);
        humidity = Number(getRandomInt(40,80)).toFixed(0);
        wind = Number(getRandomInt(64.37,511.77)).toFixed(1)
    }else if(randomWeather === 'Humid'){
        randomWeather = '💧 '+randomWeather;
        temperature = getRandomInt(28, 40);
        humidity = Number(getRandomInt(80,100)).toFixed(0);
        wind = Number(getRandomInt(0,15)).toFixed(1)
    }else if(randomWeather === 'Foggy'){
        randomWeather = '🌁 '+randomWeather;
        temperature = getRandomInt(0, 2.5);
        humidity = Number(getRandomInt(99,100)).toFixed(0);
        wind = Number(getRandomInt(0,0.1)).toFixed(1)
    }else if(randomWeather === 'Snow'){
        randomWeather = '☃️ '+randomWeather;
        temperature = getRandomInt(-40, 0);
        humidity = Number(getRandomInt(5,30)).toFixed(0);
        wind = Number(getRandomInt(0,19.31)).toFixed(1)
    }else if(randomWeather === 'Thundersnow'){
        randomWeather = '🌨️ '+randomWeather;
        randomClouds = 'Very Cloudy';
        temperature = getRandomInt(-40, 0);
        humidity = Number(getRandomInt(5,30)).toFixed(0);
        wind = Number(getRandomInt(12.87,38.62)).toFixed(1)
    }else if(randomWeather === 'Hail'){
        randomWeather = '🌨️ '+randomWeather;
        temperature = getRandomInt(0, 10);
        humidity = Number(getRandomInt(5,30)).toFixed(0);
        wind = Number(getRandomInt(4.82,38.62)).toFixed(1)
    }else if(randomWeather === 'Sleet'){
        randomWeather = '❄️ '+randomWeather;
        temperature = getRandomInt(-3, 0);
        humidity = Number(getRandomInt(50,100)).toFixed(0);
        wind = Number(getRandomInt(0,0.1)).toFixed(1)
    }else if(randomWeather === 'Blizzard'){
        randomWeather = '🌨️ '+randomWeather;
        randomClouds = 'Very Cloudy';
        temperature = getRandomInt(-12, -40);
        humidity = Number(getRandomInt(5,20)).toFixed(0);
        wind = Number(getRandomInt(72,90)).toFixed(1)
    }else if(randomWeather === 'Mist'){
        randomWeather = '🌁 '+randomWeather;
        temperature = getRandomInt(-3, 0);
        humidity = Number(getRandomInt(99,100)).toFixed(0);
        wind = Number(getRandomInt(0,0.1)).toFixed(1)
    }
    Environments.findOneAndUpdate({_id:"6066ef1b293efb46c443a1e1"},{weatherType:randomWeather,cloudType:randomClouds,temperature:temperature,humidity:humidity,wind:wind,type:"Weather"},{new:true},(err,data)=>{
        if(!err)if(data)console.log(`New weather generated ${randomWeather} >> ${randomClouds} > ${temperature} > ${humidity} > ${wind}`)
    });
}
module.exports = {generateWeather};