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

function getSelectedBinder() {
    return selectedBinder;
}

async function loadBinderListDoms() {
    listBindersResponse = await grpc.listBinders();
    return listBindersResponse.getBindersList().map(binder => {
        binderButton = document.createElement('a');
        binderButton.className = `menu-button${binder.getId() === selectedBinder?' selected-menu-item':''}`;
        binderButton.innerHTML = `&gt;<span class="menu-text">${binder.getName()}</span>`;
        binderButton.onclick = function() {
            selectedBinder = binder.getId();
            loadBinderSidebar();
        }
        return binderButton;
    });
}

async function loadBinderSidebar() {
    const toggleButton = document.createElement('a');
    toggleButton.className = 'toggle-button';
    toggleButton.onclick = toggleSidebar;
    toggleButton.innerText = '☰';
    const addBinderButton = document.createElement('a');
    addBinderButton.className = 'menu-button';
    addBinderButton.innerHTML = '+<span class="menu-text">Add Binder</span>';
    listOfBindersDom = await loadBinderListDoms();
    document.getElementById("binder-sidebar")
        .replaceChildren(toggleButton, addBinderButton, ...listOfBindersDom);
}

module.exports = {
    loadBinderSidebar,
    getSelectedBinder,
}