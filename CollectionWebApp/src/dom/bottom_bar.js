let bottomBinder = 0;
let bottomBinderName = '';
let bottomBinderCount = 0;
let bottomBinderIsDeck = false;

function getCurrentBottomBinder() {
    if (bottomBinder === 0) {
        return null;
    }
    return bottomBinder;
}

function getBottomBinderName() {
    if (bottomBinder === 0) {
        return null;
    }
    return bottomBinderName;
}

function getBottomBinderCount() {
    if (bottomBinder === 0) {
        return null;
    }
    return bottomBinderCount;
}

function getIsBottomBinderADeck() {
    if (bottomBinder === 0) {
        return null;
    }
    return bottomBinderIsDeck;
}

function increaseBottomBinderCountBy(count = 1) {
    return bottomBinderCount += count;
}

function popBottomBar(binder, name, count, isDeck) {
    bottomBinder = binder;
    bottomBinderName = name;
    bottomBinderCount = count;
    bottomBinderIsDeck = isDeck;
    document.getElementById("binder-droparea").style.height = "100px";
    document.getElementById("binder-droparea").style.top = "calc(100% - 100px)";
    document.getElementById("main-panel").style.marginBottom = "100px";
    if (isDeck) {
        document.getElementById("binder-droparea").className = 'main-panel-bottombar deck-type';
    } else {
        document.getElementById("binder-droparea").className = 'main-panel-bottombar';
    }
}

function collapseBottomBar() {
    bottomBinder = 0;
    bottomBinderName = '';
    bottomBinderCount = 0;
    document.getElementById("binder-droparea").style.height = "0";
    document.getElementById("binder-droparea").style.top = "100%";
    document.getElementById("main-panel").style.marginBottom = "0";
}

module.exports = {
    getCurrentBottomBinder,
    getBottomBinderName,
    getBottomBinderCount,
    getIsBottomBinderADeck,
    increaseBottomBinderCountBy,
    popBottomBar,
    collapseBottomBar,
}