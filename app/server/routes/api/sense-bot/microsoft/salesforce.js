/*************
 * SALESFORCE
 *************/
const site = require('../../../../models/sense-bot');
const config = require('../../../../config.json');
let engine = null;
const qvf = config.qvf.salesforce;
let text = config.text.en;

module.exports = (bot, builder) => {	
	bot.dialog('salesforce', async (session) => {
		try {
			text = config.text[session.preferredLocale()];
			engine = await new site.Enigma(qvf);
			let msg = await new builder.Message(session);
			msg.attachmentLayout(builder.AttachmentLayout.list);
			msg.attachments([
				new builder.HeroCard(session)
					.title("Salesforce")
					.subtitle('https://webapps.qlik.com/salesforce/index.html')
					.text(text.actions)
					.images([builder.CardImage.create(session, 'https://webapps.qlik.com/img/2017_salesforce.png')])
					.buttons([
						builder.CardAction.postBack(session, "dashboard", text.salesforce.dashboard.button),
						builder.CardAction.postBack(session, "opportunities", text.salesforce.opportunities.button),
						builder.CardAction.postBack(session, "chart-current-quarter", "Current Quarter Barchart"),
						builder.CardAction.postBack(session, "chart-current-quarter-opportunities", "Current Quarter Opportunities Barchart"),
						builder.CardAction.postBack(session, "exit", text.exit.button)
					])
			]);
			switch (session.message.text.toLocaleLowerCase()) {
				case 'dashboard':
					return salesforceDashboard(session);
					break;
				case 'opportunities':
					return salesforceOpportunities(session);
					break;
				case 'chart-current-quarter':
					return salesforceChartCurrentQuarter(session);
					break;
				case 'chart-current-quarter-opportunities':
					return salesforceChartCurrentQuarterOpportunities(session);
					break;
				case 'chart-webapps':
					return salesforceChartWebapps(session);
					break;
				default:
					session.send(msg);
					break;
			}	
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::salesforce()` });
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::salesforce()` });
		}
	})
		.triggerAction({ matches: /^salesforce$/i });
	
	async function salesforceDashboard (session) {
		try {
			let result = await engine.kpiMulti([
				`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} [Opportunity Amount])`,
				`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
				`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Type]={'New Customer'}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
				`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Type]={'Existing Customer'}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
				`num(Sum({<[Opportunity Won/Lost] = {'WON'}, [Opportunity Close Quarter/Year]={'$(vCurrentQ)'}>} Opportunity_Count)	/Sum({<[Opportunity Is Closed?]={'true'}, [Opportunity Close Quarter/Year]={'$(vCurrentQ)'}>} Opportunity_Count), '##%')`,
			])
			session.send(text.salesforce.dashboard.text, result[0][0].qText, result[1][0].qText, result[2][0].qText, result[3][0].qText, result[4][0].qText);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::salesforce-dashboard()` });
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::salesforce-dashboard()` });
		}
	}
	
	async function salesforceOpportunities (session) {
		try {
			let result = await engine.kpiMulti([
				`num(Sum({<[Opportunity Triphase]={'OPEN'}>} [Opportunity Amount]),'$###,###,###')`,
				`num(Sum({<[Opportunity Triphase]={'OPEN'}>} Opportunity_Count),'###,###,###')`,
				`num(Sum({<[Opportunity Won/Lost]={'WON'}, [Opportunity Closed_Flag]={1}>} [Opportunity Amount]),'$###,###,###')`,
				`num(Sum({<[Opportunity Won/Lost]={'WON'}, [Opportunity Closed_Flag]={1}>} Opportunity_Count),'###,###,###')`,
				`num(Sum({<[Opportunity Won/Lost]={'LOST'}, [Opportunity Closed_Flag]={1}>} [Opportunity Amount]),'$###,###,###')`,
				`num(Sum({<[Opportunity Won/Lost]={'LOST'}, [Opportunity Closed_Flag]={1}>} Opportunity_Count),'###,###,###')`,
				`num(Sum({<[Opportunity Won/Lost] = {'WON'}>} Opportunity_Count)	/Sum({<[Opportunity Is Closed?]={'true'}>} Opportunity_Count), '##%')`,
			])
			session.send(text.salesforce.opportunities.text, result[0][0].qText, result[1][0].qText, result[2][0].qText, result[3][0].qText, result[4][0].qText, result[5][0].qText, result[6][0].qText);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::salesforce-opportunities()` });
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::salesforce-opportunities()` });
		}
	}	
}
