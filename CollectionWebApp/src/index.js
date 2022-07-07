const { create_card_dom } = require('./dom/create_card');
const grpc = require('./grpc');

grpc.listAllBinderCards().then(listResponse => {
    document.getElementById('cards').innerHTML = `
        <table id="all-cards">
        <tr>
        ${listResponse.getCardsList()
            .map(card => create_card_dom(card))
            .map(cardDom => '<th>' + cardDom + '</th>')
            .join('')}
        </tr>
        </table>
        `;
});
