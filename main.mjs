import Transaction from "./transaction";

const scenario = [
    {
        index: 1,
        meta: {
            title: 'Read popular customers',
            description: 'This action is responsible for reading the most popular customers'
        },
        call: async (store) => {
            return {};
        },
        restore: async (store) => {
            console.log("step 1 restore called");
        }
    },
    {
        index: 2,
        meta: {
            title: 'Add customer',
            description: 'This action is responsible for Adding new customer'
        },
        call: async (store) => {
            return { "step 2": "store changed" };
        },
        restore: async (store) => {
            console.log("step 2 restore called");
            throw new Error("restore failed");
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
            throw new Error("some error step 3");
        },
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
        console.log(store);
        // //logs
        // console.log("******************************");

        // console.log(logs);

        // console.log("******************************");

    } catch (err) {
        console.log("******************************");
        console.log(err);
        // Send email about broken transaction
    }
})();