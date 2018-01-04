/**
 * @module routes/api/sense-bot/microsoft
 * @author yianni.ververis@qlik.com
 * @description
 * Handle all of the https://{domain}/api/sense-bot/microsoft/ routes
 * skype: https://join.skype.com/bot/bc69f77c-331a-4775-808b-4346866f082f
 * skype-svc: https://join.skype.com/bot/514357d9-b843-449f-8a1d-a1dfbf065978?add
*/

const express = require('express')
const site = require('../../../models/sense-bot')
const builder = require('botbuilder');
const path = require('path')
const router = express.Router()
var config = require('../../../config.json');

let qvf = config.qvf;
let lang = 'en';
let prompt = null;
let engine = null;

// Create chat connector for communicating with the Bot Framework Service
let connector = new builder.ChatConnector({
	appId: process.env.SKYPE_BOT_ID_SVC,
	appPassword: process.env.SKYPE_BOT_PASSWORD_SVC
});

// let bot = new builder.UniversalBot(connector);
// let bot = new builder.UniversalBot(connector, {storage: new builder.MemoryBotStorage()}, [ function (session) {
let bot = new builder.UniversalBot(connector, [ async function (session) {
	try {
		lang = session.preferredLocale();
		// prompt = session.localizer.gettext(session.preferredLocale(), "text_prompt");
		// Store the user for Sending Messages later
		let db = await new site.microsoft()
		let result = await db.userListing({
			userUid: session.message.user.id,
			limit: 1
		})
		if (!result.length) {
			let channelId = 1;
			if (session.message.address.channelId === 'msteams') {
				channelId = 2
			} else if (session.message.address.channelId === 'cortana') {
				channelId = 3
			} else if (session.message.address.channelId === 'webchat') {
				channelId = 5
			}
			await db.userInsert({
				userUid: session.message.user.id,
				username: session.message.user.name,
				channelId: channelId,
				userData: JSON.stringify(session.message.address)
			})
		}
		// Open Dialogs based on the text the user types
		if (
			session.message.text === "webapps" ||
			session.message.text === "helpdesk" ||
			session.message.text === "cio" ||
			session.message.text === "salesforce" ||
			session.message.text === "help"
		) {
			session.send(`Hi! You are connected to ${session.message.text}. What do you want to do?`)
			session.send(session.message.address)
			session.beginDialog(session.message.text)
		} else {
			session.send(config.text[lang].no_command, session.message.text);
			session.beginDialog('help');
		}
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::UniversalBot` });
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::UniversalBot()` });
	}
}]);

// ADHOC messages
// function sendProactiveMessage(address, message) {
// 	var msg = new builder.Message().address(address);
// 	msg.text('Hello, this is a notification');
// 	msg.textLocale('en-US');
// 	bot.send(msg);
// }
// WElcome Screen when added to contacts
bot.on('contactRelationUpdate', function (message) {
	try {
		if (message.action === 'add') {
			var reply = new builder.Message()
				.address(message.address)
				.text(config.text[lang].welcome, message.user ? message.user.name : 'there');
			bot.send(reply);
		}
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::contactRelationUpdate()` });
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::contactRelationUpdate()` });
	}
});

// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (message) {
	try {
		if (message.membersAdded && message.membersAdded.length > 0) {
			var reply = new builder.Message()
				.address(message.address)
				.text(config.text[lang].welcome, message.user ? message.user.name : 'there');
			bot.send(reply);
		} else if (message.membersRemoved) {
			// See if bot was removed
			var botId = message.address.bot.id;
			for (var i = 0; i < message.membersRemoved.length; i++) {
				if (message.membersRemoved[i].id === botId) {
					var reply = new builder.Message()
						.address(message.address)
						.text(config.text[lang].exit.text);
					bot.send(reply);
					break;
				}
			}
		}
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::conversationUpdate()` });
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::conversationUpdate()` });
	}
});

// HELP - MAIN MENU
bot.dialog('help', [ function (session) {
	try {
		// Capture one language per region like: 'en-US', 'en-NZ' etc, will all use 'en'
		// lang = session.preferredLocale().split('-')[0];
		let msg = new builder.Message(session);
		msg.attachmentLayout(builder.AttachmentLayout.list)
		msg.attachments([
			new builder.HeroCard(session)
				.title(config.text[lang].help.title)
				// .subtitle("text_prompt")
				.text(config.text[lang].help.text)
				// .images([builder.CardImage.create(session, 'https://webapps.qlik.com/img/QS_Hub.png')])
				.buttons([
					builder.CardAction.postBack(session, "salesforce", config.text[lang].salesforce.title),
					builder.CardAction.postBack(session, "cio", config.text[lang].cio.title),
					builder.CardAction.postBack(session, "helpdesk", config.text[lang].helpdesk.title),
					builder.CardAction.postBack(session, "language", config.text[lang].language.button),
				])
		]);
		switch (session.message.text) {
			case 'salesforce':
			case 'Salesforce':
				session.beginDialog('salesforce')
				break;
			case 'cio':
			case 'Cio':
				session.beginDialog('cio')
				break;
			case 'helpdesk':
			case 'Helpdesk':
				session.beginDialog('helpdesk')
				break;
			case 'language':
			case 'Language':
				session.beginDialog('localePicker')
				break;
			default:
				session.send(msg)
				break;
		}
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::help()` });
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::help()` });
	}
}])
	.triggerAction({ matches: /^Help$/i });

bot.dialog('localePicker', function (session) {
	try {
		let msg = new builder.Message(session)
			.attachmentLayout(builder.AttachmentLayout.list)
			.attachments([
				new builder.HeroCard(session)
					.title(config.text[lang].language.button)
					// .subtitle("text_prompt")
					.text(config.text[lang].language.text)
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
		switch (session.message.text) {
			case 'English':
				locale = 'en';
				break;
			case 'Español':
				locale = 'es';
				break;
			case 'Italiano':
				locale = 'it';
				break;
			case 'Ελληνικά':
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
				session.endDialog(config.text[lang].language.set);
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

// Exit from all dialogs
bot.dialog('exit', [ function (session) {
	try {
		if (engine) { engine.disconnect() }
		session.endDialog(config.text[lang].exit.text)
		session.beginDialog('help');
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::exit()` });
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::exit()` });
	}
}])
	.triggerAction({ matches: /^exit$/i });

/*************
 * SALESFORCE
 *************/
bot.dialog('salesforce', function (session) {
	try {
		let msg = new builder.Message(session);
		msg.attachmentLayout(builder.AttachmentLayout.list)
		msg.attachments([
			new builder.HeroCard(session)
				.title("Salesforce")
				.subtitle('https://webapps.qlik.com/salesforce/index.html')
				.text(config.text[lang].actions)
				.images([builder.CardImage.create(session, 'https://webapps.qlik.com/img/2017_salesforce.png')])
				.buttons([
					builder.CardAction.postBack(session, "dashboard", config.text[lang].salesforce.dashboard.button),
					builder.CardAction.postBack(session, "opportunities", config.text[lang].salesforce.opportunities.button),
					builder.CardAction.postBack(session, "chart-current-quarter", "Current Quarter Barchart"),
					builder.CardAction.postBack(session, "chart-current-quarter-opportunities", "Current Quarter Opportunities Barchart"),
					builder.CardAction.postBack(session, "exit", config.text[lang].exit.button),
				])
		]);
		let text = session.message.text.toLocaleLowerCase();
		switch (text) {
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
				session.send(msg)
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
		engine = await new site.enigma(qvf.salesforce)
		let result = await engine.kpiMulti([
			`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} [Opportunity Amount])`,
			`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
			`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Type]={'New Customer'}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
			`Sum({<[Opportunity Open_Flag]={1}, [Opportunity Type]={'Existing Customer'}, [Opportunity Close Quarter/Year]={"$(vCurrentQ)"}>} Opportunity_Count)`,
			`num(Sum({<[Opportunity Won/Lost] = {'WON'}, [Opportunity Close Quarter/Year]={'$(vCurrentQ)'}>} Opportunity_Count)	/Sum({<[Opportunity Is Closed?]={'true'}, [Opportunity Close Quarter/Year]={'$(vCurrentQ)'}>} Opportunity_Count), '##%')`,
		])
		session.send(config.text[lang].salesforce.dashboard.text, result[0][0].qText, result[1][0].qText, result[2][0].qText, result[3][0].qText, result[4][0].qText);
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::salesforce-dashboard()` });
	}
	catch (error) {
        // session.endDialog(`Error: ${error}`) // @TODO add generic error message to config
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::salesforce-dashboard()` });
	}
}

async function salesforceOpportunities (session) {
	try {
		engine = await new site.enigma(qvf.salesforce)
		let result = await engine.kpiMulti([
			`num(Sum({<[Opportunity Triphase]={'OPEN'}>} [Opportunity Amount]),'$###,###,###')`,
			`num(Sum({<[Opportunity Triphase]={'OPEN'}>} Opportunity_Count),'###,###,###')`,
			`num(Sum({<[Opportunity Won/Lost]={'WON'}, [Opportunity Closed_Flag]={1}>} [Opportunity Amount]),'$###,###,###')`,
			`num(Sum({<[Opportunity Won/Lost]={'WON'}, [Opportunity Closed_Flag]={1}>} Opportunity_Count),'###,###,###')`,
			`num(Sum({<[Opportunity Won/Lost]={'LOST'}, [Opportunity Closed_Flag]={1}>} [Opportunity Amount]),'$###,###,###')`,
			`num(Sum({<[Opportunity Won/Lost]={'LOST'}, [Opportunity Closed_Flag]={1}>} Opportunity_Count),'###,###,###')`,
			`num(Sum({<[Opportunity Won/Lost] = {'WON'}>} Opportunity_Count)	/Sum({<[Opportunity Is Closed?]={'true'}>} Opportunity_Count), '##%')`,
		])
		session.send(config.text[lang].salesforce.opportunities.text, result[0][0].qText, result[1][0].qText, result[2][0].qText, result[3][0].qText, result[4][0].qText, result[5][0].qText, result[6][0].qText);
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::salesforce-opportunities()` });
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::salesforce-opportunities()` });
	}
}

/*************
 * HELPDESK
 *************/
bot.dialog('helpdesk', async function (session) {
    try {
        engine = await new site.enigma(qvf.helpdesk)
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
                    .text(config.text[lang].actions)
                    .buttons([
                        builder.CardAction.postBack(session, "high-priority-cases", config.text[lang].helpdesk.highPriorityCases.button),
                        builder.CardAction.postBack(session, "medium-priority-cases", config.text[lang].helpdesk.mediumPriorityCases.button),
                        builder.CardAction.postBack(session, "low-priority-cases", config.text[lang].helpdesk.lowPriorityCases.button),
                        builder.CardAction.postBack(session, "exit", config.text[lang].exit.button),
                    ])
            ]);
        site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::helpdesk-main()` });
		let text = session.message.text.toLocaleLowerCase();
        switch (text) {
            case 'high-priority-cases':
                return helpdeskHighPriorityCases(session, msg2);
                break;
            case 'medium-priority-cases':
				return helpdeskMediumPriorityCases(session);
                break;
            case 'low-priority-cases':
				return helpdeskLowPriorityCases(session);
                break;
            case 'exit':
                engine.disconnect();
                session.endDialog(config.text[lang].exit.text);
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

async function helpdeskHighPriorityCases (session, msg2) {
	try {
		let result = await engine.kpi("Count( {$<Priority={'High'}, Status -={'Closed'} >} Distinct %CaseId )");
		session.send(config.text[lang].helpdesk.highPriorityCases.text, result[0][0].qText);
		// session.send(msg2)
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::helpdeskHighPriorityCases()` });			
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::helpdeskHighPriorityCases()` });
	}
}

async function helpdeskMediumPriorityCases (session) {
	try {
		let result = await engine.kpi("Count( {$<Priority={'Medium'}, Status -={'Closed'} >} Distinct %CaseId )");
		session.send(config.text[lang].helpdesk.mediumPriorityCases.text, result[0][0].qText);
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::helpdeskMediumPriorityCases()` });			
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::helpdeskMediumPriorityCases()` });
	}
}

async function helpdeskLowPriorityCases (session) {
	try {
		let result = await engine.kpi("Count( {$<Priority={'Low'}, Status -={'Closed'} >} Distinct %CaseId )")
		session.send(config.text[lang].helpdesk.lowPriorityCases.text, result[0][0].qText);
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::helpdeskLowPriorityCases()` });			
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::helpdeskLowPriorityCases()` });
	}
}


/*************
 * CIO
 *************/
bot.dialog('cio', async function (session) {
    try {
        engine = await new site.enigma(qvf.cio)
        let msg = await new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.list)
        msg.attachments([
            new builder.HeroCard(session)
                .title("CIO")
                .subtitle('https://webapps.qlik.com/CIO/index.html')
                .text(config.text[lang].actions)
                .images([builder.CardImage.create(session, 'https://sense-demo-staging.qlik.com/appcontent/d0dd198f-138b-41d8-a099-5c5071bd6b33/CIO-desktop-development.jpg')])
                .buttons([
                    builder.CardAction.postBack(session, "management", "Management"),
                    builder.CardAction.postBack(session, "customer-service", "Customer Service"),
                    builder.CardAction.postBack(session, "exit", "Exit"),
                ])
        ]);
        site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::cio-main()` });
		let text = session.message.text.toLocaleLowerCase();
        switch (text) {
            case 'management':
                return cioManagement(session);
				break;
			case 'customer-service':
				return cioCustomerService(session);
				break;
			case 'exit':
				engine.disconnect()
				session.endDialog(config.text[lang].exit.text)
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
		session.send(config.text[lang].cio.management.text, result[0][0].qText, result[1][0].qText, result[2][0].qText, result[3][0].qText, result[4][0].qText);
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
		session.send(config.text[lang].cio.customer.text, result[0][0].qText, result[1][0].qText, result[2][0].qText, result[3][0].qText, result[4][0].qText, result[5][0].qText, result[6][0].qText);
		site.logger.info(`loaded`, { route: `api/sense-bot/microsoft::cioCustomerService()` });			
	}
	catch (error) {
		site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::cioCustomerService()` });
	}
}


// SKYPE SENSE BOT POST MESSAGES
router.post('/', connector.listen());

// POST MESSAGE TO ALL USERS
router.post('/adhoc/', async (req, res) => {
    try {
        let db = await new site.microsoft()
        let result = await db.userListing({ all: true })
        if (result.length == 1) {
            let value = result[0].user_data
            value = value.replace("\\", "")
            value = JSON.parse(value)
            var msg = new builder.Message().address(value);
            msg.text(req.body.message);
            msg.textLocale('en-US');
            bot.send(msg);
        } else if (result.length > 1) {
            for (value of result) {
                var msg = new builder.Message().address(JSON.parse(value.user_data));
                msg.text(req.body.message);
                msg.textLocale('en-US');
                bot.send(msg);
            }
        }
        res.send({
            success: true,
            data: `Message "${req.body.message}" Send!`
        })
        site.logger.info(`adhoc`, { route: `${req.originalUrl}` });
        site.logger.info(`adhoc-message`, `${req.body.message}`);
    }
    catch (error) {
        site.logger.info(`adhoc-error`, { route: `${JSON.stringify(error)}` });
        res.send({
            success: false,
            data: `Error: "${JSON.stringify(error)}"`
        })
    }
});

module.exports = router;