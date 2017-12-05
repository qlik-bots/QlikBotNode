/**
 * @name Model: DB
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
	connect(input) {
		if (!input.host || !input.database || !input.user) {
			reject('Please enter a valid database connection')
		}
		return new Promise((resolve, reject) => {
			this.connection = mysql.createConnection(input);
			this.connection.connect((err) => {
				if (!err) {
					resolve(true)
				} else {
					logger.error(`Error connecting to '${input.database}' db`, { Error: `${err}` });
					reject(err)
				}
			});
		})
	}
	disconnect() {
		return new Promise((resolve) => {
			resolve(this.connection.end())
		})
	}
	query(query) {
		return new Promise((resolve, reject) => {
			this.connection.query(query, function (error, results) {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		})
	}
	prepare(query) {
		return new Promise((resolve) => {
			let sql = (query.select.length > 1) ? 'SELECT ' + query.select.join(', ') + ' ' : 'SELECT ' + query.select.join(' ') + ' '
			sql += 'FROM ' + query.from.join(' ') + ' '
			if (query.joins) {
				sql += query.joins.join(' ') + ' '
			}
			if (query.where.length) {
				sql += 'WHERE ' + query.where.join(' AND ') + ' '
			}
			if (query.order.length) {
				sql += 'ORDER BY ' + query.order.join(', ')
			}
			if (query.limit && query.limit.length) {
				sql += 'LIMIT ' + query.limit.join(', ')
			}
			resolve(sql);
		})
			.catch((error) => {
				logger.error(`error: ${JSON.stringify(error)}`, { model: `DB` });
				reject(error)
			});
	}
	escape(query) {
		return mysql.escape(query)
	}
}

module.exports = db;