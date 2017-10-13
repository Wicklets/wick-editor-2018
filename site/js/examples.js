var DEMOS_PATH = "../demos/";
var demoElems = [];

function createDemoThumbs (demos) {
    var dummy = document.getElementById('example-grid-element-dummy');
    var container = document.getElementById('examples-grid');

    document.getElementById('player-window-background').onclick = function () {
        document.getElementById('player-window').style.display = 'none';
        document.getElementById('player-container').innerHTML = "";
    }
    
    demos.forEach(function (demo) {
        var demoElem = dummy.cloneNode(true);
        demoElem.demoData = demo;
        var children = demoElem.getElementsByTagName('div');
        for(var i = 0; i < children.length; i++) {
            demoElem[children[i].className] = children[i];
        }
        demoElem['example-grid-element-thumbnail'].style.backgroundImage = "url(" + DEMOS_PATH+demo.thumbPath + ")"
        demoElem['example-grid-element-thumbnail'].onclick = function () {
            document.getElementById('player-window').style.display = 'block';
            loadDemo(demo);
        }
        demoElem['example-grid-element-title'].innerHTML = '<a href="dasd.com">'+demo.name+'</a>';
        if(demo.tutorialPath) {

        } else {
            demoElem['example-grid-element-tutorial-link'].style.display = 'none';
        }
        demoElem['example-grid-element-open-in-editor-link'].onclick = function () {
            var url = "../../editor.html?demo=" + demo.projectPath;
            window.open(url)
        }
        demoElems.push(demoElem);
        container.appendChild(demoElem);
    });

    dummy.parentNode.removeChild(dummy);
}

function showProjectsWithTag(tag) {
    demoElems.forEach(function (demoElem) {
        var hasTag = demoElem.demoData.tags.indexOf(tag) !== -1;
        if(tag === 'all') hasTag = true;
        demoElem.style.display = hasTag ? 'block' : 'none';
    });

    var tagElems = document.getElementsByClassName("tags-menubar")[0].children;
    for(var i = 0; i < tagElems.length; i++) {
        tagElems[i].children[0].className = 'tags-menubar-tag-title';
    }
    document.getElementById('tag-'+tag).className = 'tags-menubar-tag-title tags-menubar-tag-title-selected';
}

function loadDemo (demo) {
    var playerContainer = document.getElementById('player-container');
    $.ajax({
        url: DEMOS_PATH+demo.projectPath,
        type: 'GET',
        data: {},
        success: function(data) {
            playerContainer.innerHTML = "";
            var iframe = document.createElement('iframe');
            iframe.className = 'player';
            iframe.onload = function () {
                iframe.contentWindow.runProject(JSON.stringify(data));
            }
            iframe.src = "../../player.html";
            playerContainer.appendChild(iframe);
        },
        error: function () {
            console.log("ajax: error")
        },
        complete: function(response, textStatus) {

        }
    });
}

$(document).ready(function() {
    $.ajax({
        url: DEMOS_PATH+"demos.json",
        type: 'GET',
        data: {},
        success: function(data) {
            createDemoThumbs(data.demos);
        },
        error: function (e) {
            console.log("ajax: error");
            console.log(e);
        },
        complete: function(response, textStatus) {
            console.log('aja: complete');
            console.log(response)
            console.log(textStatus)
        }
    });
});
