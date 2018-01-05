/*************
 * LOCALE
 *************/
const site = require('../../../../models/sense-bot')
const config = require('../../../../config.json');
let text = config.text.en;

module.exports = function (bot, builder) {	
	bot.dialog('localePicker', function (session) {
		try {
			lang = session.preferredLocale();
			let msg = new builder.Message(session)
				.attachmentLayout(builder.AttachmentLayout.list)
				.attachments([
					new builder.HeroCard(session)
						.title(text.language.button)
						// .subtitle("text_prompt")
						.text(text.language.text)
						// .images([builder.CardImage.create(session, 'https://webapps.qlik.com/img/QS_Hub.png')])
						.buttons([
							builder.CardAction.postBack(session, "English", config.text.en.title),
							builder.CardAction.postBack(session, "Español", config.text.es.title),
							// builder.CardAction.postBack(session, "Italiano", "Italiano"),
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
					session.send(msg)
					break;
			}		
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::localePicker()` });
			session.preferredLocale(locale, function (err) {
				if (!err) {
					lang = locale;
					session.endDialog(config.text[locale].language.set);;
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

}
