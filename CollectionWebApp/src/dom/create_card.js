const grpc = require('../grpc');
const { getSelectedBinder } = require('./selected_binder');

function createCardDom(card) {
    var imageElem = document.createElement('img');
    imageElem.src = card.getCardInfo().getImageUri();
    imageElem.id = `card-${card.getId()}-image`;
    imageElem.className = 'card-img';
    var imageDiv = document.createElement('div');
    imageDiv.appendChild(imageElem);
    var nameElem = document.createElement('div');
    nameElem.innerText = card.getCardInfo().getName();
    nameElem.id = `card-${card.getId()}-name`;
    nameElem.className = 'card-name';
    var cardInfoElem = document.createElement('div');
    cardInfoElem.className = 'card-box';
    cardInfoElem.id = `card-${card.getId()}-div`;
    cardInfoElem.appendChild(imageDiv);
    cardInfoElem.appendChild(nameElem);
    return cardInfoElem;
}

function createButtonRowDom(card, version) {
    var buttonElem = document.createElement('button');
    buttonElem.className = 'circle-button plus';
    buttonElem.onclick = function() {
        grpc.addCardToCollection(card.getId(), version, getSelectedBinder());
    }
    var buttonRowText = document.createElement('span');
    buttonRowText.innerText = version? version: 'nonfoil';
    buttonRowText.style.color = 'white';
    var buttonRowDiv = document.createElement('div');
    buttonRowDiv.className = 'hidden-hover-button';
    buttonRowDiv.appendChild(buttonRowText);
    buttonRowDiv.appendChild(buttonElem);
    return buttonRowDiv;
}

function createCardInfoDom(card) {
    var imageElem = document.createElement('img');
    imageElem.src = card.getImageUri();
    imageElem.id = `card-${card.getId()}-image`;
    imageElem.className = 'card-img';
    var buttonDiv = document.createElement('div');
    buttonDiv.className = 'hidden-hover-content';
    const versionsList = card.getVersionsList();
    if (versionsList.length === 0) {
        buttonDiv.appendChild(createButtonRowDom(card));
    } else {
        versionsList
            .map(version => createButtonRowDom(card, version))
            .forEach(element => {
                buttonDiv.appendChild(element);
            });
    }
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