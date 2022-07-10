const { loadBinderDom, loadSearchAddListDom } = require('./dom/load_card_list');
const { createSearchCardElements } = require('./dom/search_card');
const { loadBinderSidebar } = require('./dom/side_bar');

loadBinderSidebar();
createSearchCardElements();
