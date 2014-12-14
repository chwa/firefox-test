var ss = require("sdk/simple-storage");
var urls = require("sdk/url");

function PageLogger(name) {
    PageLogger.names = PageLogger.names || [];
    if (name in PageLogger.names) {
        throw "PageLogger: name '" + name + "' exists.";
    }

    if (ss.storage.pagelogger === undefined) {
        ss.storage.pagelogger = {};
    }
    if (ss.storage.pagelogger[name] === undefined) {
        ss.storage.pagelogger[name] = {};
    }
    this.urldata = ss.storage.pagelogger[name];

    // add an entry for today (if it doesn't exist yet)
    this.newDay(new Date());
    this.currentUrl = "";

    PageLogger.names.push(name);
};

PageLogger.prototype.newDay = function(day) {
    this.currentDate = day.toDateString();
    if (!(this.currentDate in this.urldata)) {
        this.urldata[this.currentDate] = [];
    }
};

PageLogger.prototype.startEntry = function(hostname, time) {
    this.urldata[this.currentDate].push({
        hostname : hostname,
        tBegin : time.toJSON(),
        tEnd : null
    });
};
PageLogger.prototype.endEntry = function(time) {
    var l = this.urldata[this.currentDate];
    l[l.length-1].tEnd = time.toJSON();
};

PageLogger.prototype.log = function(urlString) {
    var url = urls.URL(urlString);
    var newUrl = url.hostname || "";
    console.log("LOGGING " + newUrl)

    if (newUrl === this.currentUrl) {
        console.log("Warning: logging the same url again: " + newUrl);
        return;
    }

    var now = new Date();
    var today = new Date(now.getTime());
    today.setHours(0,0,0,0);

    if (this.currentUrl !== "") {// if we are currently logging a site
        // 00h on the day on which the currently active site was started:
        var lastDay = new Date(this.currentDate);
        //var lastDay = this.pageList[this.urldata.length-1].date;
        // if necessary, complete entry for lastDay (and any Days in between lastDay and today)
        while(lastDay < today) {
            lastDay.setDate(lastDay.getDate()+1); // this should work even past the end of month...

            // TODO: make sure this works:
            // tEnd of an entry that gets cut at midnight is actually 00h on the NEXT day!!!
            this.endEntry(lastDay);
            this.newDay(lastDay);
            this.startEntry(this.currentUrl, lastDay);
        }
        this.endEntry(now);
    }

    if (newUrl !== "") {// TODO could check something like: if !(url.hostname in whitelist)
        this.startEntry(newUrl, now);
    }
    this.currentUrl = newUrl;

};

PageLogger.prototype.toString = function() {
    var str = "";
    //for (var i = 0; i < this.urldata.length; i++) {
    var i = 1;
    for (var key in this.urldata) {
        str += "Entry #" + i++ + "  Date: " + key + "\n"; 
        var l = this.urldata[key];
        for (var j = 0; j < l.length; j++) {
            var beginTS = (new Date(l[j].tBegin)).toTimeString(); 
            var endTS = (l[j].tEnd) ? (new Date(l[j].tEnd)).toTimeString() : "(now)";
            str += "    Entry #" + j + ": " + l[j].hostname + " from " + beginTS + " to " + endTS + "\n";
        }
    }
    return str;
};

// return sorted list of pairs [hostname, time (ms)]
PageLogger.prototype.getDailyTotals = function(day) {
    day = day || new Date();
    var pageTotals = {};
    var sum = 0;
    var dateString = day.toDateString();
    if (dateString in this.urldata) {
        console.log("success");
        for (var i = 0; i < this.urldata[dateString].length; i++) {
            entry = this.urldata[dateString][i];
            var begin = (new Date(entry.tBegin)).getTime();
            var end = entry.tEnd ? (new Date(entry.tEnd)).getTime() : begin;
            var duration = end - begin;
            sum += duration;

            if (entry.hostname in pageTotals) {
                pageTotals[entry.hostname] += duration;
            } else {
                pageTotals[entry.hostname] = duration;
            }
        }
    }

    var result = [['total', sum]];
    for (var page in pageTotals) {
        result.push([page, pageTotals[page]])
    }

    result.sort(function(a,b){ return (b[1] - a[1]); });
    console.log(result);

    return result;
};

exports.PageLogger = PageLogger;

