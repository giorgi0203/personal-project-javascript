export default class Transaction {
    constructor() {
        this.store = {};
        this.logs = [];
    }
    validate(property, type, arg, required) {
        if (required) {
            if (typeof property !== type) {
                throw new Error(`${arg} is required and must be ${type}`);
            }
        } else {
            if (property !== undefined && typeof property !== type) {
                throw new Error(`${arg} must be ${type}`);
            }
        }

        return this;
    }

    validateScenarios(scenarios) {
        scenarios.forEach(scenario => {
            let { index, meta: { title, description }, call, restore } = scenario;
            this.validate(index, 'number', 'index', true)
                .validate(title, 'string', 'title', true)
                .validate(description, 'string', 'description', true)
                .validate(call, 'function', 'call', true)
                .validate(restore, 'function', 'restore', false);
        });
    }

    async dispatch(scenarios) {
        this.validateScenarios(scenarios);
        //sort scenarios by index
        scenarios.sort((curr, next) => {
            return curr.index > next.index;
        });
        for (let i = 0; i < scenarios.length; i++) {
            try {
                //save current state
                let storeBefore = this.store;
                //get new state
                let storeAfter = await scenarios[i].call(this.store);
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
                let { meta, index, flag } = scenarios[i];
                if (flag == false || flag == undefined) {
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
                }
            }
        }
        // scenarios.forEach(async (scenario, currentIndex) => {

        // });
    }
}

