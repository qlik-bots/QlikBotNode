const site = require('../../../../models/sense-bot');

let shared = {
    engine: null,
    bot: null,
    builder: null,
    getFields: async () => {
		try {
            let fields = await shared.engine.getList("FieldList");
            let msg = '';
            for (let value of fields) {
                msg += `
                    ${value.qName}`
            }
            return msg;
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft/shared::getFields()` });
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::getFields()` });
		}
    },
    getFieldData: async (field) => {
		try {
            let result = await shared.engine.getFieldList(field);
            let msg = ``;
            if (result && result.length){                
                for (let value of result) {
                    msg += `
                        ${value[0].qText}`
                }
            } else {
                msg = `No Data for ${field}`;                
            }
            return msg;
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft/shared::getFields()` });
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::getFields()` });
		}
    },
    getSelections: async (session) => {
		try {
            let selections = await shared.engine.getList("SelectionObject");
            let msg = '';
            if (selections && selections.length) {
                for (let field of selections) {
                    msg += `
                        ${field.qField}: ${field.qSelected}`;
                }
            } else {
                msg = 'There is nothing selected!'
            }
            session.send(msg);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft/shared::getSelections()` });
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::getSelections()` });
		}
    },   
    getKpi: async (session, title, expression) => {
		try {
            let result = await shared.engine.kpi(expression);
            if (result && result.length){ 
                session.send(`${title}: ${result[0][0].qText}`);
            } else {
                session.send(`No Data for ${title}`);
            }
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft/shared::getFields()` });
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::getKpi()` });
		}
    },
    select: async (field, value) => {
		try {
            let result = await shared.engine.select(field, value);
            let msg = `No Data for ${field}`;
            if (result && result.length){ 
                msg = `${field}: ${result[0][0].qText}`;
            }
            return msg;
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft/shared::select()` });
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::select()` });
		}
    }, 
    clear: async (session, field) => {
		try {
            let msg = await shared.engine.clear(field);
            session.send(msg);
			site.logger.info(`loaded`, { route: `api/sense-bot/microsoft/shared::select()` });
		}
		catch (error) {
			site.logger.info(`error: ${error}`, { route: `api/sense-bot/microsoft::select()` });
		}
    },
}

module.exports = shared;