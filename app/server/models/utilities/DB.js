/**
 * @module models/utilities/DB
 * @author yianni.ververis@qlik.com
 * @param {object} config - The configuration for host, database name, username and password
 * @description
 * main wrapper for connecting and quering the MySql Database
*/

const mysql = require('mysql');
const logger = require('./Logger');

const db = class {
	constructor(input) {
		this.input = input;
		this.connection = null;
	}
	async connect(input) {
		if (!input.host || !input.database || !input.user) {
			return 'Please enter a valid database connection';
		}
		try {
			this.connection = mysql.createConnection(input);
			let error = await this.connection.connect()
			if (!error) {
				return true;
			} else {
				logger.error(`Error connecting to '${input.database}' db`, { Error: `${err}` });
				return error;
			}
		}		
		catch (error) {
			logger.info(`error: ${error}`, { model: `models/utilities/DB::connect` });
			return error;
		}
	}
	async disconnect() {
		try {
			await this.connection.end();
			return true;
		}		
		catch (error) {
			logger.info(`error: ${error}`, { model: `models/utilities/DB::disconnect` });
			return error;
		}
	}
	query(query) {
		return new Promise((resolve, reject) => {
			try {
				this.connection.query(query, function (error, results) {
					if (error) {
						reject(error);
					} else {
						resolve(results);
					}
				});
			}		
			catch (error) {
				site.logger.info(`error: ${error}`, { model: `models/utilities/DB::query()` });
				reject(error)
			}
		})
	}
	async prepare(query) {
		try {
			let sql = (query.select.length > 1) ? 'SELECT ' + query.select.join(', ') + ' ' : 'SELECT ' + query.select.join(' ') + ' ';
			sql += 'FROM ' + query.from.join(' ') + ' ';
			if (query.joins) {
				sql += query.joins.join(' ') + ' ';
			}
			if (query.where.length) {
				sql += 'WHERE ' + query.where.join(' AND ') + ' ';
			}
			if (query.order.length) {
				sql += 'ORDER BY ' + query.order.join(', ');
			}
			if (query.limit && query.limit.length) {
				sql += 'LIMIT ' + query.limit.join(', ');
			}
			return sql;
		}		
		catch (error) {
			site.logger.info(`error: ${error}`, { model: `models/utilities/DB::prepare` });
			return error;
		}
	}
	escape(query) {
		try {
			return mysql.escape(query)
		}		
		catch (error) {
			site.logger.info(`error: ${error}`, { model: `models/utilities/DB::escape` });
			return error;
		}
	}
}

module.exports = db;