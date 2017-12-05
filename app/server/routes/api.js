/**
 * @name Route: api
 * @author yianni.ververis@qlik.com
 * @description
 * Handle all of the https://{domain}/api/ routes
*/

const express = require('express')
const router = express.Router()

const senseBot = require('./api/sense-bot')

router.use('/sense-bot', senseBot)

module.exports = router;