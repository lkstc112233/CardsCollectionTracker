const grpc = require('../grpc');
const { getSelectedBinder, getSelectedBinderName, increaseSelectedBinderCountBy } = require('./selected_binder');

function isRentedOut(binderListing, binderOfCard) {
    if (binderListing === 0) {
        return false;
    }
    return binderListing !== binderOfCard;
}

function createCardDom(card, binder = 0) {
    var imageElem = document.createElement('img');
    imageElem.loading = 'lazy';
    imageElem.id = `card-${card.getId()}-image`;
    imageElem.className = 'card-img';
    var nameElem = document.createElement('div');
    nameElem.innerText = card.getCardInfo().getPrintedName();
    if (nameElem.innerText === '') {
        nameElem.innerText = card.getCardInfo().getName();
    }
    var versionName = card.getVersion();
    if (versionName !== '' && versionName !== 'nonfoil') {
        nameElem.innerText += ` (${versionName})`;
    }
    nameElem.id = `card-${card.getId()}-name`;
    nameElem.className = 'card-name';
    var setElem = document.createElement('div');
    setElem.innerText = card.getCardInfo().getSetName();
    setElem.id = `card-${card.getId()}-set-name`;
    setElem.className = 'set-name';
    var collectorsId = card.getCardInfo().getCollectorsId();
    if (collectorsId !== '') {
        setElem.innerText += ` (${collectorsId})`;
    }
    var cardInfoElem = document.createElement('div');
    cardInfoElem.className = `card-box${isRentedOut(binder, card.getBinderId())?' rented-out':''}`;
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
        imageElem.src = card.getCardInfo().getImageUri();
        imageElem.style.opacity = 1;
    });
    cardInfoElem.addEventListener('mouseleave', (e) => {
        imageElem.style.opacity = 0;
        imageElem.style.zIndex = -1;
    });
    return cardInfoElem;
}

function createWishCardDom(wishCard) {
    var nameElem = document.createElement('div');
    nameElem.innerText = wishCard.getWishedCard().getCardInfo().getName();
    nameElem.id = `card-${wishCard.getWishedCard().getCardInfo().getName()}-name`;
    nameElem.className = 'card-name';
    var countElem = document.createElement('div');
    countElem.innerText = wishCard.getCount();
    countElem.id = `card-${wishCard.getWishedCard().getCardInfo().getName()}-set-name`;
    countElem.className = 'wish-count';
    var cardInfoElem = document.createElement('div');
    var typeClass = '';
    switch (wishCard.getStatus()) {
        case 1:
            typeClass = ' wish-not-exist';
            break;
        case 2:
            typeClass = ' wish-not-enough';
            break;
        case 3:
            typeClass = ' wish-enough';
            break;
        default:
            break;
    }
    cardInfoElem.className = `card-box${typeClass}`;
    cardInfoElem.id = `card-${wishCard.getWishedCard().getCardInfo().getName()}-div`;
    cardInfoElem.appendChild(nameElem);
    cardInfoElem.appendChild(countElem);
    return cardInfoElem;
}

function createButtonRowDom(card, version) {
    var buttonElem = document.createElement('button');
    buttonElem.className = 'circle-button plus';
    buttonElem.onclick = async function() {
        await grpc.addCardToCollection(card.getId(), version, getSelectedBinder());
        var sidebarButton = document.getElementsByClassName('menu-button selected-menu-item');
        if (sidebarButton.length === 1) {
            sidebarButton[0].innerHTML = `&gt;<span class="menu-text">${getSelectedBinderName()} (${increaseSelectedBinderCountBy(1)})</span>`;
        }
    }
    buttonElem.addEventListener('keydown', (e) => {
        if (e.code == 'Escape') {
            var input = document.getElementById('search-add-box-input');
            input.focus();
            input.select();
        }
    });
    var buttonRowText = document.createElement('span');
    buttonRowText.innerText = version? version: 'nonfoil';
    var buttonRowDiv = document.createElement('div');
    buttonRowDiv.className = 'add-card-button';
    buttonRowDiv.appendChild(buttonRowText);
    buttonRowDiv.appendChild(buttonElem);
    return buttonRowDiv;
}

function createWishButtonRowDom(name) {
    var buttonElem = document.createElement('button');
    buttonElem.className = 'circle-button plus';
    buttonElem.onclick = async function() {
        let countInput = prompt(`Type in the count of card "${name}" to update to wishlist.`, '1');
        if (countInput === null) {
            return;
        }
        let count = parseInt(countInput);
        if (count === NaN) {
            return;
        }
        await grpc.addToWishlist(name, count);
    }
    buttonElem.addEventListener('keydown', (e) => {
        if (e.code == 'Escape') {
            var input = document.getElementById('search-add-box-input');
            input.focus();
            input.select();
        }
    });
    var buttonRowText = document.createElement('span');
    buttonRowText.innerText = 'Add to Wishlist';
    var buttonRowDiv = document.createElement('div');
    buttonRowDiv.className = 'add-card-button';
    buttonRowDiv.appendChild(buttonRowText);
    buttonRowDiv.appendChild(buttonElem);
    return buttonRowDiv;
}

function createCardInfoDom(card) {
    var imageElem = document.createElement('img');
    imageElem.loading = 'lazy';
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
    nameElem.innerText = card.getPrintedName();
    if (nameElem.innerText === '') {
        nameElem.innerText = card.getName();
    }
    nameElem.id = `card-${card.getId()}-name`;
    nameElem.className = 'card-name';
    var setElem = document.createElement('div');
    setElem.innerText = card.getSetName();
    setElem.id = `card-${card.getId()}-set-name`;
    setElem.className = 'set-name';
    var collectorsId = card.getCollectorsId();
    if (collectorsId !== '') {
        setElem.innerText += ` (${collectorsId})`;
    }
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
        imageElem.src = card.getImageUri();
        imageElem.style.opacity = 1;
    });
    cardInfoElem.addEventListener('mouseleave', (e) => {
        imageElem.style.opacity = 0;
        imageElem.style.zIndex = -1;
    });
    return cardInfoElem;
}

function createWishCardInfoDom(name) {
    var buttonDiv = document.createElement('div');
    buttonDiv.className = 'add-card-button-div';
    buttonDiv.appendChild(createWishButtonRowDom(name));
    var nameElem = document.createElement('div');
    nameElem.innerText = name;
    nameElem.id = `card-${name}-name`;
    nameElem.className = 'card-name';
    var cardInfoElem = document.createElement('div');
    cardInfoElem.className = 'card-box';
    cardInfoElem.id = `card-${name}-div`;
    cardInfoElem.appendChild(nameElem);
    cardInfoElem.appendChild(buttonDiv);
    return cardInfoElem;
}

module.exports = {
    createCardDom,
    createWishCardDom,
    createCardInfoDom,
    createWishCardInfoDom,
};