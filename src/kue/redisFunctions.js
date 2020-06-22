const redis = require('redis')
const config = require('../config')
const kue = require('kue')
let err = {
    history: []
}
let client
let queue
const getRedisClient = function () {
    if (client == undefined) {
        client = redis.createClient()
        client.auth(
            config.REDIS_PWD, function (err) {
                if (err) {
                    console.error(err)
                }
            }
        )
    }
    return client
}


const getPromise = function(key) {
    return new Promise(function(res, rej){
        getRedisClient().get(key, function(err, reply) {
            if (err) {
                return rej(err)
            }
            return res(reply)
        })
    })
}

/**
 *
 * @param port
 * @returns {*}
 */
const createKueQueue = function(port) {
    if (queue == undefined) {
        queue = kue.createQueue(
            {
                redis: {
                    createClientFactory: function() {
                        return getRedisClient()
                    }
                }
            }
        )
    }
    return queue
}

module.exports = {getRedisClient, getPromise, createKueQueue}
