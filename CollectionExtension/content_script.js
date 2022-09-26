function getTitle(elem) {
    for (var i = 0; i < elem.childNodes.length; ++i) {
        if (elem.childNodes[i].nodeType === Node.TEXT_NODE) {
            return elem.childNodes[i].textContent.trim();
        }
    }
}

function fetchDecks(deckDoms) {
    return Array.from(deckDoms).map(
        node => {
            nameNode = node.querySelector('h1.title');
            var name = nameNode === null? 'Untitled': getTitle(nameNode);
            activeCardsNode = node.querySelector('.tab-content>.active');
            cardsTable = activeCardsNode.querySelector('table.deck-view-deck-table');
            var cardsMap = Array.from(cardsTable.rows)
                .filter(row => row.className !== 'deck-category-header')
                .map(
                    row => {
                        return {
                            'count': parseInt(row.children[0].textContent),
                            'name': row.children[1].querySelector('a').textContent.trim(),
                        }
                    })
                .reduce((m, c) => {
                    if (m.has(c.name)) {
                        m.set(c.name, m.get(c.name) + c.count);
                    } else {
                        m.set(c.name, c.count);
                    }
                    return m;
                }, new Map());
            return {
                'name': name,
                'cards': Array.from(cardsMap.entries(), ([key, value]) => { return {
                    'count': value,
                    'name': key,
                };}).sort((a, b) => a.name > b.name ? 1: a.name < b.name? -1 : 0),
            }
        }
    );
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.command === 'fetchDecks') {
        sendResponse(fetchDecks(document.querySelectorAll('.deck-main-contents')));
      }
    }
);
