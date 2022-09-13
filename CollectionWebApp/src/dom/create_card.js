const grpc = require('../grpc');
const { getSelectedBinder } = require('./selected_binder');

function createCardDom(card) {
    var imageElem = document.createElement('img');
    imageElem.loading = 'lazy';
    imageElem.src = card.getCardInfo().getImageUri();
    imageElem.id = `card-${card.getId()}-image`;
    imageElem.className = 'card-img';
    var nameElem = document.createElement('div');
    nameElem.innerText = card.getCardInfo().getName();
    nameElem.id = `card-${card.getId()}-name`;
    nameElem.className = 'card-name';
    var setElem = document.createElement('div');
    setElem.innerText = card.getCardInfo().getSetName();
    setElem.id = `card-${card.getId()}-set-name`;
    setElem.className = 'set-name';
    var cardInfoElem = document.createElement('div');
    cardInfoElem.className = 'card-box';
    cardInfoElem.id = `card-${card.getId()}-div`;
    cardInfoElem.appendChild(nameElem);
    cardInfoElem.appendChild(setElem);
    cardInfoElem.appendChild(imageElem);
    cardInfoElem.addEventListener('mousemove', (e) => {
        if (e.buttons & 1) {
            var boundingRect = e.currentTarget.getBoundingClientRect();
            imageElem.style.left = `${e.clientX - boundingRect.left}px`;
            imageElem.style.top = `${e.clientY - boundingRect.top}px`;
        } else {
            imageElem.style.left = `${e.pageX}px`;
            imageElem.style.top = `${e.pageY}px`;
        }
        imageElem.style.opacity = 1;
    });
    cardInfoElem.addEventListener('mouseleave', (e) => {
        imageElem.style.opacity = 0;
        imageElem.style.zIndex = -1;
    });
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
    var buttonRowDiv = document.createElement('div');
    buttonRowDiv.className = 'add-card-button';
    buttonRowDiv.appendChild(buttonRowText);
    buttonRowDiv.appendChild(buttonElem);
    return buttonRowDiv;
}

function createCardInfoDom(card) {
    var imageElem = document.createElement('img');
    imageElem.loading = 'lazy';
    imageElem.src = card.getImageUri();
    imageElem.id = `card-${card.getId()}-image`;
    imageElem.className = 'card-img';
    var buttonDiv = document.createElement('div');
    buttonDiv.className = 'add-card-button-div';
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
    var nameElem = document.createElement('div');
    nameElem.innerText = card.getName();
    nameElem.id = `card-${card.getId()}-name`;
    nameElem.className = 'card-name';
    var setElem = document.createElement('div');
    setElem.innerText = card.getSetName();
    setElem.id = `card-${card.getId()}-set-name`;
    setElem.className = 'set-name';
    var cardInfoElem = document.createElement('div');
    cardInfoElem.className = 'card-box';
    cardInfoElem.id = `card-${card.getId()}-div`;
    cardInfoElem.appendChild(nameElem);
    cardInfoElem.appendChild(setElem);
    cardInfoElem.appendChild(buttonDiv);
    cardInfoElem.appendChild(imageElem);
    cardInfoElem.addEventListener('mousemove', (e) => {
        imageElem.style.left = `${e.pageX}px`;
        imageElem.style.top = `${e.pageY}px`;
        imageElem.style.opacity = 1;
    });
    cardInfoElem.addEventListener('mouseleave', (e) => {
        imageElem.style.opacity = 0;
        imageElem.style.zIndex = -1;
    });
    return cardInfoElem;
}

module.exports = {
    createCardDom,
    createCardInfoDom,
};