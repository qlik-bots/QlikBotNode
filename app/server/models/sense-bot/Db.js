/**
 * @name Model: Db
 * @author yianni.ververis@qlik.com
 * @param {object} config - The configuration for host, database name, username and password
 * @todo remove the wrapper and have classes communicate directly with models/utilities/DB.js
 * @description
 * Wrapper of the main DB class with the config file
*/

const dbClass = require('../utilities/DB')
const logger = require('../utilities/Logger');

const me = {}
const database = new dbClass()

me.config = {
	host: 'localhost',
	user: 'sensebot',
	password: 'demoteam',
	database: 'sensebot'
}

me.get = (query) => {
	return new Promise((resolve, reject) => {
		database.connect(me.config)
			.then(() => {
				database.prepare(query)
					.then((sql) => {
						logger.info(`sql: ${sql}`, { model: `DB get` });
						database.query(sql)
							.then((results) => {
								database.disconnect()
								resolve(results)
							})
					})
			})
			.catch((error) => {
				reject(error)
			})
	})
}

me.put = (query) => {
	return new Promise((resolve, reject) => {
		database.connect(me.config)
			.then(() => {
				logger.info(`sql: ${query}`, { model: `DB put` });
				database.query(query)
					.then((results) => {
						database.disconnect()
						resolve(results)
					})
			})
			.catch((error) => {
				reject(error)
			})
	})
}

me.escape = (query) => {
	return database.escape(query)
}

module.exports = me;