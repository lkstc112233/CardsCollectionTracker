const { create_card_dom } = require('./dom/create_card');
const grpc = require('./grpc');
const DragSelect = require('dragselect');

grpc.listAllBinderCards().then(listResponse => {
    document.getElementById('cards-collection').innerHTML = `
        ${listResponse.getCardsList()
            .map(card => create_card_dom(card))
            .map(cardDom => '<div class="drag-card">' + cardDom + '</div>')
            .join('')}
        `;
    new DragSelect({
        selectables: document.getElementsByClassName('drag-card')
    });
});
