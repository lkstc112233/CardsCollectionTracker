const { clearAllPlaceholders } = require('./clear_placeholders');
const { loadBinderDom } = require('./load_card_list');
const grpc = require('../grpc');
const { createSearchCardElements } = require('./search_card');
const selected_binder = require('./selected_binder');
const bottom_bar = require('./bottom_bar');

let sidebarOpened = false;
function toggleSidebar() {
    if (sidebarOpened) {
        document.getElementById("binder-sidebar").style.width = "50px";
        document.getElementById("binder-sidebar").style.left = "calc(100% - 50px)";
        document.getElementById("main-panel").style.marginRight = "50px";
    } else {
        document.getElementById("binder-sidebar").style.width = "400px";
        document.getElementById("binder-sidebar").style.left = "calc(100% - 400px)";
        document.getElementById("main-panel").style.marginRight = "400px";
    }
    sidebarOpened = !sidebarOpened;
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
        additionalClassName = '';
        if (binder.getId() === selected_binder.getSelectedBinder()) {
            additionalClassName = ' selected-menu-item';
        } else if (binder.getId() === bottom_bar.getCurrentBottomBinder()) {
            additionalClassName = ' bottomed-menu-item';
        }
        binderButton.className = `menu-button${additionalClassName}`;
        binderButton.innerHTML = `&gt;<span class="menu-text">${binder.getName()} (${binder.getCardCount()})</span>`;
        binderButton.onclick = function() {
            selected_binder.setSelectedBinder(binder.getId());
            selected_binder.setSelectedBinderName(binder.getName());
            if (binder.getId() === bottom_bar.getCurrentBottomBinder()) {
                selected_binder.setSelectedBinderCount(bottom_bar.getBottomBinderCount());
            } else {
                selected_binder.setSelectedBinderCount(binder.getCardCount());
            }
            bottom_bar.collapseBottomBar();
            clearAllPlaceholders();
            loadBinderSidebar();
            loadBinderDom(binder.getId());
        };
        binderButton.oncontextmenu = function() {
            if (binder.getId() === selected_binder.getSelectedBinder()) {
                return false;
            }
            bottom_bar.popBottomBar(binder.getId(), binder.getName(), binder.getCardCount());
            loadBinderSidebar();
            return false;
        }
        return binderButton;
    });
}

function maybeDeleteSelectedBinder() {
    if (selected_binder.getSelectedBinder() === 1) {
        alert('Unbinded binder cannot be deleted.');
        return;
    }
    if (!confirm(`Are you sure to delete binder ${selected_binder.getSelectedBinderName()}?\nThis operation cannot be reverted!`)) {
        return;
    }
    let binder = prompt(`Type in the name of binder "${selected_binder.getSelectedBinderName()}" to confirm deletion`, '');
    if (binder === null) {
        return;
    }
    if (binder.toUpperCase() === selected_binder.getSelectedBinderName().toUpperCase()) {
        grpc.deleteBinder(selected_binder.getSelectedBinder()).then(() => loadBinderSidebar());
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
            grpc.addBinder(binder).then(() => loadBinderSidebar());
        }
    };
    const addCardsButton = document.createElement('a');
    addCardsButton.className = 'menu-button';
    addCardsButton.innerHTML = '+<span class="menu-text">Add Cards</span>';
    addCardsButton.onclick = function() {
        bottom_bar.collapseBottomBar();
        if (selected_binder.getSelectedBinder() === 0) {
            alert('Please select a binder first.');
            return;
        }
        createSearchCardElements();
    };
    const wishlistButton = document.createElement('a');
    wishlistButton.className = `menu-button ${selected_binder.isWishlistSelected()
        ?' selected-menu-item'
        :''
    }`;
    wishlistButton.innerHTML = '✪<span class="menu-text ${}">Wishlist</span>';
    wishlistButton.onclick = function() {
        bottom_bar.collapseBottomBar();
        clearAllPlaceholders();
        selected_binder.selectWishlist();
        loadBinderSidebar();
    };
    const deleteBinderButton = document.createElement('a');
    deleteBinderButton.className = 'menu-button';
    deleteBinderButton.innerHTML = '☠<span class="menu-text">Remove Binder</span>';
    deleteBinderButton.onclick = maybeDeleteSelectedBinder;
    listOfBindersDom = await loadBinderListDoms();
    document.getElementById("binder-sidebar")
        .replaceChildren(toggleButton,
            refreshButton,
            addBinderButton,
            addCardsButton,
            wishlistButton,
            ...listOfBindersDom,
            deleteBinderButton);
}

module.exports = {
    loadBinderSidebar,
}