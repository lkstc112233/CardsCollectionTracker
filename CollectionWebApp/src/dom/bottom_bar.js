let bottomBinder = 0;

function getCurrentBottomBinder() {
    if (bottomBinder === 0) {
        return null;
    }
    return bottomBinder;
}

function popBottomBar(binder) {
    bottomBinder = binder;
    document.getElementById("binder-droparea").style.height = "100px";
    document.getElementById("binder-droparea").style.top = "calc(100% - 100px)";
    document.getElementById("main-panel").style.marginBottom = "100px";
}

function collapseBottomBar() {
    bottomBinder = 0;
    document.getElementById("binder-droparea").style.height = "0";
    document.getElementById("binder-droparea").style.top = "100%";
    document.getElementById("main-panel").style.marginBottom = "0";
}

module.exports = {
    getCurrentBottomBinder,
    popBottomBar,
    collapseBottomBar,
}