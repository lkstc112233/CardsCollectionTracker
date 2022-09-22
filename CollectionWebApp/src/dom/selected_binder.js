let selectedBinder = 0;
let selectedBinderName = '';
let selectedBinderCount = 0;

function getSelectedBinder() {
    return selectedBinder;
}

function getSelectedBinderName() {
    return selectedBinderName;
}

function getSelectedBinderCount() {
    return selectedBinderCount;
}

function setSelectedBinder(id) {
    selectedBinder = id;
}

function setSelectedBinderName(name) {
    selectedBinderName = name;
}

function setSelectedBinderCount(count) {
    selectedBinderCount = count;
}

function increaseSelectedBinderCountBy(count = 1) {
    return selectedBinderCount += count;
}

module.exports = {
    getSelectedBinder,
    getSelectedBinderName,
    getSelectedBinderCount,
    setSelectedBinder,
    setSelectedBinderName,
    setSelectedBinderCount,
    increaseSelectedBinderCountBy,
}