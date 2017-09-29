'use strict';

var exports = {}

exports.send = function (status, payload) {
    var result = {
        statusCode: status,
        headers: {
            "Access-Control-Allow-Origin" : "*",
            "Access-Control-Allow-Credentials" : true,
            "Cache-Control": "max-age=0"
        }
    }
    if (payload) result.body = JSON.stringify(payload)
    return result
}

exports.ok = function (payload) {
    return exports.send(200, payload)
}

exports.error = function (payload) {
    return exports.send(500, payload)
}

exports.notFound = function () {
    return exports.send(404)
}

exports.respond = function (payload) {
    return (payload) ? exports.ok(payload) : exports.notFound()
}

module.exports = exports