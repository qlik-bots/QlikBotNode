/**
 * @module routes/api/sense-bot/microsoft::help()
 * @author yianni.ververis@qlik.com
 * @description
 * HThe main dialog for all commands
*/

const site = require('../../../../models/sense-bot');
const config = require('../../../../config.json');
let text = config.text.en;

module.exports = function (bot, builder) {
	bot.dialog('help', [ function (session) {
		try {
			// Capture one language per region like: 'en-US', 'en-NZ' etc, will all use 'en'			
			let sessionLanguage = session.preferredLocale().split('-')[0];
			text = (config.text[sessionLanguage]) ? config.text[sessionLanguage] : config.text.en;
			let msg = new builder.Message(session);
			msg.attachmentLayout(builder.AttachmentLayout.list);
			msg.attachments([
				new builder.HeroCard(session)
					.title(text.help.title)
					// .subtitle("text_prompt")
					.text(text.help.text)
					// .images([builder.CardImage.create(session, 'https://webapps.qlik.com/img/QS_Hub.png')])
					.buttons([
						builder.CardAction.postBack(session, "salesforce", text.salesforce.title),
						builder.CardAction.postBack(session, "cio", text.cio.title),
						builder.CardAction.postBack(session, "helpdesk", text.helpdesk.title),
						builder.CardAction.postBack(session, "language", text.language.button)
					])
			]);
			switch (session.message.text.toLocaleLowerCase()) {
				case 'salesforce':
					session.beginDialog('salesforce');
					break;
				case 'cio':
					session.beginDialog('cio');
					break;
				case 'helpdesk':
					session.beginDialog('helpdesk');
					break;
				case 'language':
					session.beginDialog('localePicker');
					break;
				default:
					session.send(msg);
					break;
			}
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::help()` });
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::help()` });
		}
	}])
		.triggerAction({ matches: /^Help$/i });
};