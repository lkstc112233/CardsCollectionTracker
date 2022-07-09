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
    var buttonElem = document.createElement('button');
    buttonElem.className = 'hidden-hover-button circle-button plus';
    var buttonDiv = document.createElement('div');
    buttonDiv.className = 'hidden-hover-content';
    buttonDiv.appendChild(buttonElem);
    var imageDiv = document.createElement('div');
    imageDiv.className = 'hidden-hover-base';
    imageDiv.appendChild(imageElem);
    imageDiv.appendChild(buttonDiv);
    var nameElem = document.createElement('div');
    nameElem.innerText = card.getName();
    nameElem.id = `card-${card.getId()}-name`;
    nameElem.className = 'card-name';
    var cardInfoElem = document.createElement('div');
    cardInfoElem.className = 'card-box';
    cardInfoElem.id = `card-${card.getId()}-div`;
    cardInfoElem.appendChild(imageDiv);
    cardInfoElem.appendChild(nameElem);
    return cardInfoElem;
}

module.exports = {
    createCardDom,
    createCardInfoDom,
};