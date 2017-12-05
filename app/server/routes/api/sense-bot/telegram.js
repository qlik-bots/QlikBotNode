/**
 * @module routes/api/sense-bot/telegram
 * @author yianni.ververis@qlik.com
 * @todo move the qvfs into a config file
 * @description
 * Handle all of the https://{domain}/api/sense-bot/telegram/ routes
*/

const express = require('express')
const site = require('../../../models/sense-bot')
const router = express.Router()
const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
var config = require('../../../config.json');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
const db = new site.telegram()
let engine = null;

/**
 * Connection parameters for the QVFs
 * @todo move the qvfs into a config file
*/
let qvf = config.qvf;

router.post('/', (req, res) => {
	site.logger.info(`main`, { route: `api/sense-bot/telegram` });
	res.send({
		success: true,
		data: `Bot Started!`
	});
})

/**
 * Post adhoc messages to telegram users
*/
router.post('/adhoc/', (req, res) => {
	site.logger.info(`adhoc`, { route: `api/sense-bot/telegram` });
	res.send({
		success: true,
		data: `Message: '${req.body.message}' Send!`
	});
	site.logger.info(`Loaded`, { route: `${req.originalUrl}` });
});


/*****************
 * MAIN
 * bot.telegram.setWebhook('https://localhost:3443/api/sense-bot/telegram/adhoc/')
 ****************/
bot.use(session())
bot.use(Telegraf.log())
bot.start((ctx) => ctx.reply('Welcome to Qlik Sense Bot'))


/*****************
 * SALESFORCE
 ****************/
// BUTTONS
const keyboardSalesforce = Markup.inlineKeyboard([
	Markup.urlButton('❤️', 'https://webapps.qlik.com/salesforce/index.html'),
	Markup.callbackButton('Dashboard', 'salesforceDashboard'),
	Markup.callbackButton('Opportunities', 'salesforceOpportunities'),
	Markup.callbackButton('Chart', 'salesforceChart')
])
// COMMANDS - ACTIONS
bot.command('salesforce', (ctx) => {
	site.logger.info(`salesforce-main`, { route: `api/sense-bot/telegram` });
	ctx.reply('Welcome to Salesforce')
	ctx.replyWithPhoto({ url: 'https://webapps.qlik.com/img/2017_salesforce.png' })
	ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboardSalesforce))
})
bot.action('salesforceChart', (ctx) => {
	site.logger.info(`salesforce-chart`, { route: `api/sense-bot/telegram` });
	ctx.replyWithPhoto({ url: 'http://sense-demo-staging.qlik.com:1337/133dab5d-8f56-4d40-b3e0-a6b401391bde/PAppmU' })
})
bot.action('salesforceDashboard', (ctx) => {
	site.logger.info(`salesforce-dashboard`, { route: `api/sense-bot/telegram` });
	engine = new site.enigma(qvf.salesforce)
	engine.kpiMulti([
		`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} [Opportunity Amount])`,
		`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
		`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Type]={'New Customer'}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
		`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Type]={'Existing Customer'}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
		`num(Sum({<[Opportunity Won/Lost] = {'WON'}, [Opportunity Close Quarter/Year]={'$(vCurrentQ)'}>} Opportunity_Count)	/Sum({<[Opportunity Is Closed?]={'true'}, [Opportunity Close Quarter/Year]={'$(vCurrentQ)'}>} Opportunity_Count), '##%')`,
	])
		.then(result => {
			ctx.replyWithHTML(`
	<b>Salesforce - Dashboard</b>
	OPEN OPPS VALUE: <b>${result[0][0].qText}</b>
	OPEN OPPS: <b>${result[1][0].qText}</b>
	NEW CUSTOMERS: <b>${result[2][0].qText}</b>
	EXISTING CUSTOMERS: <b>${result[3][0].qText}</b>
	WIN RATE: <b>${result[4][0].qText}</b>
		`, Extra.markup(keyboardSalesforce));
		})
		.catch(error => ctx.reply(`Error: ${error}`))
})
bot.action('salesforceOpportunities', (ctx) => {
	site.logger.info(`salesforce-opportunities`, { route: `api/sense-bot/telegram` });
	engine = new site.enigma(qvf.salesforce)
	engine.kpiMulti([
		`num(Sum({<[Opportunity Triphase]={'OPEN'}>} [Opportunity Amount]),'$###,###,###')`,
		`num(Sum({<[Opportunity Triphase]={'OPEN'}>} Opportunity_Count),'###,###,###')`,
		`num(Sum({<[Opportunity Won/Lost]={'WON'}, [Opportunity Closed_Flag]={1}>} [Opportunity Amount]),'$###,###,###')`,
		`num(Sum({<[Opportunity Won/Lost]={'WON'}, [Opportunity Closed_Flag]={1}>} Opportunity_Count),'###,###,###')`,
		`num(Sum({<[Opportunity Won/Lost]={'LOST'}, [Opportunity Closed_Flag]={1}>} [Opportunity Amount]),'$###,###,###')`,
		`num(Sum({<[Opportunity Won/Lost]={'LOST'}, [Opportunity Closed_Flag]={1}>} Opportunity_Count),'###,###,###')`,
		`num(Sum({<[Opportunity Won/Lost] = {'WON'}>} Opportunity_Count)	/Sum({<[Opportunity Is Closed?]={'true'}>} Opportunity_Count), '##%')`,
	])
		.then(result => {
			ctx.replyWithHTML(`
	<b>Salesforce - Opportunities</b>
	OPEN OPPS VALUE: <b>${result[0][0].qText}</b>
	OPEN OPPS: <b>${result[1][0].qText}</b>
	CLOSED WON OPPS VALUE: <b>${result[2][0].qText}</b>
	CLOSED WON OPPS: <b>${result[3][0].qText}</b>
	CLOSED LOST APPS VALUE: <b>${result[4][0].qText}</b>
	CLOSED LOST APPS: <b>${result[5][0].qText}</b>
	WIN RATE: <b>${result[6][0].qText}</b>
		`, Extra.markup(keyboardSalesforce));
		})
		.catch(error => ctx.reply(`Error: ${error}`))
})

/*****************
 * CIO DASHBOARD
 ****************/
// BUTTONS
const keyboardCio = Markup.inlineKeyboard([
	Markup.urlButton('❤️', 'https://webapps.qlik.com/CIO/index.html'),
	Markup.callbackButton('Management', 'cioManagement'),
	Markup.callbackButton('Customer Service', 'cioCustomerService')
])
// COMMANDS - ACTIONS
bot.command('cio', (ctx) => {
	site.logger.info(`cio-main`, { route: `api/sense-bot/telegram` });
	ctx.reply('Welcome to CIO Dashboard')
	ctx.replyWithPhoto({ url: 'https://sense-demo-staging.qlik.com/appcontent/d0dd198f-138b-41d8-a099-5c5071bd6b33/CIO-desktop-development.jpg' })
	ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboardCio))
})
bot.action('cioManagement', (ctx) => {
	site.logger.info(`cio-management`, { route: `api/sense-bot/telegram` });
	engine = new site.enigma(qvf.cio)
	engine.kpiMulti([
		`num(sum([Cost] * History* _CurrYTD),'#,##0')`,
		`num(sum([Cost Budget] * History* _CurrYTD) - sum([Cost] * History* _CurrYTD),'#,##0')`,
		`num((sum([Cost Budget] * History* _CurrYTD) - sum([Cost] * History* _CurrYTD))/(sum([Cost] * History* _CurrYTD)),'#,###.#0%')`,
		`num(avg({<HDStatus=, _CurrYTD={1}>}SLA),'##.##%')`,
		`num((avg({<HDStatus=, _CurrYTD={1}>}SLA))-.9970,'##.##%')`
	])
		.then(result => {
			ctx.replyWithHTML(`
	<b>CIO Dashboard - Management</b>
	2016 Cost YTD: <b>${result[0][0].qText}</b>
	vs Budget YTD: <b>${result[1][0].qText}</b>
	Diff: <b>${result[2][0].qText}</b>
	Service Level: <b>${result[3][0].qText}</b>
	Service Level Goal: <b>99.70</b>
	Diff: <b>${result[4][0].qText}</b>
		`, Extra.markup(keyboardCio));
		})
		.catch(error => ctx.reply(`Error: ${error}`))
})
bot.action('cioCustomerService', (ctx) => {
	site.logger.info(`cio-customer-service`, { route: `api/sense-bot/telegram` });
	engine = new site.enigma(qvf.cio)
	engine.kpiMulti([
		`num(Avg({<HDStatus=, Year={$(=$(vMaxYear))}>}[Customer Grade]),'#,###.##')`,
		`num(Avg({<[Case Status]=, Year={$(=$(vMaxYear))}>}[Customer Grade])-3.75,'##.##')`,
		`num(sum({<HDStatus = {'Resolved'} >}ticketCounter),'#,##0')`,
		`num(sum({<HDStatus = {'Open', 'Pending'} >}ticketCounter),'#,##0')`,
		`num(((Date(Avg([resolution time]))-Floor(Avg([resolution time])))*(24*60))/60, '##.##')`,
		`num(((Date(0.08334)-Floor(0.08334))*(24*60))/60, '##.##')`,
		`num(((Date(0.08334)-Floor(0.08334))*(24*60))/60, '##.##')`
	])
		.then(result => {
			ctx.replyWithHTML(`
	<b>CIO Dashboard - Customer Service</b>
	Grade YTD: <b>${result[0][0].qText}</b>
	Grade Target: <b>3.75</b>
	Diff: <b>${result[1][0].qText}</b>
	Resolved Tickets: <b>${result[2][0].qText}</b>
	Open Tickets: <b>${result[3][0].qText}</b>
	Avg Resolution Time (hrs): <b>${result[4][0].qText}</b>
	Resolution Time Target (hrs): <b>${result[5][0].qText}</b>
	Diff: <b>${result[6][0].qText}</b>
		`, Extra.markup(keyboardCio));
		})
		.catch(error => ctx.reply(`Error: ${error}`))
})

/***************
 * HELPDESK
 **************/
// BUTTONS
const keyboardHelpdesk = Markup.inlineKeyboard([
	[
		Markup.urlButton('❤️', 'https://webapps.qlik.com/CIO/index.html'),
		Markup.callbackButton('High Priority Cases', 'helpDeskHighPriorityCases'),
	],
	[
		Markup.callbackButton('Medium Priority Cases', 'helpDeskMediumPriorityCases'),
		Markup.callbackButton('Low Priority Cases', 'helpDeskLowPriorityCases'),
	]
])
// COMMANDS - ACTIONS
bot.command('helpdesk', (ctx) => {
	site.logger.info(`helpdesk-main`, { route: `api/sense-bot/telegram` });
	ctx.reply('Welcome to HelpDesk')
	ctx.replyWithPhoto({ url: 'https://sense-demo-staging.qlik.com/appcontent/133dab5d-8f56-4d40-b3e0-a6b401391bde/helpdesk_management.jpg' })
	ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboardHelpdesk))
})
bot.action('helpDeskHighPriorityCases', (ctx) => {
	site.logger.info(`helpDesk-HighPriorityCases`, { route: `api/sense-bot/telegram` });
	engine = new site.enigma(qvf.helpdesk)
	engine.kpiMulti([
		`Count( {$<Priority={'High'}, Status -={'Closed'} >} Distinct %CaseId )`
	])
		.then(result => {
			ctx.replyWithHTML(`
	<b>HelpDesk - High Priority Cases</b>
	We have  <b>${result[0][0].qText}</b> of High Priority Cases
		`, Extra.markup(keyboardHelpdesk));
		})
		.catch(error => ctx.reply(`Error: ${error}`))
})
bot.action('helpDeskMediumPriorityCases', (ctx) => {
	site.logger.info(`helpDesk-MediumPriorityCases`, { route: `api/sense-bot/telegram` });
	engine = new site.enigma(qvf.helpdesk)
	engine.kpiMulti([
		`Count( {$<Priority={'Medium'}, Status -={'Closed'} >} Distinct %CaseId )`
	])
		.then(result => {
			ctx.replyWithHTML(`
	<b>HelpDesk - Medium Priority Cases</b>
	We have  <b>${result[0][0].qText}</b> of Medium Priority Cases
		`, Extra.markup(keyboardHelpdesk));
		})
		.catch(error => ctx.reply(`Error: ${error}`))
})
bot.action('helpDeskLowPriorityCases', (ctx) => {
	site.logger.info(`helpDesk-LowPriorityCases`, { route: `api/sense-bot/telegram` });
	engine = new site.enigma(qvf.helpdesk)
	engine.kpiMulti([
		`Count( {$<Priority={'Low'}, Status -={'Closed'} >} Distinct %CaseId )`
	])
		.then(result => {
			ctx.replyWithHTML(`
	<b>HelpDesk - Low Priority Cases</b>
	We have  <b>${result[0][0].qText}</b> of Low Priority Cases
		`, Extra.markup(keyboardHelpdesk));
		})
		.catch(error => ctx.reply(`Error: ${error}`))
})

bot.on('message', (ctx) => {
	db.userListing({
		userUid: ctx.update.message.from.id,
		limit: 1
	})
		.then(result => {
			if (!result.length) {
				db.userInsert({
					userUid: ctx.update.message.from.id,
					username: `${ctx.update.message.from.first_name} ${ctx.update.message.from.last_name}`,
					channelId: 6,
					userData: JSON.stringify(ctx.update.message.chat)
				})
			}
		})
		.catch(error => {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/skype` });
		})
	ctx.reply('Try /salesforce, /cio or /helpdesk')
})
bot.startPolling()

module.exports = router;