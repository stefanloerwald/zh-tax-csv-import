

const start = (ibkr, morganStanleyAtWork) => {
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
		morganStanleyAtWork: true,
	}, function (items) {
		// add a button next to this addRowButton for importing CSV
		if (items.ibkr) {
			const importButton = addRowButton.cloneNode(true);
			importButton.querySelector('span').textContent = 'IBKR import';
			importButton.onclick = () => ibkr.startImport();
			addRowButton.insertAdjacentElement('afterend', importButton);
		}
		if (items.morganStanleyAtWork) {
			const importButton = addRowButton.cloneNode(true);
			importButton.querySelector('span').textContent = 'Morgan Stanley At Work import';
			importButton.onclick = () => morganStanleyAtWork.startImport();
			addRowButton.insertAdjacentElement('afterend', importButton);
		}
	});

}

const importAndStart = async () => {
	const ibkr_src = chrome.runtime.getURL("import_ibkr.js");
	const ibkr = await import(ibkr_src);
	const morganStanleyAtWork_src = chrome.runtime.getURL("import_morganStanleyAtWork.js");
	const morganStanleyAtWork = await import(morganStanleyAtWork_src);
	// Create an observer instance linked to the callback function
	const observer = new MutationObserver(() => start(ibkr, morganStanleyAtWork));
	
	// Start observing the target node for configured mutations
	observer.observe(document.body, { childList: true, subtree: true });
}

importAndStart();
