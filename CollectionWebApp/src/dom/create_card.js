function create_card_dom(card) {
    var image = `<img id="card-${card.getId()}-image" src="${card.getCardInfo().getImageUri()}" />`;
    var text = `<span id="card-${card.getId()}-name">${card.getCardInfo().getName()}</span>`;
    return `<table id="card-${card.getId()}-table">
      <tr>
        <th>${image}</th>
      </tr>
      <tr>
        <td>${text}</td>
      </tr>
    </table>`;
}

module.exports = {
    create_card_dom,
};