

class Transaction {
    constructor(amount, date) {
        this.amount = amount;
        this.date = date;
    }
}

const enterTransaction = async (taxId, transaction, is_wv) => {
	const headers = new Headers();
	headers.append("Content-Type", "application/json");

	// 1. add a row (returns row index context)
	const response = await fetch(`https://zhp.services.zh.ch/api/ZHprivateTax2024/${taxId}/view/wizard.${(is_wv ? 'securities' : 'da1')}/table`, {
		method: "post",
		body: JSON.stringify({
			action: "ADD_ROW",
			rowIndex: -1,
			tableContext: null,
			tableId: `${(is_wv ? 'securities' : 'da1')}WAAdditionDivestitureDetail`
		}),
		headers: headers
	});
	const jsonResponse = await response.json();
	const rows = jsonResponse.view[1].dialog.tables[1].rows;
	const addedRow = rows[rows.length - 1];
	const rowContext = addedRow[0].context;
	// Set KAUF/VERKAUF
	const typePromise = fetch(`https://zhp.services.zh.ch/api/ZHprivateTax2024/${taxId}/view/wizard.${(is_wv ? 'securities' : 'da1')}/entity`, {
		method: "post",
		body: JSON.stringify({
			context: rowContext,
			deleteImport: false,
			id: `${(is_wv ? 'securities' : 'da1')}WAAdditionDivestitureDetailReason`,
			value: (transaction.amount >= 0 ? "00" : "10") // transaction table contains purchases as positive values, and sales as negative values. Reason "00" is KAUF, "10" is VERKAUF.
		}),
		headers: headers
	});
	// Set amount
	const amountPromise = fetch(`https://zhp.services.zh.ch/api/ZHprivateTax2024/${taxId}/view/wizard.${(is_wv ? 'securities' : 'da1')}/entity`, {
		method: "post",
		body: JSON.stringify({
			context: rowContext,
			deleteImport: false,
			id: `${(is_wv ? 'securities' : 'da1')}WAAdditionDivestitureDetailFaceValueQuantity`,
			value: Math.abs(transaction.amount) // reason already handles whether it's a sale or purchase, quantity is expected to be positive.
		}),
		headers: headers
	});
	// Set date
	const datePromise = fetch(`https://zhp.services.zh.ch/api/ZHprivateTax2024/${taxId}/view/wizard.${(is_wv ? 'securities' : 'da1')}/entity`, {
		method: "post",
		body: JSON.stringify({
			context: rowContext,
			deleteImport: false,
			id: `${(is_wv ? 'securities' : 'da1')}WAAdditionDivestitureDetailDate`,
			value: transaction.date // assumed to be in format DD.MM.YYYY
		}),
		headers: headers
	});
	await Promise.all([typePromise, amountPromise, datePromise])
}

const enterTransactions = (taxId, transactions, is_wv) => {
    const table = document.querySelector(`zhp-${(is_wv ? 'securities' : 'da1')}-detail-buy-sell-table`);
    const progressSpan = table.querySelector('span#import-progress');

    let chain = Promise.resolve();
    let count = 0;
    for (let transaction of transactions) {
        chain = chain
            .then(() => {
                return enterTransaction(taxId, transaction, is_wv);
            })
            .then(() => {
                ++count;
                progressSpan.textContent = `Imported ${count} of ${transactions.length} transactions.`;
            });
    }
    chain.then(() => document.location.reload());
}

export {enterTransactions, Transaction};