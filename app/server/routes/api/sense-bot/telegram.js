/**
 * @name Route: telegram
 * @author yianni.ververis@qlik.com
 * @description
 * Handle all of the https://{domain}/api/sense-bot/telegram/ routes
*/

const express = require('express');
const site = require('../../../models/sense-bot');
const router = express.Router();
const Telegraf = require('telegraf');
const session = require('telegraf/session');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
var config = require('../../../config.json');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
let engine = null;

let qvf = config.qvf;
let lang = 'en';

/**
 * Start the bot by visiting this page
 * @function adhoc
 * @param {string} message - The message to send to all users in the database.
 * @author yianni.ververis@qlik.com
 * 
*/
router.post('/', (req, res) => {
	site.logger.info(`main`, { route: `api/sense-bot/telegram` });
	res.send({
		success: true,
		data: `Bot Started!`
	});
});

/**
 * Send adhoc messages to all users from an external webpage
 * @function adhoc
 * @param {string} message - The message to send to all users in the database.
 * @author yianni.ververis@qlik.com
 * 
*/
router.post('/adhoc/', (req, res) => {
	site.logger.info(`adhoc`, { route: `api/sense-bot/telegram` });
	res.send({
		success: true,
		data: `Message: '${req.body.message}' Send!`
	});
	site.logger.info(`Loaded`, { route: `${req.originalUrl}` });
});


// bot.telegram.setWebhook('https://localhost:3443/api/sense-bot/telegram/adhoc/')
/*************
 * MAIN
 *************/
bot.use(session());
bot.start((ctx) => ctx.reply(config.text[lang].welcome));

/*************
 * SALESFORCE
 *************/
// BUTTONS
const keyboardSalesforce = Markup.inlineKeyboard([
	Markup.urlButton(config.text[lang].viewDemo, 'https://webapps.qlik.com/salesforce/index.html'),
	Markup.callbackButton(config.text[lang].salesforce.dashboard.button, 'salesforceDashboard'),
	Markup.callbackButton(config.text[lang].salesforce.opportunities.button, 'salesforceOpportunities')
	// Markup.callbackButton('Chart', 'salesforceChart')
]);
// COMMANDS - ACTIONS
bot.command('salesforce', (ctx) => {
	try {
		site.logger.info(`salesforce-main`, { route: `api/sense-bot/telegram` });
		ctx.reply(config.text[lang].salesforce.welcome);
		ctx.replyWithPhoto({ url: 'https://webapps.qlik.com/img/2017_salesforce.png' });
		ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboardSalesforce));
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::salesforce()` });
	}
});
bot.action('salesforceChart', (ctx) => {
	try {
		site.logger.info(`salesforce-chart`, { route: `api/sense-bot/telegram` });
		ctx.replyWithPhoto({ url: 'http://sense-demo-staging.qlik.com:1337/133dab5d-8f56-4d40-b3e0-a6b401391bde/PAppmU' });
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::salesforceChart()` });
	}
});
bot.action('salesforceDashboard', (ctx) => {
	try {
		site.logger.info(`salesforce-dashboard`, { route: `api/sense-bot/telegram` });
		engine = new site.Enigma(qvf.salesforce);
		engine.kpiMulti([
			`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} [Opportunity Amount])`,
			`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
			`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Type]={'New Customer'}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
			`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Type]={'Existing Customer'}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
			`num(Sum({<[Opportunity Won/Lost] = {'WON'}, [Opportunity Close Quarter/Year]={'$(vCurrentQ)'}>} Opportunity_Count)	/Sum({<[Opportunity Is Closed?]={'true'}, [Opportunity Close Quarter/Year]={'$(vCurrentQ)'}>} Opportunity_Count), '##%')`
		])
			.then(result => {
				ctx.replyWithHTML(`
		<b>${config.text[lang].salesforce.dashboard.title}</b>
		${config.text[lang].salesforce.dashboard.kpi1}: <b>${result[0][0].qText}</b>
		${config.text[lang].salesforce.dashboard.kpi2}: <b>${result[1][0].qText}</b>
		${config.text[lang].salesforce.dashboard.kpi3}: <b>${result[2][0].qText}</b>
		${config.text[lang].salesforce.dashboard.kpi4}: <b>${result[3][0].qText}</b>
		${config.text[lang].salesforce.dashboard.kpi5}: <b>${result[4][0].qText}</b>
			`, Extra.markup(keyboardSalesforce));
			})
			.catch(error => ctx.reply(`Error: ${error}`));
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::saleforceDashboard()` });
	}
});
bot.action('salesforceOpportunities', (ctx) => {
	try {
		site.logger.info(`salesforce-opportunities`, { route: `api/sense-bot/telegram` });
		engine = new site.Enigma(qvf.salesforce);
		engine.kpiMulti([
			`num(Sum({<[Opportunity Triphase]={'OPEN'}>} [Opportunity Amount]),'$###,###,###')`,
			`num(Sum({<[Opportunity Triphase]={'OPEN'}>} Opportunity_Count),'###,###,###')`,
			`num(Sum({<[Opportunity Won/Lost]={'WON'}, [Opportunity Closed_Flag]={1}>} [Opportunity Amount]),'$###,###,###')`,
			`num(Sum({<[Opportunity Won/Lost]={'WON'}, [Opportunity Closed_Flag]={1}>} Opportunity_Count),'###,###,###')`,
			`num(Sum({<[Opportunity Won/Lost]={'LOST'}, [Opportunity Closed_Flag]={1}>} [Opportunity Amount]),'$###,###,###')`,
			`num(Sum({<[Opportunity Won/Lost]={'LOST'}, [Opportunity Closed_Flag]={1}>} Opportunity_Count),'###,###,###')`,
			`num(Sum({<[Opportunity Won/Lost] = {'WON'}>} Opportunity_Count)	/Sum({<[Opportunity Is Closed?]={'true'}>} Opportunity_Count), '##%')`
		])
			.then(result => {
				ctx.replyWithHTML(`
		<b>${config.text[lang].salesforce.opportunities.title}</b>
		${config.text[lang].salesforce.opportunities.kpi1}: <b>${result[0][0].qText}</b>
		${config.text[lang].salesforce.opportunities.kpi2}: <b>${result[1][0].qText}</b>
		${config.text[lang].salesforce.opportunities.kpi3}: <b>${result[2][0].qText}</b>
		${config.text[lang].salesforce.opportunities.kpi4}: <b>${result[3][0].qText}</b>
		${config.text[lang].salesforce.opportunities.kpi5}: <b>${result[4][0].qText}</b>
		${config.text[lang].salesforce.opportunities.kpi6}: <b>${result[5][0].qText}</b>
		${config.text[lang].salesforce.opportunities.kpi7}: <b>${result[6][0].qText}</b>
			`, Extra.markup(keyboardSalesforce));
			})
			.catch(error => ctx.reply(`Error: ${error}`));
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::salesforceOpportunities()` });
	}
});

/***************
 * CIO DASHBOARD
 **************/
// BUTTONS
const keyboardCio = Markup.inlineKeyboard([
	Markup.urlButton(config.text[lang].viewDemo, 'https://webapps.qlik.com/CIO/index.html'),
	Markup.callbackButton(config.text[lang].cio.management.button, 'cioManagement'),
	Markup.callbackButton(config.text[lang].cio.customer.button, 'cioCustomerService')
]);
// COMMANDS - ACTIONS
bot.command('cio', (ctx) => {
	try {
		site.logger.info(`cio-main`, { route: `api/sense-bot/telegram` });
		ctx.reply(config.text[lang].cio.welcome);
		ctx.replyWithPhoto({ url: 'https://sense-demo-staging.qlik.com/appcontent/d0dd198f-138b-41d8-a099-5c5071bd6b33/CIO-desktop-development.jpg' });
		ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboardCio));
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::cio()` });
	}
});
bot.action('cioManagement', (ctx) => {
	try {
		site.logger.info(`cio-management`, { route: `api/sense-bot/telegram` });
		engine = new site.Enigma(qvf.cio);
		engine.kpiMulti([
			`num(sum([Cost] * History* _CurrYTD),'#,##0')`,
			`num(sum([Cost Budget] * History* _CurrYTD) - sum([Cost] * History* _CurrYTD),'#,##0')`,
			`num((sum([Cost Budget] * History* _CurrYTD) - sum([Cost] * History* _CurrYTD))/(sum([Cost] * History* _CurrYTD)),'#,###.#0%')`,
			`num(avg({<HDStatus=, _CurrYTD={1}>}SLA),'##.##%')`,
			`num((avg({<HDStatus=, _CurrYTD={1}>}SLA))-.9970,'##.##%')`
		])
			.then(result => {
				ctx.replyWithHTML(`
		<b>${config.text[lang].cio.management.title}</b>
		${config.text[lang].cio.management.kpi1}: <b>${result[0][0].qText}</b>
		${config.text[lang].cio.management.kpi2}: <b>${result[1][0].qText}</b>
		${config.text[lang].cio.management.kpi3}: <b>${result[2][0].qText}</b>
		${config.text[lang].cio.management.kpi4}: <b>${result[3][0].qText}</b>
		${config.text[lang].cio.management.kpi5}: <b>99.70</b>
		${config.text[lang].cio.management.kpi6}: <b>${result[4][0].qText}</b>
			`, Extra.markup(keyboardCio));
			})
			.catch(error => ctx.reply(`Error: ${error}`));
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::cioManagement()` });
	}
});
bot.action('cioCustomerService', (ctx) => {
	try {
		site.logger.info(`cio-customer-service`, { route: `api/sense-bot/telegram` });
		engine = new site.Enigma(qvf.cio);
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
		<b>${config.text[lang].cio.customer.title}</b>
		${config.text[lang].cio.customer.kpi1}: <b>${result[0][0].qText}</b>
		${config.text[lang].cio.customer.kpi2}: <b>3.75</b>
		${config.text[lang].cio.customer.kpi3}: <b>${result[1][0].qText}</b>
		${config.text[lang].cio.customer.kpi4}: <b>${result[2][0].qText}</b>
		${config.text[lang].cio.customer.kpi5}: <b>${result[3][0].qText}</b>
		${config.text[lang].cio.customer.kpi6}: <b>${result[4][0].qText}</b>
		${config.text[lang].cio.customer.kpi7}: <b>${result[5][0].qText}</b>
		${config.text[lang].cio.customer.kpi8}: <b>${result[6][0].qText}</b>
			`, Extra.markup(keyboardCio));
			})
			.catch(error => ctx.reply(`Error: ${error}`));
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::cioCustomerService()` });
	}
});

/***************
 * HELPDESK
 **************/
// BUTTONS
const keyboardHelpdesk = Markup.inlineKeyboard([
	[
		Markup.urlButton('View Demo', 'https://demos.qlik.com/qliksense/HelpdeskManagement'),
		Markup.callbackButton(config.text[lang].helpdesk.highPriorityCases.button, 'helpdeskHighPriorityCases')
	],
	[
		Markup.callbackButton(config.text[lang].helpdesk.mediumPriorityCases.button, 'helpdeskMediumPriorityCases'),
		Markup.callbackButton(config.text[lang].helpdesk.lowPriorityCases.button, 'helpdeskLowPriorityCases')
	]
]);
// COMMANDS - ACTIONS
bot.command('helpdesk', (ctx) => {
	try {
		site.logger.info(`helpdesk-main`, { route: `api/sense-bot/telegram` });
		ctx.reply(config.text[lang].helpdesk.welcome);
		ctx.replyWithPhoto({ url: 'https://sense-demo-staging.qlik.com/appcontent/133dab5d-8f56-4d40-b3e0-a6b401391bde/helpdesk_management.jpg' });
		ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboardHelpdesk));
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::helpdesk()` });
	}
});
bot.action('helpdeskHighPriorityCases', (ctx) => {
	try {
		site.logger.info(`helpdeskHighPriorityCases`, { route: `api/sense-bot/telegram` });
		engine = new site.Enigma(qvf.helpdesk);
		engine.kpiMulti([
			`Count( {$<Priority={'High'}, Status -={'Closed'} >} Distinct %CaseId )`
		])
			.then(result => {
				ctx.replyWithHTML(`
		<b>${config.text[lang].helpdesk.highPriorityCases.title}</b>
		${config.text[lang].helpdesk.highPriorityCases.kpi1} <b>${result[0][0].qText}</b> ${config.text[lang].helpdesk.highPriorityCases.kpi2}
			`, Extra.markup(keyboardHelpdesk));
			})
			.catch(error => ctx.reply(`Error: ${error}`));
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::helpdeskHighPriorityCases()` });
	}
});
bot.action('helpdeskMediumPriorityCases', (ctx) => {
	try {
		site.logger.info(`helpdeskMediumPriorityCases`, { route: `api/sense-bot/telegram` });
		engine = new site.Enigma(qvf.helpdesk);
		engine.kpiMulti([
			`Count( {$<Priority={'Medium'}, Status -={'Closed'} >} Distinct %CaseId )`
		])
			.then(result => {
				ctx.replyWithHTML(`
		<b>${config.text[lang].helpdesk.mediumPriorityCases.title}</b>
		${config.text[lang].helpdesk.mediumPriorityCases.kpi1} <b>${result[0][0].qText}</b> ${config.text[lang].helpdesk.mediumPriorityCases.kpi2}
			`, Extra.markup(keyboardHelpdesk));
			})
			.catch(error => ctx.reply(`Error: ${error}`));
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::helpdeskMediumPriorityCases()` });
	}
});
bot.action('helpdeskLowPriorityCases', (ctx) => {
	try {
		site.logger.info(`helpdeskLowPriorityCases`, { route: `api/sense-bot/telegram` });
		engine = new site.Enigma(qvf.helpdesk);
		engine.kpiMulti([
			`Count( {$<Priority={'Low'}, Status -={'Closed'} >} Distinct %CaseId )`
		])
			.then(result => {
				ctx.replyWithHTML(`
		<b>${config.text[lang].helpdesk.lowPriorityCases.title}</b>
		${config.text[lang].helpdesk.lowPriorityCases.kpi1} <b>${result[0][0].qText}</b> ${config.text[lang].helpdesk.lowPriorityCases.kpi2}
			`, Extra.markup(keyboardHelpdesk));
			})
			.catch(error => ctx.reply(`Error: ${error}`));
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::helpdeskLowPriorityCases()` });
	}
});

/***************
 * LANGUAGE SELECTOR
 **************/
// BUTTONS
const keyboardLang = Markup.inlineKeyboard([
	[
		Markup.callbackButton(config.text.en.title, 'langEn'),
		Markup.callbackButton(config.text.el.title, 'langGr')
	]
]);
// COMMANDS - ACTIONS
bot.command('lang', (ctx) => {
	try {
		site.logger.info(`lang-main`, { route: `api/sense-bot/telegram` });
		ctx.reply("Select Language");
		ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboardLang));
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::lang()` });
	}
});
bot.action('langEn', (ctx) => {
	try {
		lang = 'en';
		ctx.reply(config.text.en.setLang);
		site.logger.info(`lang-en`, { route: `api/sense-bot/telegram` });
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::langEn()` });
	}
});
bot.action('langGr', (ctx) => {
	try {
		lang = 'gr';
		ctx.reply(config.text.el.lang.set);
		site.logger.info(`lang-gr`, { route: `api/sense-bot/telegram` });
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::langGr()` });
	}
});

bot.on('message', async function (ctx) {
	try {
		const db = await new site.Telegram();
		let result = await db.userListing({
			userUid: ctx.update.message.from.id,
			limit: 1
		});
		if (!result.length) {
			await db.userInsert({
				userUid: ctx.update.message.from.id,
				username: `${ctx.update.message.from.first_name} ${ctx.update.message.from.last_name}`,
				channelId: 6,
				userData: JSON.stringify(ctx.update.message.chat)
			});
		}
		ctx.reply('Try /salesforce, /cio or /helpdesk');
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/telegram::message()` });
	}
	// ctx.reply('Try /salesforce, /cio, /helpdesk or /lang to change the language')
});
// bot.on('message', enter('help'))
bot.startPolling();


/*	###############
	EXPERIMENTAL CODE
	###############
*/

/*************
 * HELP
 *************/
// BUTTONS
// const keyboardHelp = Markup.inlineKeyboard([
// 	Markup.callbackButton('Salesforce', 'salesforce'),
// 	Markup.callbackButton('CIO Dashboard', 'cio'),
// 	Markup.callbackButton('Helpdesk', 'helpdesk')
// ])
// const helpScene = new Scene('help')
// helpScene.enter((ctx) => {
// 	console.log(1)
// 	db.userListing({
// 		user_uid: ctx.update.message.from.id,
// 		limit:1	
// 	})
// 	.then(result => {
// 		if(!result.length) {
// 			db.userInsert({
// 				user_uid: ctx.update.message.from.id,
// 				user_name: `${ctx.update.message.from.first_name} ${ctx.update.message.from.last_name}`,
// 				channel_id: 6,
// 				user_data: JSON.stringify(ctx.update.message.chat)
// 			})
// 			.then(result => {})
// 			.catch(error => site.logger.info(`error: ${error}`, {route: `api/sense-bot/telegram`}))
// 		}
// 	})
// 	.catch(error => site.logger.info(`error: ${error}`, {route: `api/sense-bot/skype`}))
// 	site.logger.info(`help-main`, {route: `api/sense-bot/telegram`});
// 	ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboardHelp))	
// })
// helpScene.leave((ctx) => {console.log(ctx.update.callback_query.data);ctx.reply(`Taking you to the app ${ctx.update.callback_query.data}`)})
// helpScene.leave((ctx) => ctx.replyWithMarkdown(`Taking you to the app ${ctx.message}`))

/*************
 * SALESFORCE
 *************/
// SCENE
// const salesforceScene = new Scene('salesforce')
// salesforceScene.enter((ctx) => {
// 	console.log(2)
// 	site.logger.info(`salesforce-main`, {route: `api/sense-bot/telegram`});
// 	ctx.reply('Welcome to Salesforce')
// 	ctx.replyWithPhoto({ url: 'https://webapps.qlik.com/img/2017_salesforce.png' })
// 	ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboardSalesforce))
// })
// salesforceScene.leave((ctx) => ctx.reply('Bye'))
// salesforceScene.hears('salesforce', enter('salesforce'))
// salesforceScene.on('message', (ctx) => ctx.replyWithMarkdown('Send `hi`'))


module.exports = router;