/**
 * @name Model: Microsoft
 * @author yianni.ververis@qlik.com
 * @param {boolean} all - return all of the users in the Database
 * @param {integer} count - Return a total of all the users from the sql query
 * @param {string} userUid - get specific user
 * @param {integer} limit - limit results
 * @param {string} username - Find user
 * @param {integer} channelId -put specific Channel, skype, telegram etc
 * @param {object} userData - The message specific data for mass Instant Messaging
 * @description
 * The main Model for all of the Microsoft Channels. Stores and retrieves users from the database
*/

const DbClass = require('./Db');
const logger = require('../utilities/Logger');


const Microsoft = class {
	constructor(input) {
		this._input = input;
	}
	async userListing(_input) {
		try {
			let db = await new DbClass();
			let input = {
				all: (_input.all) ? true : false,
				count: (_input.count) ? true : false,
				userUid: (_input.userUid) ? _input.userUid : null,
				limit: (_input.limit) ? String(_input.limit) : null
			};
			const sql = {
				select: [],
				from: ['user u'],
				where: [],
				order: [],
				limit: []
			};
			if (input.all) {
				sql.select.push('u.*');
			}
			if (input.userUid) {
				sql.select.push('u.*');
				sql.where.push(`u.user_uid='${input.userUid}'`);
			}
			if (input.limit) {
				sql.limit.push(input.limit);
			}
			if (input.count) {
				sql.select.push('COUNT(*) AS total');
			}
			let results = await db.get(sql);
			return results;
		}
		catch (error) {
			logger.info(`error: ${error}`, { model: `models/sense-bot/Microsoft::userListing()` });
			return error;
		}
	}

	async userInsert(_input) {
		try {
			let db = await new DbClass();
			let input = {
				userUid: (_input.userUid) ? String(db.escape(_input.userUid)) : null,
				username: (_input.username) ? String(db.escape(_input.username)) : null,
				channelId: (_input.channelId) ? Number(db.escape(_input.channelId)) : 1,
				userData: (_input.userData) ? String(db.escape(_input.userData)) : null
			};
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
			let results = await db.put(sql);
			return results;
		}
		catch (error) {
			logger.info(`error: ${error}`, { model: `models/sense-bot/Microsoft::userInsert()` });
			return error;
		}
	}
};

module.exports = Microsoft;