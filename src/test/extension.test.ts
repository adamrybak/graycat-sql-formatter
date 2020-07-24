import * as formatter from '../formatter';

suite('Extension Test Suite', () => {

    // test('Remote Connectivity Test', () => {
    //     return new Promise(async (resolve, reject) => {
    //         let input = `select null`;
    //         let output = `select null`;
    //         let formatted = await formatter.format(input, {});

    //         if (formatted == output) {
    //             resolve();
    //         }
    //         else {
    //             reject(new Error());
    //         }
    //     });
    // });

    // test('New Line Test', () => {
    //     return new Promise(async (resolve, reject) => {
    //         let input = `select order from sales_orders`;
    //         let output = `select order\nfrom sales_orders`;
    //         let formatted = await formatter.format2(input, {});

    //         if (formatted == output) {
    //             resolve();
    //         }
    //         else {
    //             reject(new Error());
    //         }
    //     });
    // });

    test('Comma Test', () => {
        return new Promise(async (resolve, reject) => {
            let input = `select sh.SHIPMENT_ID, sh.CARRIER, sh.ROUTE, sh.ROUTING_CODE, sh.USER_DEF5, c.USER_DEF5 as [CARRIER.USER_DEF5] from SHIPMENT_HEADER sh join CARRIER c on c.CARRIER = substring(sh.ROUTING_CODE, 2, 999) where sh.LEADING_STS = 100 and sh.USER_DEF5 <> c.USER_DEF5`;
            let output = `select order,\n       vendor\nfrom sales_orders`;
            let formatted = await formatter.format2(input, {});

            if (formatted == output) {
                resolve();
            }
            else {
                reject(new Error());
            }
        });
    });

});