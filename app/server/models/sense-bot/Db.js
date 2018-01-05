/**
 * @module models/sense-bot/Db
 * @author yianni.ververis@qlik.com
 * @param {object} config - The configuration for host, database name, username and password
 * @description
 * Extend of the main DB class with the config file
*/

const DbClass = require('../utilities/DB')
const logger = require('../utilities/Logger');

const db = class extends DbClass {
	constructor(input) {
		super(input);
		this.input = input;
		this.config = {
			host: 'localhost',
			user: 'sensebot',
			password: 'demoteam',
			database: 'sensebot'
		};
	}
	async get(query) {
		try {
			let connect = await super.connect(this.config);
			let sql = await super.prepare(query);
			let results = await super.query(sql);
			super.disconnect();
			return results;
		}		
		catch (error) {
			logger.info(`error: ${error}`, { model: `models/sense-bot/Db::get` });
			return error;
		}
	}
	async put(query) {
		try {
			let connect = await super.connect(this.config);
			let results = await super.query(query);
			super.disconnect();
			return results;
		} 
		catch (error) {
			logger.info(`error: ${error}`, { model: `models/sense-bot/Db::put` });
			return error;
		}
	}
}

module.exports = db;