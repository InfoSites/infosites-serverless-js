'use strict'

var jwt = require('jsonwebtoken')

var CLIENT_SECRET = process.env.CLIENT_SECRET

module.exports = function (token, scope) {
    return new Promise(function (resolve, reject) {
        if (token) {
            jwt.verify(token, CLIENT_SECRET, (err, payload) => {
                if (err) {
                    reject(err)
                } else {
                    if (typeof(scope) === "boolean") {
                        resolve()
                    } else {
                        var scopes = payload.scopes
                        if (scopes && scopes.indexOf(scope) > -1) {
                            resolve()
                        } else {
                            reject()
                        }
                    }
                }
            })
        } else {
            reject()
        }
    })
}