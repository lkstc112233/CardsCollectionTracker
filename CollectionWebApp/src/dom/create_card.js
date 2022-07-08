function createCardDom(card) {
    var image = `<img id="card-${card.getId()}-image" src="${card.getCardInfo().getImageUri()}" />`;
    var text = `<div class="card-name" id="card-${card.getId()}-name">${card.getCardInfo().getName()}</div>`;
    return `<div class="card-box" id="card-${card.getId()}-div">
        <div>${image}</div>
        ${text}
    </div>`;
}

module.exports = {
    createCardDom,
};