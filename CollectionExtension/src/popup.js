const grpc = require('./grpc');

async function fetchData() {
    return new Promise(acc => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {command: "fetchDecks"}, (response) => {
                acc(response);
            });
        });
    });
}

function getCountSpanStyle(collectionCount, requiredCount) {
    if (collectionCount === 0) {
        return 'background-color: #fadbd8; color: #78281f';
    }
    if (collectionCount < requiredCount) {
        return 'background-color: #fdebd0; color: #7e5109';
    }
    return '';
}

async function updatePlugin() {
    data = await fetchData();
    document.getElementById('decks').replaceChildren(...data.map(
        deck => {
            var titleDom = document.createElement('h3');
            titleDom.innerText = deck.name;
            var deckDom = document.createElement('div');
            deckDom.className = 'deck-list';
            deckDom.replaceChildren(...deck.cards.map(
                c => {
                    var cardDom = document.createElement('div');
                    cardDom.appendChild(document.createTextNode(c.count + ' ' + c.name));
                    return cardDom;
                }
            ));
            var showdiffButton = document.createElement('button');
            showdiffButton.innerHTML = 'Compare diff';
            showdiffButton.onclick = async function() {
                cards = (await grpc.listAllBinderCards()).getCardsNamesMap();
                deckDom.replaceChildren(...deck.cards.map(
                    c => {
                        var count = 0;
                        if (cards.has(c.name)) {
                            count = Math.min(cards.get(c.name), c.count);
                        }
                        var cardEntityDom = document.createElement('div');
                        var cardCountSpan = document.createElement('span');
                        cardCountSpan.style = getCountSpanStyle(count, c.count);
                        cardCountSpan.innerText = `(${count} / ${c.count})`;
                        cardEntityDom.appendChild(cardCountSpan);
                        cardEntityDom.appendChild(document.createTextNode(` ${c.name}`));
                        return cardEntityDom;
                    }
                ));
            }
            var holderDom = document.createElement('div');
            holderDom.appendChild(titleDom);
            holderDom.appendChild(deckDom);
            holderDom.appendChild(showdiffButton);
            return holderDom;
        }
    ));
}

document.getElementById('fetch').addEventListener('click', updatePlugin);
