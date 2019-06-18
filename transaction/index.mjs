export default class Transaction {
    constructor() {
        this.store = {};
        this.logs = [];
    }
    validate(scenario, schema) {

        let schemaKeyes = Object.keys(schema).filter((item) => {
            return typeof schema[item] === 'object';
        });
        let scenarioKeyes = Object.keys(scenario);
        //check for missing scenario keyes
        for (const key of schemaKeyes) {
            if (schema[key].isRequired) {
                if (scenarioKeyes.indexOf(key) == -1) {
                    throw new Error(`{${key}} is not found`);
                }
            }
        }
        //check for extra scenario keyes
        for (const key of scenarioKeyes) {
            if (schemaKeyes.indexOf(key) == -1) {
                throw new Error(`{${key}} is not recognized`);
            }
        }
        scenarioKeyes.forEach((item) => {
            let params = { ...schema[item] }
            if (typeof scenario[item] === schema[item].type && typeof scenario[item] === 'object') {
                this.validate(scenario[item], schema[item])
            } else {
                if (params.isPositive) {
                    if (scenario[item] < 0) {
                        throw new Error(`{${item}} is negative`);
                    }
                }
                if (!params.isRequired) {
                    if (scenario[item] !== undefined && typeof scenario[item] !== schema[item].type) {
                        throw new Error(`{${item}} is not required but type must be {${schema[item].type}}`);
                    }
                } else {
                    if (typeof scenario[item] !== schema[item].type) {
                        throw new Error(`{${item}} is required and type must be {${schema[item].type}}`);
                    }
                }
            }
        });
    }

    validateScenarios(scenarios, schema) {
        scenarios.forEach(scenario => {
            this.validate(scenario, schema);
        });
        //sort scenarios by index
        scenarios = scenarios.sort((curr, next) => {
            return curr.index > next.index;
        });
        //specifical validation for restore silent
        if (scenarios[scenarios.length - 1].hasOwnProperty('restore')) {
            throw new Error(`lenght of scenarios is ${scenarios.length} and last element must not have {restore}`);
        }
    }

    async dispatch(scenarios) {
        let schema = {
            index: {
                type: 'number',
                isPositive: true,
                isRequired: true
            },
            silent: {
                type: 'boolean',
                isRequired: false
            },
            meta: {
                type: 'object',
                isRequired: true,
                title: {
                    type: 'string',
                    isRequired: true
                },
                description: {
                    type: 'string',
                    isRequired: true
                }
            },
            call: {
                type: 'function',
                isRequired: true
            },
            restore: {
                type: 'function',
                isRequired: false
            }
        }
        this.validateScenarios(scenarios, schema);

        for (let i = 0; i < scenarios.length; i++) {
            //save current state
            let storeBefore = { ...this.store };
            try {
                //get new state
                await scenarios[i].call(this.store);
                let storeAfter = { ...this.store };
                //build up log object
                let { meta, index } = scenarios[i];
                this.logs.push({
                    meta,
                    index,
                    storeBefore,
                    storeAfter,
                    error: null
                });
            } catch (err) {
                let { meta, index, silent } = scenarios[i];
                if (silent == false || silent == undefined) {
                    this.logs.push({
                        meta,
                        index,
                        error: err
                    });
                    for (let j = i - 1; j >= 0; j--) {
                        if (scenarios[j].restore) {
                            try {
                                await scenarios[j].restore();
                            } catch (err) {
                                throw err;
                            }

                        }
                    }
                    this.store = null;
                    break;
                } else if (silent == true) {
                    let storeAfter = this.store;
                    let { meta, index } = scenarios[i];
                    this.logs.push({
                        meta,
                        index,
                        storeBefore,
                        storeAfter,
                        error: err
                    });
                }
            }
        }
    }
}

