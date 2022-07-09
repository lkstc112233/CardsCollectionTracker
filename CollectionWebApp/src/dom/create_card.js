function createCardDom(card) {
    var image = `<img class="card-img" id="card-${card.getId()}-image" src="${card.getCardInfo().getImageUri()}" />`;
    var text = `<div class="card-name" id="card-${card.getId()}-name">${card.getCardInfo().getName()}</div>`;
    return `<div class="card-box" id="card-${card.getId()}-div">
        <div>${image}</div>
        ${text}
    </div>`;
}

function createCardInfoDom(card) {
    var imageElem = document.createElement('img');
    imageElem.src = card.getImageUri();
    imageElem.id = `card-${card.getId()}-image`;
    imageElem.className = 'card-img';
    var nameElem = document.createElement('div');
    nameElem.innerText = card.getName();
    nameElem.id = `card-${card.getId()}-name`;
    nameElem.className = 'card-name';
    //var image = `<img class="card-img" id="card-${card.getId()}-image" src="${card.getImageUri()}" />`;
    // var text = `<div class="card-name" id="card-${card.getId()}-name">${card.getName()}</div>`;
    var cardInfoElem = document.createElement('div');
    cardInfoElem.className = 'card-box';
    cardInfoElem.id = `card-${card.getId()}-div`;
    cardInfoElem.appendChild(imageElem);
    cardInfoElem.appendChild(nameElem);
    return cardInfoElem;
}

module.exports = {
    createCardDom,
    createCardInfoDom,
};