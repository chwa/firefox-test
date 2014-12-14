//var ss = require("sdk/simple-storage");
var windows = require("sdk/windows").browserWindows;
var tabs = require("sdk/tabs");
var panels = require("sdk/panel");
var self = require("sdk/self");
var { ToggleButton } = require("sdk/ui/button/toggle");

var { PageLogger } = require("./logger.js");


// window/tab activate/deactivate events
//
// need to track current tab
// current tab needs a listener for 'pageshow'

//windows.on('deactivate', windowDeactivated);
//windows.on('activate', windowActivated);

//tabs.on('activate', (function() { console.log("tabs activate");}));
//tabs.on('deactivate', (function() { console.log("tabs deactivate");}));
//tabs.on('pageshow', (function() { console.log("tabs pageshow");}));
//tabs.on('load', (function() { console.log("tabs load");}));

tabs.on('activate', function(tab){pageLogger.log(tab.url);});
//tabs.on('load', currentPageChanged);

var pageLogger = new PageLogger("abcdefg");
tabs.on('pageshow', function(tab){pageLogger.log(tab.url);});

function windowDeactivated() {
    console.log(windows.activeWindow.title);
}
function windowActivated() {
    console.log(windows.activeWindow.title);
}

var button = ToggleButton({
    id: "show",
    label: "Show URLs",
    icon: "./icon-32.png",
    onChange: handleChange
});

var panel = panels.Panel({
    contentURL: self.data.url("content.html"),
    contentScriptFile: self.data.url("content.js"),
    onHide: handleHide
});

function ms2string(ms) {
    var date = new Date(ms);

    var d = (date.getUTCDate()-1).toString();
    var h = date.getUTCHours().toString();
    var m = date.getUTCMinutes().toString();
    var s = date.getUTCSeconds().toString();
    h = (h.length<2) ? "0"+h : h;
    m = (m.length<2) ? "0"+m : m;
    s = (s.length<2) ? "0"+s : s;

    return d + "d " + h + "h" + m + "m" + s + "s";
}

function handleChange(state) {
    if (state.checked) {
        panel.show({
            position: button
        });
    }
    console.log(pageLogger.toString());

    tot = pageLogger.getDailyTotals();
    s = "\n";
    for (var i = 0; i < tot.length; i++) {
        var t = new Date(tot[i][1]);
        s += tot[i][0] + "   " + ms2string(t) + "\n";
    }
    console.log(s);
}

function handleHide() {
    button.state('window', {checked: false});
}


