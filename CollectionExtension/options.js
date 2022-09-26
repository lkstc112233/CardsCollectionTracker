// Saves options to chrome.storage
function save_options() {
    var backendAddress = document.getElementById('backend-address').value;
    chrome.storage.sync.set({
        backendAddress: backendAddress
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
}

// Restores settings using the preferences stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get({
        backendAddress: 'http://localhost:33333'
    }, function(items) {
        document.getElementById('backend-address').value = items.backendAddress;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);