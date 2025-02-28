function save_options() {
    var ibkr = document.getElementById('ibkr').checked;
    var morganStanleyAtWork = document.getElementById('morganStanleyAtWork').checked;
    chrome.storage.sync.set({
        ibkr: ibkr,
        morganStanleyAtWork: morganStanleyAtWork,
    });
}
document.getElementById('ibkr').addEventListener('click', save_options);
document.getElementById('morganStanleyAtWork').addEventListener('click', save_options);

function restore_options() {
    chrome.storage.sync.get({
        ibkr: true,
		morganStanleyAtWork: true,
    }, function (items) {
        document.getElementById('ibkr').checked = items.ibkr;
        document.getElementById('morganStanleyAtWork').checked = items.morganStanleyAtWork;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);