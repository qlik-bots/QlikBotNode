/**
 * @module routes/api/sense-bot/microsoft::locale()
 * @author yianni.ververis@qlik.com
 * @description
 * Dialog to change he preferred language
*/

const site = require('../../../../models/sense-bot');
const config = require('../../../../config.json');
let text = config.text.en;

module.exports = function (bot, builder) {	
	bot.dialog('localePicker', function (session) {
		try {
			let sessionLanguage = session.preferredLocale().split('-')[0];
			text = (config.text[sessionLanguage]) ? config.text[sessionLanguage] : config.text.en;
			let msg = new builder.Message(session)
				.attachmentLayout(builder.AttachmentLayout.list)
				.attachments([
					new builder.HeroCard(session)
						.title(text.language.button)
						.text(text.language.text)
						.buttons([
							builder.CardAction.postBack(session, "English", config.text.en.title),
							builder.CardAction.postBack(session, "Español", config.text.es.title),
							builder.CardAction.postBack(session, "Ελληνικά", config.text.el.title)
						])
				]);
			// Update preferred locale
			var locale;
			switch (session.message.text.toLocaleLowerCase()) {
				case 'english':
					locale = 'en';
					break;
				case 'español':
					locale = 'es';
					break;
				case 'italiano':
					locale = 'it';
					break;
				case 'ελληνικά':
					locale = 'el';
					break;
				default:
					session.send(msg);
					break;
			}		
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::localePicker()` });
			session.preferredLocale(locale, function (err) {
				if (!err) {
					session.endDialog(config.text[locale].language.set);
					session.beginDialog('help');
				} else {
					session.error(err);
				}
			});
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::localePicker()` });
		}
	});

};