import { enterTransactions, Transaction } from "./import_transaction.js";

const startImport = (is_wv) => {
    let input = document.createElement("input");
    input.type = "file";
    input.setAttribute("multiple", false);
    input.setAttribute("accept", ".csv");
    input.onchange = function () {
        const file = input.files[0];
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.onload = (e) => {
            performImport(e.target.result, is_wv);
        };
        reader.readAsText(file, "UTF-8");
    };
    input.click();
};

const performImport = (inputFileContent, is_wv) => {
    // get ID from current url.
    // Structure is https://zhp.services.zh.ch/app/ZHprivateTax2024/#/${TAXID}/dialogs/securities/securities-detail
    const taxId = document.location.hash.split('/')[1];
    if (!taxId) {
        return;
    }
    const isin = document.querySelector(`input#${(is_wv ? 'securities' : 'da1')}WAISINNumber\\:Input`).value.replaceAll(' ', '');
    const entries = inputFileContent.split('\n').map(line => line.split(',').map(v => v.replaceAll('"', '')))
    const matchingEntries = entries.filter(e => e[0] == isin);
    const transactions = matchingEntries.map(entry => {
        let date = entry[1]; // is in format YYYY-MM-DD;HHMMSS and needs to be 'DD.MM.YYYY'
        const dateParts = date.split(';')[0].split('-');
        date = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`
        const amount = entry[2];
        return new Transaction(amount, date);
    });
    enterTransactions(taxId, transactions, is_wv);
}

export {startImport};