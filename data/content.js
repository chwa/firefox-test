
var ul = document.getElementById("mylist")

self.port.on("updateList", updateHandler)


function updateHandler(list) {
    var content = "";
    list.forEach( function (item) { 
        content += "<li>" + item + "</li>\n";
    });
    ul.innerHTML = content;

}
