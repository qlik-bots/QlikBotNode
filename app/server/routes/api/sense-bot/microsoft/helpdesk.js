/**
 * Heldesk Dialog with all of the available commands
 * @module routes/api/sense-bot/microsoft::helpdesk()
 * @author yianni.ververis@qlik.com
*/

const site = require('../../../../models/sense-bot');
const config = require('../../../../config.json');
let engine = null;
const qvf = config.qvf.helpdesk;
let text = config.text.en;

module.exports = function (bot, builder) {
	/**
	 * Helpdesk High Priority Cases KPI
	 * @function helpdeskHighPriorityCases()
	 * @param {string} message - The message to send to all users in the database.
	 * @author yianni.ververis@qlik.com
	*/
	async function helpdeskHighPriorityCases (session) {
		try {
			let result = await engine.kpi("Count( {$<Priority={'High'}, Status -={'Closed'} >} Distinct %CaseId )");
			session.send(text.helpdesk.highPriorityCases.text, result[0][0].qText);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::helpdeskHighPriorityCases()` });			
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::helpdeskHighPriorityCases()` });
		}
	}
	
	/**
	 * Helpdesk Medium Priority Cases KPI
	 * @function helpdeskMediumPriorityCases()
	 * @param {string} message - The message to send to all users in the database.
	 * @author yianni.ververis@qlik.com
	*/
	async function helpdeskMediumPriorityCases (session) {
		try {
			let result = await engine.kpi("Count( {$<Priority={'Medium'}, Status -={'Closed'} >} Distinct %CaseId )");
			session.send(text.helpdesk.mediumPriorityCases.text, result[0][0].qText);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::helpdeskMediumPriorityCases()` });			
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::helpdeskMediumPriorityCases()` });
		}
	}
	
	/**
	 * Helpdesk Low Priority Cases KPI
	 * @function helpdeskLowPriorityCases()
	 * @param {string} message - The message to send to all users in the database.
	 * @author yianni.ververis@qlik.com
	*/
	async function helpdeskLowPriorityCases (session) {
		try {
			let result = await engine.kpi("Count( {$<Priority={'Low'}, Status -={'Closed'} >} Distinct %CaseId )");
			session.send(text.helpdesk.lowPriorityCases.text, result[0][0].qText);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::helpdeskLowPriorityCases()` });			
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::helpdeskLowPriorityCases()` });
		}
	}
		
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
			engine = await new site.Enigma(qvf);
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
							builder.CardAction.postBack(session, "high-priority-cases", text.helpdesk.highPriorityCases.button),
							builder.CardAction.postBack(session, "medium-priority-cases", text.helpdesk.mediumPriorityCases.button),
							builder.CardAction.postBack(session, "low-priority-cases", text.helpdesk.lowPriorityCases.button),
							builder.CardAction.postBack(session, "exit", text.exit.button)
						])
				]);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::helpdesk-main()` });
			switch (session.message.text.toLocaleLowerCase()) {
				case 'high-priority-cases':
					return helpdeskHighPriorityCases(session, msg2);
				case 'medium-priority-cases':
					return helpdeskMediumPriorityCases(session);
				case 'low-priority-cases':
					return helpdeskLowPriorityCases(session);
				case 'exit':
					engine.disconnect();
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
