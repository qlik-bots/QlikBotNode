/**
 * @module models/utilities/Enigma
 * @author yianni.ververis@qlik.com
 * @param {object} config - The configuration for host, database name, username and password
 * @description
 * Connect to the Engine API with Enigma.js
 */

const logger = require('./Logger');
const enigma = require('enigma.js');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const schema = require('enigma.js/schemas/12.20.0.json');

const Enigma = class {
    constructor(input) {
        this._input = {
            host: (input && input.host) ? input.host : 'localhost',
            appId: (input && input.appId) ? String(input.appId) : false,
            expr: (input && input.expr) ? String(input.expr) : false,
            userDirectory: (input && input.userDirectory) ? String(input.userDirectory) : 'QLIKBOTNODE',
            userId: (input && input.userId) ? String(input.userId) : 'NodeBotUser',
            auth: (input && input.auth) ? true : false
        };
        this.session = null;
        this.global = null;
        this.app = null;
    }

    async connect() {
        try {
            // Default for anonymous connection
            let connectionSchema = {
                schema,
                url: (this._input.appId) ? `wss://${this._input.host}/app/${this._input.appId}` : `wss://${this._input.host}/app/engineData`,
                createSocket: url => new WebSocket(url, {
                    rejectUnauthorized: false
                }),
            };
            // Proceed with Authenticating a user
            if (this._input.auth && this._input.userDirectory && this._input.userId) {
                const certificatesPath = `../../certs/${this._input.host}/`;
                const readCert = filename => fs.readFileSync(path.resolve(__dirname, certificatesPath, filename));
                connectionSchema = {
                    schema,
                    url: `wss://${this._input.host}:4747/app/${this._input.appId}`,
                    createSocket: url => new WebSocket(url, {
                        rejectUnauthorized: false,
                        ca: [readCert('root.pem')],
                        key: readCert('client_key.pem'),
                        cert: readCert('client.pem'),
                        headers: {
                            'X-Qlik-User': `UserDirectory=${encodeURIComponent(this._input.userDirectory)}; UserId=${encodeURIComponent(this._input.userId)}`,
                        },
                    }),
                }
            }
            this.session = await enigma.create(connectionSchema);
            this.global = await this.session.open();
            if (this._input.appId) {
                this.app = await this.global.openDoc(this._input.appId);
            }
            logger.info("Loaded!", {model: `models/utilities/Enigma::connect()`});
            return true;
        } catch (error) {
            logger.info(`error: ${error}`, {model: `models/utilities/Enigma::connect()`});
            return error;
        }
    }

    disconnect() {
        if (this.session) {
            this.session.close();
            this.clients = [];
            logger.log(`Connection closed: `, {model: `Enigma`});
        }
    }

    async getDocList() {
        try {
            let list = await this.global.getDocList();
            const apps = [];
            for (let n of list) {
                apps.push({
                    'title': (n.qTitle || n.qDocName),
                    'id': n.qDocId,
                    'thumb': n.qThumbnail.qUrl
                });
            }
            logger.log(`Apps on this Engine that the configured user can open: ${apps}`, {model: `Enigma`});
            return apps;
        } catch (error) {
            logger.info(`error: ${error}`, {model: `models/utilities/Enigma::getDocList()`});
            return error;
        }
    }

    async kpiMulti(exprs) {
        try {
            await this.connect();
            let results = [];
            for (let expr of exprs) {
                let result = await this.getHyperCube([], [expr], 1);
                results.push(result[0]);
            }
            return results;
        } catch (error) {
            logger.error(`error: ${JSON.stringify(error)}`, {model: `Enigma::kpiMulti()`});
        }
    }

    async kpi(expr) {
        try {
            await this.connect();
            let result = await this.getHyperCube([], [expr], 1);
            return result;
        } catch (error) {
            logger.error(`error: ${JSON.stringify(error)}`, {model: `Enigma::kpi()`});
        }
    }

    async getFieldList(field, limit, returnModel) {
        try {
            await this.connect();
            let obj = {
                qInfo: {
                    qType: "visualization"
                },
                qListObjectDef: {
                    qStateName: "",
                    qLibraryId: "",
                    qDef: {
                        qGrouping: "N",
                        qFieldDefs: [field],
                        qFieldLabels: [],
                        qSortCriterias: [{
                            "qSortByState": 1,
                            "qSortByFrequency": 0,
                            "qSortByNumeric": 1,
                            "qSortByAscii": 1,
                            "qSortByLoadOrder": 1,
                            "qSortByExpression": 0,
                            "qExpression": {
                                "qv": ""
                            },
                            "qSortByGreyness": 0
                        }],
                        "qNumberPresentations": [],
                        "qReverseSort": false,
                        "qActiveField": 0,
                        "qLabelExpression": "",
                        "autoSort": true,
                        "cId": ""
                    },
                    qShowAlternatives: true,
                    qInitialDataFetch: [{
                        qTop: 0,
                        qHeight: (limit) ? limit : 50,
                        qLeft: 0,
                        qWidth: 1,
                    }],
                }
            };
            let model = await this.app.createSessionObject(obj);
            if (returnModel) {
                return model;
            } else {
                let layout = await model.getLayout();
                return layout.qListObject.qDataPages[0].qMatrix;
            }
        } catch (error) {
            logger.error(`error: ${JSON.stringify(error)}`, {model: `Enigma::getFieldList()`});
        }
    }

    async getList(qType) {
        try {
            await this.connect();
            let obj, list, layout;
            switch (qType) {
                case "FieldList":
                    obj = {
                        "qInfo": {
                            "qId": "",
                            "qType": "FieldList"
                        },
                        "qFieldListDef": {
                            "qShowSystem": false,
                            "qShowHidden": false,
                            "qShowSemantic": true,
                            "qShowSrcTables": true
                        }
                    };
                    list = await this.app.createSessionObject(obj);
                    layout = await list.getLayout();
                    return layout.qFieldList.qItems;

                case "DimensionList":
                    obj = {
                        "qInfo": {
                            "qId": "",
                            "qType": "DimensionList"
                        },
                        "qDimensionListDef": {
                            "qType": "dimension",
                            "qData": {
                                "title": "/qMetaDef/title",
                                "tags": "/qMetaDef/tags",
                                "grouping": "/qDim/qGrouping",
                                "info": "/qDimInfos"
                            }
                        }
                    };
                    list = await this.app.createSessionObject(obj);
                    layout = await list.getLayout();
                    return layout.qDimensionList.qItems;

                case "MeasureList":
                    obj = {
                        "qInfo": {
                            "qId": "",
                            "qType": "MeasureList"
                        },
                        "qMeasureListDef": {
                            "qType": "measure",
                            "qData": {
                                "title": "/qMetaDef/title",
                                "tags": "/qMetaDef/tags"
                            }
                        }
                    };
                    list = await this.app.createSessionObject(obj);
                    layout = await list.getLayout();
                    return layout.qMeasureList.qItems;

                case "SelectionObject":
                    obj = {
                        "qInfo": {
                            "qId": "",
                            "qType": "SelectionObject"
                        },
                        "qSelectionObjectDef": {}
                    };
                    list = await this.app.createSessionObject(obj);
                    layout = await list.getLayout();
                    return layout.qSelectionObject.qSelections;

                default:
                    return `"${qType} is not available!"`
            }
        } catch (error) {
            logger.error(`error: ${JSON.stringify(error)}`, {model: `Enigma::getList()`});
        }
    }

    async selections() {
        try {
            await this.connect();
        } catch (error) {
            logger.error(`error: ${JSON.stringify(error)}`, {model: `Enigma::kpi()`});
        }
    }

    async select(field, value) {
        try {
            await this.connect();
            let result = await this.app.selectAssociations({
                "qSearchFields": [field],
                "qContext": "CurrentSelections"
            }, [value], 0);
            return result;
        } catch (error) {
            logger.error(`error: ${JSON.stringify(error)}`, {model: `Enigma::select()`});
        }
    }

    async clear(field) {
        try {
            await this.connect();
            if (field) {
                return `All Selections from "${field}" are cleared `;
            } else {
                await this.app.clearAll();
                return 'All Selections are cleared ';
            }
        } catch (error) {
            logger.error(`error: ${JSON.stringify(error)}`, {model: `Enigma::clearAll()`});
        }
    }

    async getHyperCube(dimensions, measures, limit) {
        try {
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
                }
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
                }
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
            let list = await this.app.createSessionObject(obj);
            let layout = await list.getLayout();
            return layout.qHyperCube.qDataPages[0].qMatrix;
        } catch (error) {
            logger.error(`error: ${JSON.stringify(error)}`, {model: `Enigma::getHyperCube()`});
        }
    }

    async getMeasure(id) {
        try {
            await this.connect();
            let measure = await this.app.getMeasure(id);
            let layout = await measure.getLayout();
            return layout.qMeasure;
        } catch (error) {
            logger.error(`error: ${JSON.stringify(error)}`, {model: `Enigma::getMeasure()`});
        }
    }

    async getDimension(id) {
        try {
            await this.connect();
            let measure = await this.app.getDimension(id);
            let layout = await measure.getLayout();
            return layout.qDim;
        } catch (error) {
            logger.error(`error: ${JSON.stringify(error)}`, {model: `Enigma::getDimension()`});
        }
    }
};

module.exports = Enigma;