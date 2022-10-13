let selectedBinder = 0;
let selectedBinderName = '';
let selectedBinderCount = 0;
let selectedWishlist = false;

function getSelectedBinder() {
    return selectedBinder;
}

function getSelectedBinderName() {
    return selectedBinderName;
}

function getSelectedBinderCount() {
    return selectedBinderCount;
}

function isWishlistSelected() {
    return selectedWishlist;
}

function setSelectedBinder(id) {
    selectedBinder = id;
    selectedWishlist = false;
}

function setSelectedBinderName(name) {
    selectedBinderName = name;
}

function setSelectedBinderCount(count) {
    selectedBinderCount = count;
}

function selectWishlist() {
    selectedBinder = 0;
    selectedBinderName = '';
    selectedBinderCount = 0;
    selectedWishlist = true;
}

function increaseSelectedBinderCountBy(count = 1) {
    if (selectedWishlist) {
        return -1;
    }
    return selectedBinderCount += count;
}

module.exports = {
    getSelectedBinder,
    getSelectedBinderName,
    getSelectedBinderCount,
    isWishlistSelected,
    setSelectedBinder,
    setSelectedBinderName,
    setSelectedBinderCount,
    selectWishlist,
    increaseSelectedBinderCountBy,
}