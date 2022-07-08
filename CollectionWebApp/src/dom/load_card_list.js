const { createCardDom } = require('./create_card');
const grpc = require('../grpc');
const DragSelect = require('dragselect');

async function loadBinderDom(binder = 0) {
    return grpc.listAllBinderCards(binder).then(listResponse => {
        document.getElementById('cards-collection').innerHTML = listResponse.getCardsList()
            .map(card => createCardDom(card))
            .map(cardDom => '<div class="drag-card">' + cardDom + '</div>')
            .join('');
        new DragSelect({
            selectables: document.getElementsByClassName('drag-card')
        });
    });
}

module.exports = {
    loadBinderDom,
}