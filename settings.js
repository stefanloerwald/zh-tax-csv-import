function save_options() {
    var ibkr = document.getElementById('ibkr').checked;
    chrome.storage.sync.set({
        ibkr: ibkr,
    });
}
document.getElementById('ibkr').addEventListener('click', save_options);

function restore_options() {
    chrome.storage.sync.get({
        ibkr: true,
    }, function (items) {
        console.log("restore options");
        document.getElementById('ibkr').checked = items.ibkr;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);