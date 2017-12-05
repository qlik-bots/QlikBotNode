/**
 * @module models/sense-bot/Telegram
 * @author yianni.ververis@qlik.com
 * @param {boolean} all - return all of the users in the Database
 * @param {integer} count - Return a total of all the users from the sql query
 * @param {integer} userId - get specific user
 * @param {string} userUid - get specific user
 * @param {integer} limit - limit results
 * @param {string} username - Find user
 * @param {integer} channelId - Specific channel
 * @param {object} userData - The message specific data for mass Instant Messaging
 * @description
 * The main Model for all of the Microsoft Channels. Stores and retrieves users from the database
*/

const db = require('./Db')
// const logger = require('../utilities/Logger');


const telegram = class {
	constructor(input) {
		this._input = input
	}
	userListing(_input) {
		let input = {
			all: (_input.all) ? true : false,
			count: (_input.count) ? true : false,
			userUid: (_input.userUid) ? _input.userUid : null,
			limit: (_input.limit) ? String(_input.limit) : null,
		}
		return new Promise((resolve, reject) => {
			const sqlQuery = {
				select: [],
				from: ['user u'],
				where: [],
				order: [],
				limit: [],
			}
			if (input.all) {
				sqlQuery.select.push('u.*')
			}
			if (input.userUid) {
				sqlQuery.select.push('u.*')
				sqlQuery.where.push(`u.user_uid='${input.userUid}'`)
			}
			if (input.limit) {
				sqlQuery.limit.push(input.limit)
			}
			if (input.count) {
				sqlQuery.select.push('COUNT(*) AS total')
			}
			db.get(sqlQuery)
				.then((results) => {
					resolve(results)
				})
				.catch((error) => {
					reject(error)
				})
		})
	}
	userInsert(_input) {
		let input = {
			userUid: (_input.userUid) ? String(db.escape(_input.userUid)) : null,
			username: (_input.username) ? String(db.escape(_input.username)) : null,
			channelId: (_input.channelId) ? Number(db.escape(_input.channelId)) : 1,
			userData: (_input.userData) ? String(db.escape(_input.userData)) : null
		};
		return new Promise((resolve, reject) => {
			let sql = `
				INSERT INTO user (
					user_uid,
					user_name,
					channel_id,
					user_data
				) VALUES (
					${input.userUid},
					${input.username},
					${input.channelId},
					${input.userData}
				)
			`;
			db.put(sql)
				.then((results) => {
					resolve(results)
				})
				.catch((error) => {
					reject(error)
				})
		})
	}
}

module.exports = telegram;