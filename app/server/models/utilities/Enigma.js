/**
 * @module models/utilities/Enigma
 * @author yianni.ververis@qlik.com
 * @param {string} host - Qlik Sense DNS
 * @param {string} appId - QVF ID
 * @param {string} expr - Sense Expression to create the Kpi via a Hypercube
 * @param {string} userDirectory - The UserDirectory for AutoTicketing
 * @param {string} userId - The UserId for AutoTicketing
 * @description
 * Main wrapper for Enigma.js
*/

const logger = require('./Logger');
const enigma = require('enigma.js');
const WebSocket = require('ws');
const schema = require('enigma.js/schemas/12.20.0.json');

const Enigma = class {
	constructor(input) {
		this._input = {
			host: (input.host) ? input.host : 'sense-demo-staging.qlik.com',
			appId: (input.appId) ? String(input.appId) : false, // webapps 42c2c9fa-97e8-4d7e-aa1a-ccfe457198c1
			expr: (input.expr) ? String(input.expr) : false,
			userDirectory: (input.userDirectory) ? String(input.userDirectory) : null,
			userId: (input.userId) ? String(input.userId) : null,
		};
		this.session = null;
		this.global = null;
		this.app = null;
	}
	connect() {
		return new Promise((resolve, reject) => {
			// create a new session:
			this.session = enigma.create({
				schema,
				url: (this._input.appId) ? `wss://${this._input.host}/app/${this._input.appId}` : `wss://${this._input.host}/app/engineData`,
				createSocket: url => new WebSocket(url),
			});
			this.session.open().then((global) => {
				logger.log(`Connection openned: `, { model: `Enigma` });
				this.global = global;
				if (this._input.appId) {
					this.global.openDoc(this._input.appId).then((app) => {
						this.app = app;
						resolve(true);
					});
				} else {
					resolve(true);
				}
			})
				.catch((err) => {
					reject(err)
				})
		})
	}
	disconnect() {
		if (this.session) {
			this.session.close();
			this.clients = [];
			logger.log(`Connection closed: `, { model: `Enigma` });
		}
	}
	getDocList() {
		return new Promise((resolve, reject) => {
			this.global.getDocList().then((list) => {
				const apps = []
				for (let n of list) {
					apps.push({
						'title': (n.qTitle || n.qDocName),
						'id': n.qDocId,
						'thumb': n.qThumbnail.qUrl
					})
				}
				logger.log(`Apps on this Engine that the configured user can open: ${apps}`, { model: `Enigma` });
				resolve(apps);
			})
				.catch((error) => {
					logger.error(`error: ${JSON.stringify(error)}`, { model: `Enigma::getDocList()` });
					reject(error)
				});
		});
	}
	kpiMulti(exprs) {
		return new Promise((resolve, reject) => {
			this.connect()
				.then(() => {
					let promises = []
					for (let expr of exprs) {
						let promise = new Promise((resolve, reject) => {
							this.getHyperCube([], [expr], 1)
								.then(result => resolve(result[0]))
								.catch(error => reject(error))
						})
						promises.push(promise)
					}
					Promise.all(promises)
						.then(result => resolve(result))
						.catch(error => reject(error))
				})
		});
	}
	kpi(expr) {
		return new Promise((resolve, reject) => {
			this.connect()
				.then(() => {
					this.getHyperCube([], [expr], 1)
						.then(result => {
							resolve(result)
						})
						.catch(error => reject(error))
				})
		});
	}
	getHyperCube(dimensions, measures, limit) {
		return new Promise((resolve, reject) => {
			let qDimensions = [],
				qMeasures = [];
			if (dimensions.length) {
				for (let value of dimensions) {
					qDimensions.push({
						"qLibraryId": "",
						"qNullSuppression": false,
						qDef: {
							qGrouping: "N",
							qFieldDefs: [value],
							"qFieldLabels": [""]
						}
					});
				};
			}
			if (measures.length) {
				for (let value of measures) {
					qMeasures.push({
						qDef: {
							"qLabel": "",
							"qGrouping": "N",
							"qDef": value
						}
					});
				};
			}
			let obj = {
				"qInfo": {
					"qId": "",
					"qType": "HyperCube"
				},
				"qHyperCubeDef": {
					"qDimensions": qDimensions,
					"qMeasures": qMeasures,
					"qInitialDataFetch": [
						{
							"qTop": 0,
							"qLeft": 0,
							"qHeight": (limit) ? limit : 50, // Limit Results
							"qWidth": 20 // Total Columns
						}
					]
				}
			};
			this.app.createSessionObject(obj).then(function (list) {
				list.getLayout().then(function (layout) {
					resolve(layout.qHyperCube.qDataPages[0].qMatrix);
				})
			})
				.catch((error) => {
					logger.error(`error: ${JSON.stringify(error)}`, { model: `Enigma::getHyperCube()` });
					reject(error)
				});
		});
	};
}

module.exports = Enigma;