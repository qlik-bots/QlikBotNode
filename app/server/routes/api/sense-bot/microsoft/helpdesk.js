/**
 * Heldesk Dialog with all of the available commands
 * @module routes/api/sense-bot/microsoft::helpdesk()
 * @author yianni.ververis@qlik.com
*/

const site = require('../../../../models/sense-bot');
const config = require('../../../../config.json');
const shared = require('./shared');
const qvf = config.qvf.helpdesk;
let text = config.text.en;

module.exports = function (bot, builder) {
	/**
	 * Helpdesk Low Priority Cases KPI
	 * @function helpdeskLowPriorityCases()
	 * @param {string} message - The message to send to all users in the database.
	 * @author yianni.ververis@qlik.com
	*/
	bot.dialog('helpdesk', async function (session) {
		try {
			let sessionLanguage = session.preferredLocale().split('-')[0];
			text = (config.text[sessionLanguage]) ? config.text[sessionLanguage] : config.text.en;
			let input = qvf;
			if (qvf.auth) input.userId = session.message.user.id;
			shared.engine = await new site.Enigma(input);
			let msg = new builder.Message(session)
				.attachmentLayout(builder.AttachmentLayout.list)
				.attachments([
					new builder.HeroCard(session)
						.title("HelpDesk")
						.subtitle('https://sense-demo.qlik.com/sense/app/133dab5d-8f56-4d40-b3e0-a6b401391bde?&qlikTicket=X8n_Ywqjz-jx27sS')
						.images([builder.CardImage.create(session, 'https://sense-demo-staging.qlik.com/appcontent/133dab5d-8f56-4d40-b3e0-a6b401391bde/helpdesk_management.jpg')])
				]);
			let msg2 = new builder.Message(session)
				.attachmentLayout(builder.AttachmentLayout.list)
				.attachments([
					new builder.HeroCard(session)
						.text(text.actions)
						.buttons([
							builder.CardAction.postBack(session, "high priority cases", text.helpdesk.highPriorityCases.button),
							builder.CardAction.postBack(session, "medium priority cases", text.helpdesk.mediumPriorityCases.button),
							builder.CardAction.postBack(session, "low priority cases", text.helpdesk.lowPriorityCases.button),
							builder.CardAction.postBack(session, "Total Cases", "Total Cases"),
							builder.CardAction.postBack(session, "make selections", "Make Selections"),
							builder.CardAction.postBack(session, "select open cases", "Select Open Cases"),
							builder.CardAction.postBack(session, "selections", "Show me all Selections"),
							builder.CardAction.postBack(session, "clear", "Clear all Selections"),
							builder.CardAction.postBack(session, "exit", text.exit.button)
						])
				]);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::helpdesk-main()` });
			switch (session.message.text.toLocaleLowerCase()) {
				case 'high priority cases':
					shared.getKpi(session, "High Priority Cases", "Count( {$<Priority={'Low'}, Status -={'Closed'} >} Distinct %CaseId )");
					break;
				case 'medium priority cases':
					shared.getKpi(session, "Medium Priority Cases", "Count( {$<Priority={'Medium'}, Status -={'Closed'} >} Distinct %CaseId )");
					break;
				case 'low priority cases':
					shared.getKpi(session, "Low Priority Cases", "Count( {$<Priority={'Low'}, Status -={'Closed'} >} Distinct %CaseId )");
					break;
				case 'total cases':
					return shared.getKpi(session, "Total Cases", "Count( Distinct %CaseId )");
				case 'make selections':
					// session.beginDialog('helpdeskSelection'); // A Waterfall approach of the selection process. Not Ready yet
					break;
				case 'select open cases':
					return shared.select(session, "Cases Open/Closed", "Open Cases");
				case 'selections':
				case 'selected':
					return shared.getSelections(session);
					break;
				case 'clear':
					return shared.clear(session);
				case 'exit':
					shared.engine.disconnect();
					session.endDialog(text.exit.text);
					break;
				default:
					session.send(msg);
					session.send(msg2);
					break;
			}
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::helpdesk-main()` });
		}
	})
		.triggerAction({ matches: /^Helpdesk$/i });
};