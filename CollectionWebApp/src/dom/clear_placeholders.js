function clearAllPlaceholders() {
    document.getElementById('cards-collection').innerHTML = '';
    document.getElementById('search-add-box').innerHTML = '';
    document.getElementById('search-add-list').innerHTML = '';
}

module.exports = {
    clearAllPlaceholders,
}