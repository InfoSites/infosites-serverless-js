'use strict'

var Promise = require('bluebird')

var response = require('./response')
var authorizer = require('./authorizer')

module.exports = {
	http: function (event, context, callback, service, options) {
	    context.callbackWaitsForEmptyEventLoop = false

		if (!options) options = {}

		var token = (event.headers && event.headers.hasOwnProperty('Authorization')) ? event.headers['Authorization'].replace(/Bearer /g, '') : null
        var body = event.body ? JSON.parse(event.body) : null
        var params = event.pathParameters ? event.pathParameters : {}
        if (event.headers && event.headers.hasOwnProperty('Accept-Language')) params.lang = event.headers['Accept-Language']

        var validator = options.validator ? options.validator(body) : Promise.resolve(true)
		var auth = options.authorize ? authorizer(token, options.authorize) : Promise.resolve(true)

        auth.then(function () {
            validator.then(function () {
                service(params, body).then(function (result) {
                    if (typeof(result) === "boolean") {
                        callback(null, result ? response.ok() : response.notFound())
                    } else {
                        callback(null, response.respond(result))
                    }
                }).catch(function (err) {
                    console.error(err)
                    callback(null, response.error(err))
                })
            }).catch(function (err) {
                callback(null, response.badRequest(err))
            })
		}).catch(function () {
            callback(null, response.forbidden())
        })
	},
    sns: function (event, context, callback, service) {
        var all = []
        for (var i in event.Records) {
            var record = event.Records[i]
            var body = JSON.parse(record.Sns.Message)
            all.push(service(body))
        }
        Promise.all(all).then(function () {
            callback(null, 'ok')
        }).catch(function (err) {
            console.error(err)
            callback(err)
        })
    }
}
