const { createCardDom, createWishCardDom, createCardInfoDom, createWishCardInfoDom, createGhostCardDom } = require('./create_card');
const grpc = require('../grpc');
const DragSelect = require('dragselect');
const { getSelectedBinderName, increaseSelectedBinderCountBy } = require('./selected_binder');
const bottomBar = require('./bottom_bar');

const ds = new DragSelect({});
const cardIdFromElemId = /-(\d+)-/i;
ds.subscribe('callback', (callbackObj) => {
    if (!callbackObj.isDragging) {
        return;
    }
    callbackObj.items.forEach(element => {
        element.style.transform = '';
    });
    if (bottomBar.getCurrentBottomBinder() === null) {
        return;
    }
    triggerEvent = callbackObj.event;
    elemBelow = document.elementFromPoint(triggerEvent.clientX, triggerEvent.clientY);
    if (elemBelow == document.getElementById('binder-droparea')) {
        Promise.all(callbackObj.items
            .filter(element => document.body.contains(element))
            .filter(element => element.childElementCount > 0)
            .map(element => element.firstChild)
            .filter(element => element.classList.contains('card-box'))
            .map(element => {
                id = element.id.match(cardIdFromElemId)[1];
                var isRent = bottomBar.getIsBottomBinderADeck();
                return grpc.moveCardToAnotherBinder(id, bottomBar.getCurrentBottomBinder(), isRent)
                    .then(() => element.parentElement);
            })).then((arr) => {
                var size = arr.length;
                if (bottomBar.getIsBottomBinderADeck()) {
                    arr.forEach(element => element.firstChild.className = 'card-box rented-out');
                } else {                    
                    arr.forEach(element => element.remove());
                    var sidebarButton = document.getElementsByClassName('menu-button selected-menu-item');
                    if (sidebarButton.length === 1) {
                        sidebarButton[0].innerHTML = `&gt;<span class="menu-text">
                        <span id="binder-${getSelectedBinder()}-name-sidebar">${getSelectedBinderName()}</span> (${increaseSelectedBinderCountBy(-size)})</span>`;
                    }
                    var sidebarButton = document.getElementsByClassName('menu-button bottomed-menu-item');
                    if (sidebarButton.length === 1) {
                        sidebarButton[0].innerHTML = `&gt;<span class="menu-text">
                        <span id="binder-${bottomBar.getCurrentBottomBinder()}-name-sidebar">${bottomBar.getBottomBinderName()}</span> (${bottomBar.increaseBottomBinderCountBy(size)})</span>`;
                    }
                }
            });
    }
});

async function maybeGetGhostResponse(binder, type) {
    if (type === 4) {
        return grpc.showSolidifyGhostDeckPlan(binder);
    } else {
        return Promise.resolve();
    }
}

function cardSorter(a, b) {
    if (a.getCardInfo().getName() < b.getCardInfo().getName()) {
        return -1;
    }
    if (a.getCardInfo().getName() > b.getCardInfo().getName()) {
        return 1;
    }
    return 0;
}

// Assume input is sorted.
function mergeCardLists(dest, from) {
    var fromIndex = 0;
    for (var destIndex = 0; destIndex < dest.length; ++destIndex) {
        if (fromIndex >= from.length) {
            break;
        }
        if (dest[destIndex].getCardInfo().getName() === from[fromIndex].getCardInfo().getName()) {
            dest[destIndex] = from[fromIndex];
            fromIndex += 1;
        }
    }
    return dest;
}

async function loadBinderDom(binder, type) {
    listResponse = await grpc.listAllBinderCards(binder);
    ghostResponse = await maybeGetGhostResponse(binder, type);
    cardsList = listResponse.getCardsList();
    if (type === 4) {
        cardsList = mergeCardLists(cardsList.sort(cardSorter), 
            ghostResponse.getCardsList().sort(cardSorter));
    }
    if (type === 4) {
        cardsList = cardsList.map(card => createGhostCardDom(card, binder));
    } else {
        cardsList = cardsList
            .map(card => createCardDom(card, binder))
            .map(cardDom => {
                var dragCardElem = document.createElement('div');
                dragCardElem.className = 'drag-card';
                dragCardElem.appendChild(cardDom);
                cardDom.oncontextmenu = function() {
                    elemsToDelete = ds.getSelection();
                    if (!elemsToDelete.find(elem => elem === dragCardElem)) {
                        elemsToDelete.push(dragCardElem);
                    }
                    if (!confirm(`Are you sure to delete ${elemsToDelete.length} card${elemsToDelete.length>1?'s':''} from your collection?\nThis operation cannot be reverted!`)) {
                        return false;
                    }
                    Promise.all(elemsToDelete
                        .filter(element => element.childElementCount > 0)
                        .map(element => element.firstChild)
                        .filter(element => element.className === 'card-box')
                        .map(element => {
                            id = element.id.match(cardIdFromElemId)[1];
                            return grpc.deleteCardInCollection(id).then(() => element.parentElement);
                        })).then((arr) => {
                            arr.forEach(element => {
                                element.remove();
                            });
                        });
                    return false;
                };
                return dragCardElem;
            });
    }
    document.getElementById('cards-collection').replaceChildren(...cardsList);
    ds.clearSelection();
    if (type !== 4) {
        ds.setSelectables(cardsList);
    }
}

async function loadWishlistDom() {
    listResponse = await grpc.listWishlist();
    cardsList = listResponse.getWishlistList()
        .map(wish => {
            var wishDom = createWishCardDom(wish);
            return wishDom;
        });
    document.getElementById('cards-collection').replaceChildren(...cardsList);
    ds.clearSelection();
}

async function loadSearchAddListDom(query = '', allLang = false) {
    // Search is not performed for empty query.
    if (query === '') {
        return;
    }
    var listStub = document.getElementById('search-add-list');
    var listParent = document.createElement('div');
    listStub.innerHTML = '';
    listStub.appendChild(listParent);
    listResponse = await grpc.queryCardInfoByName(query, allLang);
    listParent.replaceChildren(...listResponse.getInfoList().map(card => createCardInfoDom(card)));
    var searchAllElem = document.createElement('div');
    searchAllElem.innerText = '--Search all language--';
    searchAllElem.className = 'search-all-lang-button';
    searchAllElem.onclick = function() {
        loadSearchAddListDom(query, true);
    }
    listParent.appendChild(searchAllElem);
}

async function loadWishSearchAddListDom(query = '') {
    // Search is not performed for empty query.
    if (query === '') {
        return;
    }
    var listStub = document.getElementById('search-add-list');
    var listParent = document.createElement('div');
    listStub.innerHTML = '';
    listStub.appendChild(listParent);
    listResponse = await grpc.queryCardInfoByName(query, false);
    var cardNameUnique = [...new Set(listResponse.getInfoList().map(card => card.getName()))];
    listParent.replaceChildren(...cardNameUnique.map(card => createWishCardInfoDom(card)));
}

module.exports = {
    loadBinderDom,
    loadWishlistDom,
    loadSearchAddListDom,
    loadWishSearchAddListDom,
}