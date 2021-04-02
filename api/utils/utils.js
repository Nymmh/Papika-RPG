/**
 * @module utils
 */

/**
 * @param {number} min
 * @param {number} max
 */
 exports.getRandomInt = (min,max)=>{
    return (Math.random() * (max - min + 1) + min).toFixed(2);
}