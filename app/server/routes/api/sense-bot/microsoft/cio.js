/*************
 * CIO DASHBOARD
 *************/
const site = require('../../../../models/sense-bot')
const config = require('../../../../config.json');
let engine = null;
const qvf = config.qvf.cio;
let text = config.text.en;

module.exports = function (bot, builder) {	
	bot.dialog('cio', async function (session) {
		try {
			let sessionLanguage = session.preferredLocale().split('-')[0];
			text = (config.text[sessionLanguage]) ? config.text[sessionLanguage] : config.text.en;
			engine = await new site.enigma(qvf)
			let msg = await new builder.Message(session);
			msg.attachmentLayout(builder.AttachmentLayout.list)
			msg.attachments([
				new builder.HeroCard(session)
					.title("CIO")
					.subtitle('https://webapps.qlik.com/CIO/index.html')
					.text(text.actions)
					.images([builder.CardImage.create(session, 'https://sense-demo-staging.qlik.com/appcontent/d0dd198f-138b-41d8-a099-5c5071bd6b33/CIO-desktop-development.jpg')])
					.buttons([
						builder.CardAction.postBack(session, "management", "Management"),
						builder.CardAction.postBack(session, "customer-service", "Customer Service"),
						builder.CardAction.postBack(session, "exit", "Exit"),
					])
			]);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::cio-main()` });
			switch (session.message.text.toLocaleLowerCase()) {
				case 'management':
					return cioManagement(session);
					break;
				case 'customer-service':
					return cioCustomerService(session);
					break;
				case 'exit':
					engine.disconnect()
					session.endDialog(text.exit.text)
					break;
				default:
					session.send(msg)
					break;
			}
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::cio-main()` });
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::cio-main()` });
		}
	})
		.triggerAction({ matches: /^Cio$/i });

	async function cioManagement (session) {
		try {
			let result = await engine.kpiMulti([
				`num(sum([Cost] * History* _CurrYTD),'#,##0')`,
				`num(sum([Cost Budget] * History* _CurrYTD) - sum([Cost] * History* _CurrYTD),'#,##0')`,
				`num((sum([Cost Budget] * History* _CurrYTD) - sum([Cost] * History* _CurrYTD))/(sum([Cost] * History* _CurrYTD)),'#,###.#0%')`,
				`num(avg({<HDStatus=, _CurrYTD={1}>}SLA),'##.##%')`,
				`num((avg({<HDStatus=, _CurrYTD={1}>}SLA))-.9970,'##.##%')`
			])
			session.send(text.cio.management.text, result[0][0].qText, result[1][0].qText, result[2][0].qText, result[3][0].qText, result[4][0].qText);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::cioManagement()` });			
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::cioManagement()` });
		}
	}

	async function cioCustomerService (session) {
		try {
			let result = await engine.kpiMulti([
				`num(Avg({<HDStatus=, Year={$(=$(vMaxYear))}>}[Customer Grade]),'#,###.##')`,
				`num(Avg({<[Case Status]=, Year={$(=$(vMaxYear))}>}[Customer Grade])-3.75,'##.##')`,
				`num(sum({<HDStatus = {'Resolved'} >}ticketCounter),'#,##0')`,
				`num(sum({<HDStatus = {'Open', 'Pending'} >}ticketCounter),'#,##0')`,
				`num(((Date(Avg([resolution time]))-Floor(Avg([resolution time])))*(24*60))/60, '##.##')`,
				`num(((Date(0.08334)-Floor(0.08334))*(24*60))/60, '##.##')`,
				`num(((Date(0.08334)-Floor(0.08334))*(24*60))/60, '##.##')`
			])
			session.send(text.cio.customer.text, result[0][0].qText, result[1][0].qText, result[2][0].qText, result[3][0].qText, result[4][0].qText, result[5][0].qText, result[6][0].qText);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::cioCustomerService()` });			
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::cioCustomerService()` });
		}
	}
}
