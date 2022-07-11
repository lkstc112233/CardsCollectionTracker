let selectedBinder = 1;
let selectedBinderName = '';

function getSelectedBinder() {
    return selectedBinder;
}

function getSelectedBinderName() {
    return selectedBinderName;
}

function setSelectedBinder(binder) {
    selectedBinder = binder;
}

function setSelectedBinderName(binder) {
    selectedBinderName = binder;
}

module.exports = {
    getSelectedBinder,
    getSelectedBinderName,
    setSelectedBinder,
    setSelectedBinderName,
}