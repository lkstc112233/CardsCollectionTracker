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
            var holderDom = document.createElement('div');
            holderDom.appendChild(titleDom);
            holderDom.appendChild(deckDom);
            return holderDom;
        }
    ));
}

document.getElementById('fetch').addEventListener('click', updatePlugin);
