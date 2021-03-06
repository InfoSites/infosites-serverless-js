'use strict'

var Promise = require('bluebird')
var _ = require('lodash')

var response = require('./response')
var authorizer = require('./authorizer')

module.exports = {
	http: function (event, context, callback, service, options) {
	    context.callbackWaitsForEmptyEventLoop = false

		if (!options) options = {}

		var req = { headers: event.headers }

		var token = (event.headers && event.headers.hasOwnProperty('Authorization')) ? event.headers['Authorization'].replace(/Bearer /g, '') : null
        var body = event.body ? JSON.parse(event.body) : null
        var params = _.merge({}, event.pathParameters, event.queryStringParameters)
        if (event.headers && event.headers.hasOwnProperty('Accept-Language')) req.lang = event.headers['Accept-Language']

        var validator = options.validator ? options.validator(body) : Promise.resolve(true)
		var auth = options.authorize ? authorizer(token, options.authorize) : Promise.resolve(true)

        auth.then(function (user) {
			req.user = user
            validator.then(function () {
                service(req, params, body).then(function (result) {
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
        context.callbackWaitsForEmptyEventLoop = false

        var all = []

        event.Records.forEach(record => {
            var body = JSON.parse(record.Sns.Message)
            all.push(service(body))
        })

        Promise.all(all).then(result => {
            callback()
        }).catch(err => {
            console.error(err)
            callback(err)
        })
    }
}
