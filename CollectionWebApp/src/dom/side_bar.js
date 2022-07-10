const grpc = require('../grpc');

let sidebarOpened = false;
function toggleSidebar() {
    if (sidebarOpened) {
        document.getElementById("binder-sidebar").style.width = "50px";
        document.getElementById("binder-sidebar").style.left = "calc(100% - 50px)";
        document.getElementById("main-panel").style.marginRight = "50px";
    } else {
        document.getElementById("binder-sidebar").style.width = "250px";
        document.getElementById("binder-sidebar").style.left = "calc(100% - 250px)";
        document.getElementById("main-panel").style.marginRight = "250px";
    }
    sidebarOpened = !sidebarOpened;
}

let selectedBinder = 1;
let selectedBinderName = '';

function getSelectedBinder() {
    return selectedBinder;
}

let refreshingMetadata = false;

async function refreshMetadata() {
    if (refreshingMetadata) {
        return;
    }
    refreshingMetadata = true;
    await grpc.updateMetadata();
    refreshingMetadata = false;
}

async function loadBinderListDoms() {
    listBindersResponse = await grpc.listBinders();
    return listBindersResponse.getBindersList().map(binder => {
        binderButton = document.createElement('a');
        binderButton.className = `menu-button${binder.getId() === selectedBinder?' selected-menu-item':''}`;
        binderButton.innerHTML = `&gt;<span class="menu-text">${binder.getName()}</span>`;
        binderButton.onclick = function() {
            selectedBinder = binder.getId();
            selectedBinderName = binder.getName();
            loadBinderSidebar();
        };
        return binderButton;
    });
}

function maybeDeleteSelectedBinder() {
    if (selectedBinder === 1) {
        alert('Unbinded binder cannot be deleted.');
        return;
    }
    if (!confirm(`Are you sure to delete binder ${selectedBinderName}?\nThis operation cannot be reverted!`)) {
        return;
    }
    let binder = prompt(`Type in the name of binder "${selectedBinderName}" to confirm deletion`, '');
    if (binder === null) {
        return;
    }
    if (binder.toUpperCase() === selectedBinderName.toUpperCase()) {
        grpc.deleteBinder(selectedBinder).then(() => loadBinderSidebar());
    } else {
        alert('Please type in the correct name.');
    }
}

async function loadBinderSidebar() {
    const toggleButton = document.createElement('a');
    toggleButton.className = 'toggle-button';
    toggleButton.onclick = toggleSidebar;
    toggleButton.innerText = '☰';
    const refreshButton = document.createElement('a');
    refreshButton.className = 'menu-button';
    if (refreshingMetadata) {
        refreshButton.innerHTML = '⛾<span class="menu-text">Refreshing...</span>';
    } else {
        refreshButton.innerHTML = '⛏<span class="menu-text">Refresh Metadata</span>';
    }
    refreshButton.onclick = function() {
        if (refreshingMetadata) {
            return;
        }
        refreshButton.innerHTML = '⛾<span class="menu-text">Refreshing...</span>';
        refreshMetadata().then(() => {
            refreshButton.innerHTML = '⛏<span class="menu-text">Refresh Metadata</span>';
        });
    };
    const addBinderButton = document.createElement('a');
    addBinderButton.className = 'menu-button';
    addBinderButton.innerHTML = '+<span class="menu-text">Add Binder</span>';
    addBinderButton.onclick = function() {
        let binder = prompt("New binder name", "New binder");
        if (binder !== null) {
            grpc.addBinder(binder);
            loadBinderSidebar();
        }
    };
    const deleteBinderButton = document.createElement('a');
    deleteBinderButton.className = 'menu-button';
    deleteBinderButton.innerHTML = '☠<span class="menu-text">Remove Binder</span>';
    deleteBinderButton.onclick = maybeDeleteSelectedBinder;
    listOfBindersDom = await loadBinderListDoms();
    document.getElementById("binder-sidebar")
        .replaceChildren(toggleButton, refreshButton, addBinderButton, ...listOfBindersDom, deleteBinderButton);
}

module.exports = {
    loadBinderSidebar,
    getSelectedBinder,
}