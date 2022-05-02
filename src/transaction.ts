export const NewRelicTransaction = (transactionName: string) => (
    target: any,
    name: string,
    descriptor: PropertyDescriptor
) => {
    const method = descriptor.value;
    const trimSlashes = str => str.split('/').filter(v => v !== '').join('/');
    const transactionIdentifier = trimSlashes(transactionName).length > 0 ? trimSlashes(transactionName) : name;
    let nr;
    try {
        // Dynamically load newrelic, in case it is not installed
        nr = require('newrelic');
    } catch {
    }

    descriptor.value = async function (...args) {
        return new Promise((resolve, reject) => {
            nr.startWebTransaction(transactionIdentifier, async () => {
                const transaction = nr.getTransaction();
                const result = await method.apply(this, args);
                transaction.end();
                return resolve(result);
            })
        })

    };
    return descriptor;
}