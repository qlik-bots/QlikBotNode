/**
 * @module routes/api/sense-bot/microsoft
 * @author yianni.ververis@qlik.com
 * @description
 * Handle all of the https://{domain}/api/sense-bot/microsoft/ routes
 * skype: https://join.skype.com/bot/bc69f77c-331a-4775-808b-4346866f082f
 * skype-svc: https://join.skype.com/bot/514357d9-b843-449f-8a1d-a1dfbf065978?add
*/

const express = require('express');
const site = require('../../../../models/sense-bot');
const builder = require('botbuilder');
const router = express.Router();
const config = require('../../../../config.json');

let lang = 'en';
let engine = null;

// Create chat connector for communicating with the Bot Framework Service
let connector = new builder.ChatConnector({
	appId: process.env.SKYPE_BOT_ID_SVC,
	appPassword: process.env.SKYPE_BOT_PASSWORD_SVC
});

// let bot = new builder.UniversalBot(connector);
// let bot = new builder.UniversalBot(connector, {storage: new builder.MemoryBotStorage()}, [ function (session) {
let bot = new builder.UniversalBot(connector, [async function (session) {
	try {
		lang = session.preferredLocale();
		// prompt = session.localizer.gettext(session.preferredLocale(), "text_prompt");
		// Store the user for Sending Messages later
		let db = await new site.Microsoft();
		let result = await db.userListing({
			userUid: session.message.user.id,
			limit: 1
		});
		if (!result.length) {
			let channelId = 1;
			if (session.message.address.channelId === 'msteams') {
				channelId = 2;
			} else if (session.message.address.channelId === 'cortana') {
				channelId = 3;
			} else if (session.message.address.channelId === 'webchat') {
				channelId = 5;
			}
			await db.userInsert({
				userUid: session.message.user.id,
				username: session.message.user.name,
				channelId: channelId,
				userData: JSON.stringify(session.message.address)
			});
		}
		// Open Dialogs based on the text the user types
		if (
			session.message.text === "webapps" ||
			session.message.text === "helpdesk" ||
			session.message.text === "cio" ||
			session.message.text === "salesforce" ||
			session.message.text === "help"
		) {
			session.send(`Hi! You are connected to ${session.message.text}. What do you want to do?`);
			session.send(session.message.address);
			session.beginDialog(session.message.text);
		} else {
			session.send(config.text[lang].no_command, session.message.text);
			session.beginDialog('help');
		}
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::UniversalBot` });
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::UniversalBot()` });
	}
}]);

bot.on('contactRelationUpdate', function (message) {
	try {
		if (message.action === 'add') {
			var reply = new builder.Message()
				.address(message.address)
				.text(config.text[lang].welcome, message.user ? message.user.name : 'there');
			bot.send(reply);
		}
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::contactRelationUpdate()` });
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::contactRelationUpdate()` });
	}
});

// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (message) {
	try {
		if (message.membersAdded && message.membersAdded.length > 0) {
			var reply = new builder.Message()
				.address(message.address)
				.text(config.text[lang].welcome, message.user ? message.user.name : 'there');
			bot.send(reply);
		} else if (message.membersRemoved) {
			// See if bot was removed
			var botId = message.address.bot.id;
			for (var i = 0; i < message.membersRemoved.length; i++) {
				if (message.membersRemoved[i].id === botId) {
					var reply = new builder.Message()
						.address(message.address)
						.text(config.text[lang].exit.text);
					bot.send(reply);
					break;
				}
			}
		}
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::conversationUpdate()` });
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::conversationUpdate()` });
	}
});

// Exit from all dialogs
bot.dialog('exit', [function (session) {
	try {
		if (engine) { engine.disconnect(); }
		session.endDialog(config.text[lang].exit.text);
		session.beginDialog('help');
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::exit()` });
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::exit()` });
	}
}])
	.triggerAction({ matches: /^exit$/i });

require('./help')(bot, builder);
require('./locale')(bot, builder);
require('./salesforce')(bot, builder);
require('./helpdesk')(bot, builder);
require('./cio')(bot, builder);
require('./webapps')(bot, builder);

// SKYPE SENSE BOT POST MESSAGES
router.post('/', connector.listen());

// POST MESSAGE TO ALL USERS
router.post('/adhoc/', async (req, res) => {
	try {
		let db = await new site.Microsoft();
		let result = await db.userListing({ all: true });
		if (result.length == 1) {
			let value = result[0].user_data;
			value = value.replace("\\", "");
			value = JSON.parse(value);
			var msg = new builder.Message().address(value);
			msg.text(req.body.message);
			msg.textLocale('en-US');
			bot.send(msg);
		} else if (result.length > 1) {
			for (let value of result) {
				var msg = new builder.Message().address(JSON.parse(value.user_data));
				msg.text(req.body.message);
				msg.textLocale('en-US');
				bot.send(msg);
			}
		}
		res.send({
			success: true,
			data: `Message "${req.body.message}" Send!`
		});
		site.logger.info(`adhoc`, { route: `${req.originalUrl}` });
		site.logger.info(`adhoc-message`, `${req.body.message}`);
	}
	catch (error) {
		site.logger.info(`adhoc-error`, { route: `${JSON.stringify(error)}` });
		res.send({
			success: false,
			data: `Error: "${JSON.stringify(error)}"`
		});
	}
});

module.exports = router;