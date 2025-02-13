
const enterTransaction = async (taxId, date, amount) => {
	const headers = new Headers();
	headers.append("Content-Type", "application/json");

	// 1. add a row (returns row index context)
	const response = await fetch(`https://zhp.services.zh.ch/api/ZHprivateTax2024/${taxId}/view/wizard.securities/table`, {
		method: "post",
		body: JSON.stringify({
			action: "ADD_ROW",
			rowIndex: -1,
			tableContext: null,
			tableId: "securitiesWAAdditionDivestitureDetail"
		}),
		headers: headers
	});
	const jsonResponse = await response.json();
	const rows = jsonResponse.view[1].dialog.tables[1].rows;
	const addedRow = rows[rows.length - 1];
	const rowContext = addedRow[0].context;
	// Set KAUF/VERKAUF
	const typePromise = fetch(`https://zhp.services.zh.ch/api/ZHprivateTax2024/${taxId}/view/wizard.securities/entity`, {
		method: "post",
		body: JSON.stringify({
			context: rowContext,
			deleteImport: false,
			id: "securitiesWAAdditionDivestitureDetailReason",
			value: (amount >= 0 ? "00" : "10") // transaction table contains purchases as positive values, and sales as negative values. Reason "00" is KAUF, "10" is VERKAUF.
		}),
		headers: headers
	});
	// Set amount
	const amountPromise = fetch(`https://zhp.services.zh.ch/api/ZHprivateTax2024/${taxId}/view/wizard.securities/entity`, {
		method: "post",
		body: JSON.stringify({
			context: rowContext,
			deleteImport: false,
			id: "securitiesWAAdditionDivestitureDetailFaceValueQuantity",
			value: Math.abs(amount) // reason already handles whether it's a sale or purchase, quantity is expected to be positive.
		}),
		headers: headers
	});
	// Set date
	const datePromise = fetch(`https://zhp.services.zh.ch/api/ZHprivateTax2024/${taxId}/view/wizard.securities/entity`, {
		method: "post",
		body: JSON.stringify({
			context: rowContext,
			deleteImport: false,
			id: "securitiesWAAdditionDivestitureDetailDate",
			value: date // assumed to be in format DD.MM.YYYY
		}),
		headers: headers
	});
	await Promise.all([typePromise, amountPromise, datePromise])

}

const startImportFromIbkr = () => {
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
			performImportFromIbkr(e.target.result);
		};
		reader.readAsText(file, "UTF-8");
	};
	input.click();
};

const performImportFromIbkr = (inputFileContent) => {
	// get ID from current url.
	// Structure is https://zhp.services.zh.ch/app/ZHprivateTax2024/#/${TAXID}/dialogs/securities/securities-detail
	const taxId = document.location.hash.split('/')[1];
	if (!taxId) {
		return;
	}
	const isin = document.querySelector('input#securitiesWAISINNumber\\:Input').value.replaceAll(' ', '');
	const entries = inputFileContent.split('\n').map(line => line.split(',').map(v => v.replaceAll('"', '')))
	const matchingEntries = entries.filter(e => e[0] == isin);

	const table = document.querySelector('zhp-securities-detail-buy-sell-table');
	const progressSpan = table.querySelector('span#import-progress');

	let chain = Promise.resolve();
	let count = 0;
	for (let entry of matchingEntries) {
		let date = entry[1]; // is in format YYYY-MM-DD;HHMMSS and needs to be 'DD.MM.YYYY'
		const dateParts = date.split(';')[0].split('-');
		date = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`
		const amount = entry[2];
		chain = chain
			.then(() => {
				return enterTransaction(taxId, date, amount)
			})
			.then(() => {
				++count;
				progressSpan.textContent = `Imported ${count} of ${matchingEntries.length} transactions.`
			});
	}
	chain.then(() => document.location.reload());
}

const start = () => {
	// find the buy/sell table
	const table = document.querySelector('zhp-securities-detail-buy-sell-table');
	if (!table) {
		console.log('not on the right page, it seems: table missing. Import only works in the Wertschriftenverzeichnis.');
		return;
	}
	// if the table already contains a import-progress span, then the stuff was already added
	if (table.querySelector('span#import-progress')) {
		return;
	}

	const addRowButton = table.querySelector('button.add-new-row-button');
	if (!addRowButton) {
		console.log('not on the right page, it seems: addNewRow button missing');
		return;
	}
	// add a span to indicate progress
	const progressSpan = document.createElement('span');
	progressSpan.id = 'import-progress';
	addRowButton.insertAdjacentElement('afterend', progressSpan);
	chrome.storage.sync.get({
        ibkr: true,
    }, function (items) {
		// add a button next to this addRowButton for importing CSV
		if (items.ibkr) {
			const importButton = addRowButton.cloneNode(true);
			importButton.querySelector('span').textContent = 'IBKR import';
			importButton.onclick = () => startImportFromIbkr();
			addRowButton.insertAdjacentElement('afterend', importButton);
		}
    });

}

// Create an observer instance linked to the callback function
const observer = new MutationObserver(start);

// Start observing the target node for configured mutations
observer.observe(document.body, { childList: true, subtree: true });
