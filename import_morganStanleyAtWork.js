import { Transaction, enterTransactions } from "./import_transaction.js";
import * as fflate from "./node_modules/fflate/esm/browser.js";

const startImport = () => {
    let input = document.createElement("input");
    input.type = "file";
    input.setAttribute("multiple", false);
    input.setAttribute("accept", ".zip");
    input.onchange = async function () {
        const file = input.files[0];
        if (!file) {
            return;
        }

        const zipBuffer = new Uint8Array(await file.arrayBuffer());
        const unzipped = fflate.unzipSync(zipBuffer);
        const fileArray = Object.keys(unzipped)
            .filter(filename => unzipped[filename].length > 0)
            .map(filename => new File([unzipped[filename]], filename));
        performImport(fileArray);
    };
    input.click();
}

const monthNameToMM = (v) => {
    switch (v) {
        case "Jan": return "01";
        case "Feb": return "02";
        case "Mar": return "03";
        case "Apr": return "04";
        case "May": return "05";
        case "Jun": return "06";
        case "Jul": return "07";
        case "Aug": return "08";
        case "Sep": return "09";
        case "Oct": return "10";
        case "Nov": return "11";
        case "Dec": return "12";
        default: return "";
    }
}

const getVestingEvents = (inputFileContent) => {
    // Expected CSV schema: "Date,Order Number,Plan,Type,Order Status,Price,Quantity,Net Share Proceeds,Net Share Proceeds,Tax Payment Method"
    // Relevant fields: 0: Date, 6: Quantity
    const dateColumn = 0;
    const quantityColumn = 6;
    const lines = inputFileContent.split('\n').map(line => line.split(',').map(v => v.replaceAll('"', '')));
    const entries = lines.filter(l => {
        const date = l[dateColumn];
        const dateParts = date.split('-');
        return dateParts.length == 3;
    }); // skip rows that don't contain a date in the date column.
    const transactions = entries.map(entry => {
        let date = entry[dateColumn]; // is in format 25-Jan-2024 and needs to be 'DD.MM.YYYY'
        const dateParts = date.split('-');
        const month = monthNameToMM(dateParts[1]);
        date = `${dateParts[0]}.${month}.${dateParts[2]}`
        const amount = entry[quantityColumn];
        return new Transaction(amount, date);
    })
    return transactions;
}

const getSaleEvents = async (inputFileContent) => {
    // Expected CSV schema: "Execution Date,Order Number,Plan,Type,Order Status,Price,Quantity,Net Amount,Net Share Proceeds,Tax Payment Method"
    // Relevant fields: 0: Execution Date, 2: Plan, 6: Quantity
    const dateColumn = 0;
    const planColumn = 2;
    const quantityColumn = 6;
    const lines = inputFileContent.split('\n').map(line => line.split(',').map(v => v.replaceAll('"', '')));
    const entries = lines.filter(l => l[planColumn] != 'Cash').filter(l => {
        const date = l[dateColumn];
        const dateParts = date.split('-');
        return dateParts.length == 3;
    }); // skip header row and cash rows, and any row not containing a date in the first column.
    const transactions = entries.map(entry => {
        let date = entry[dateColumn]; // is in format 25-Jan-2024 and needs to be 'DD.MM.YYYY'
        const dateParts = date.split('-');
        const month = monthNameToMM(dateParts[1]);
        date = `${dateParts[0]}.${month}.${dateParts[2]}`
        const amount = entry[quantityColumn];
        return new Transaction(amount, date);
    })
    return transactions;
}

const performImport = (files) => {
    // get ID from current url.
    // Structure is https://zhp.services.zh.ch/app/ZHprivateTax2024/#/${TAXID}/dialogs/securities/securities-detail
    const taxId = document.location.hash.split('/')[1];
    if (!taxId) {
        return;
    }
    let resolveVesting = undefined;
    const vestingPromise = new Promise(r => { resolveVesting = r });
    let resolveSales = undefined;
    let salesPromise = new Promise(r => { resolveSales = r });
    const releasesFile = files.find(f => f.name == "Releases Net Shares Report.csv")
    if (releasesFile) {
        // Extract vesting events from "Releases Net Shares Report.csv"
        const readerVesting = new FileReader();
        readerVesting.onload = (e) => {
            resolveVesting(getVestingEvents(e.target.result));
        };
        readerVesting.readAsText(releasesFile, "UTF-8");
    } else {
        resolveVesting([]);
    }
    // Extract sale events from "Withdrawals Report.csv"
    const withdrawalsFile = files.find(f => f.name == "Withdrawals Report.csv")
    if (withdrawalsFile) {
        const readerWithdrawals = new FileReader();
        readerWithdrawals.onload = (e) => {
            resolveSales(getSaleEvents(e.target.result));
        };
        readerWithdrawals.readAsText(withdrawalsFile, "UTF-8");
    } else {
        resolveSales([]);
    }
    Promise.all([vestingPromise, salesPromise]).then(([vestings, sales]) => {
        const transactions = [vestings, sales].flat();
        enterTransactions(taxId, transactions);
    })
}

export { startImport };
