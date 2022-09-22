const { createCardDom, createCardInfoDom } = require('./create_card');
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
            .filter(element => element.childElementCount > 0)
            .map(element => element.firstChild)
            .filter(element => element.className === 'card-box')
            .map(element => {
                id = element.id.match(cardIdFromElemId)[1];
                return grpc.moveCardToAnotherBinder(id, bottomBar.getCurrentBottomBinder())
                    .then(() => element.parentElement);
            })).then((arr) => {
                var size = arr.length;
                arr.forEach(element => element.remove());
                var sidebarButton = document.getElementsByClassName('menu-button selected-menu-item');
                if (sidebarButton.length === 1) {
                    sidebarButton[0].innerHTML = `&gt;<span class="menu-text">${getSelectedBinderName()} (${increaseSelectedBinderCountBy(-size)})</span>`;
                }
                var sidebarButton = document.getElementsByClassName('menu-button bottomed-menu-item');
                if (sidebarButton.length === 1) {
                    sidebarButton[0].innerHTML = `&gt;<span class="menu-text">${bottomBar.getBottomBinderName()} (${bottomBar.increaseBottomBinderCountBy(size)})</span>`;
                }
            });
    }
});

async function loadBinderDom(binder = 0) {
    listResponse = await grpc.listAllBinderCards(binder);
    cardsList = listResponse.getCardsList()
        .map(card => createCardDom(card))
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
    document.getElementById('cards-collection').replaceChildren(...cardsList);
    ds.clearSelection();
    ds.setSelectables(cardsList);
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

module.exports = {
    loadBinderDom,
    loadSearchAddListDom,
}