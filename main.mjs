import Transaction from './transaction';

const scenario = [
    {
        index: 1,
        // a:"a",
        meta: {
            title: 'Read popular customers',
            description: 'This action is responsible for reading the most popular customers',
            // test: 's'
        },
        call: async (store) => {
            store.name = 'giorgi';
            store.email = 'giorgi1997arabuli@gmail.com';
        },
        restore: async () => {
            console.log('step 1 restore called');
        }
    },
    {
        index: 2,
        silent: true,
        meta: {
            title: 'Add customer',
            description: 'This action is responsible for Adding new customer'
        },
        call: async (store) => {
            store.surname = 'arabuli';
            throw new Error('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
        },
        restore: async () => {
            console.log('step 2 restore called');
            // throw new Error('restore failed');
        }
    },
    {
        index: 3,
        meta: {
            title: 'Add customer',
            description: 'This action is responsible for Adding new customer'
        },
        // callback for main execution
        call: async (store) => {
            // return {
            //     ...store,
            //     surname: 'arabuli',
            //     age: 22
            // };
        },
        silent: true,
        // callback for rollback
        // restore: async (store) => { }
    }
];

const transaction = new Transaction();

(async () => {
    try {
        await transaction.dispatch(scenario);
        const store = transaction.store; // {} | null
        const logs = transaction.logs; // []
        // console.log(store);
        // //logs
        // console.log('******************************');

        for (const log of logs) {
            console.log('******************************');
            console.log(log);

        }
        // console.log(logs);

        // console.log('******************************');

    } catch (err) {
        console.log('******************************');
        console.log(err);
        // Send email about broken transaction
    }
})();