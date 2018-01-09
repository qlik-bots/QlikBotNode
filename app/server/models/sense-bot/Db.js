/**
 * @name Model: Db
 * @author yianni.ververis@qlik.com
 * @param {object} query - get,put
 * @description
 * 
*/

const DbClass = require('../utilities/DB');
const logger = require('../utilities/Logger');

const db = class extends DbClass {
	constructor(input) {
		super(input);
		this.input = input;
		this.config = {
			host: 'localhost',
			user: 'sensebot',
			password: '1234',
			database: 'sensebot'
		};
	}
	async get(query) {
		try {
			await super.connect(this.config);
			let sql = await super.prepare(query);
			let results = await super.query(sql);
			await super.disconnect();
			return results;
		}		
		catch (error) {
			logger.info(`error: ${error}`, { model: `models/sense-bot/Db::get` });
			return error;
		}
	}
	async put(query) {
		try {
			await super.connect(this.config);
			let results = await super.query(query);
			await super.disconnect();
			return results;
		} 
		catch (error) {
			logger.info(`error: ${error}`, { model: `models/sense-bot/Db::put` });
			return error;
		}
	}
};

module.exports = db;