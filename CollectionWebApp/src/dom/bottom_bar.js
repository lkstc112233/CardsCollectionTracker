let bottomBinder = 0;
let bottomBinderName = '';
let bottomBinderCount = 0;

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

function increaseBottomBinderCountBy(count = 1) {
    return bottomBinderCount += count;
}

function popBottomBar(binder, name, count) {
    bottomBinder = binder;
    bottomBinderName = name;
    bottomBinderCount = count;
    document.getElementById("binder-droparea").style.height = "100px";
    document.getElementById("binder-droparea").style.top = "calc(100% - 100px)";
    document.getElementById("main-panel").style.marginBottom = "100px";
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
    increaseBottomBinderCountBy,
    popBottomBar,
    collapseBottomBar,
}