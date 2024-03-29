const { clearAllPlaceholders } = require('./clear_placeholders');
const { loadBinderDom, loadWishlistDom } = require('./load_card_list');
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

function getBinderSymbol(type) {
    switch(type) {
        case 1:
            return '&gt;';
        case 3:
            return '&lt;';
        case 4:
            return '👻';
        default:
            return '🤔';
    }
}

function getAllCardsId() {
    var cardsDom = Array.from(document.getElementsByClassName('card-box'));
    const idRegex = /card-(\d+)-div/;
    return cardsDom
        .map(dom => dom.id.match(idRegex))
        .filter(match => match !== null)
        .map(match => match[1]);
}

async function loadBinderListDoms() {
    listBindersResponse = await grpc.listBinders();
    return listBindersResponse.getBindersList().map(binder => {
        binderButton = document.createElement('a');
        additionalClassName = '';
        if (binder.getId() === selected_binder.getSelectedBinder()) {
            additionalClassName += ' selected-menu-item';
        } else if (binder.getId() === bottom_bar.getCurrentBottomBinder()) {
            additionalClassName += ' bottomed-menu-item';
            if (binder.getType() === 3) {
                additionalClassName += ' deck-type';
            }
        }
        binderButton.className = `menu-button${additionalClassName}`;
        binderButton.innerHTML = `${getBinderSymbol(binder.getType())}<span class="menu-text">
                <span id="binder-${binder.getId()}-name-sidebar">${binder.getName()}</span>
                (${binder.getCardCount()}${binder.getRentOutCount() === 0?'': ' - ' + binder.getRentOutCount()})</span>`;
        binderButton.onclick = function() {
            if (selected_binder.getSelectedBinder() === binder.getId() &&
                binder.getType() === 3) {
                if (confirm('Return all cards in deck back to binder?')) {
                    grpc.returnCardsInBinder(binder.getId()).then(() => {
                        bottom_bar.collapseBottomBar();
                        clearAllPlaceholders();
                        loadBinderSidebar();
                        loadBinderDom(binder.getId());
                    });
                }
                return;
            }
            if (selected_binder.getSelectedBinder() === binder.getId() &&
                binder.getType() === 4) {
                cardIds = getAllCardsId();
                if (confirm(`Build this deck with ${cardIds.length} cards?`)) {
                    grpc.solidifyGhostDeck(binder.getId(), cardIds).then(() => {
                        bottom_bar.collapseBottomBar();
                        clearAllPlaceholders();
                        loadBinderSidebar();
                        loadBinderDom(binder.getId());
                    });
                }
                return;
            }
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
            loadBinderDom(binder.getId(), binder.getType());
        };
        binderButton.oncontextmenu = function() {
            if (binder.getId() === selected_binder.getSelectedBinder()) {
                if (binder.getId() === 1) {
                    // Unbinded binder do not change.
                    return false;
                }
                let newName = prompt(`Rename "${selected_binder.getSelectedBinderName()}"? Left blank to leave unchanged.`, '');
                if (newName === null) {
                    return false;
                }
                var shouldChange = false;
                if (binder.getType() !== 4) {
                    var hint = 'Change binder to deck?';
                    var newType = 3;
                    if (binder.getType() === 3) {
                        hint = 'Change deck to binder?';
                        newType = 1;
                    }
                    shouldChange = confirm(hint);
                }
                grpc.updateBinder(binder.getId(), newName, shouldChange? newType: 0)
                    .then(() => loadBinderSidebar());
                return false;
            }
            if (binder.getType() !== 4) {
                bottom_bar.popBottomBar(binder.getId(), binder.getName(), binder.getCardCount(),
                    binder.getType() === 3? true: false);
            }
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
        if (selected_binder.isWishlistSelected()) {
            createSearchCardElements(true);
            return;
        } else if (selected_binder.getSelectedBinder() === 0) {
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
        loadWishlistDom();
    };
    wishlistButton.oncontextmenu = function() {
        if (!confirm('Clear fulfilled cards in the wishlist?')) {
            return false;
        }
        grpc.cleanupFulfilledWishes().then(() => {
            if (selected_binder.isWishlistSelected()) {
                clearAllPlaceholders();
                loadWishlistDom();
            }
        });
        return false;
    }
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