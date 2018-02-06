/**
 * @module routes/api/sense-bot/microsoft/salesforce
 * @author yianni.ververis@qlik.com
 * @description
 * Salesforce Dialog with all of the commands
*/

const site = require('../../../../models/sense-bot');
const config = require('../../../../config.json');
// let engine = null;
const qvf = config.qvf.salesforce;
let text = config.text.en;
const shared = require('./shared');

module.exports = (bot, builder) => {
	/**
	 * Salesforce Dashboard with a list of KPIs
	 * @function salesforceDashboard()
	 * @param {string} message - The message to send to all users in the database.
	 * @author yianni.ververis@qlik.com
	 * 
	*/
	async function salesforceDashboard(session) {
		try {
			let result = await shared.engine.kpiMulti([
				`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} [Opportunity Amount])`,
				`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
				`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Type]={'New Customer'}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
				`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Type]={'Existing Customer'}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
				`num(Sum({<[Opportunity Won/Lost] = {'WON'}, [Opportunity Close Quarter/Year]={'$(vCurrentQ)'}>} Opportunity_Count)	/Sum({<[Opportunity Is Closed?]={'true'}, [Opportunity Close Quarter/Year]={'$(vCurrentQ)'}>} Opportunity_Count), '##%')`
			]);
			session.send(text.salesforce.dashboard.text, result[0][0].qText, result[1][0].qText, result[2][0].qText, result[3][0].qText, result[4][0].qText);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::salesforce-dashboard()` });
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::salesforce-dashboard()` });
		}
	}

	/**
	 * Salesforce Opportunities with a list of KPIs
	 * @function salesforceOpportunities()
	 * @param {string} message - The message to send to all users in the database.
	 * @author yianni.ververis@qlik.com
	 * 
	*/
	async function salesforceOpportunities(session) {
		try {
			let result = await shared.engine.kpiMulti([
				`num(Sum({<[Opportunity Triphase]={'OPEN'}>} [Opportunity Amount]),'$###,###,###')`,
				`num(Sum({<[Opportunity Triphase]={'OPEN'}>} Opportunity_Count),'###,###,###')`,
				`num(Sum({<[Opportunity Won/Lost]={'WON'}, [Opportunity Closed_Flag]={1}>} [Opportunity Amount]),'$###,###,###')`,
				`num(Sum({<[Opportunity Won/Lost]={'WON'}, [Opportunity Closed_Flag]={1}>} Opportunity_Count),'###,###,###')`,
				`num(Sum({<[Opportunity Won/Lost]={'LOST'}, [Opportunity Closed_Flag]={1}>} [Opportunity Amount]),'$###,###,###')`,
				`num(Sum({<[Opportunity Won/Lost]={'LOST'}, [Opportunity Closed_Flag]={1}>} Opportunity_Count),'###,###,###')`,
				`num(Sum({<[Opportunity Won/Lost] = {'WON'}>} Opportunity_Count)	/Sum({<[Opportunity Is Closed?]={'true'}>} Opportunity_Count), '##%')`
			]);
			session.send(text.salesforce.opportunities.text, result[0][0].qText, result[1][0].qText, result[2][0].qText, result[3][0].qText, result[4][0].qText, result[5][0].qText, result[6][0].qText);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::salesforce-opportunities()` });
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::salesforce-opportunities()` });
		}
	}
	
	/**
	 * Salesforce Main Screen
	 * @function salesforce()
	 * @param {string} message - The message to send to all users in the database.
	 * @author yianni.ververis@qlik.com
	 * 
	*/
	bot.dialog('salesforce', async (session) => {
		try {
			let sessionLanguage = session.preferredLocale().split('-')[0];
			text = (config.text[sessionLanguage]) ? config.text[sessionLanguage] : config.text.en;
            let input = qvf;
            if (qvf.auth) input.userId = session.message.user.id;
			shared.engine = await new site.Enigma(input);
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
				case 'opportunities':
					return salesforceOpportunities(session);
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
};
