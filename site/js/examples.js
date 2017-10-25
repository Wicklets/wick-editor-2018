/*
var demos;
var DEMOS_PATH = "../demos/"; 
var currentDemo;

var thumbnailsContainer;
var playerContainer;
var openInEditorButton;

// Helper function for creating elements
function newElem(tag, className, style, innerHTML, parentElem) {
    var elem = document.createElement(tag);
    if(className) elem.className = className;
    if(style) elem.style = style;
    if(innerHTML) elem.innerHTML = innerHTML;
    if(parentElem)
        parentElem.appendChild(elem);
    else
        document.body.appendChild(elem);
    return elem;
}

function loadDemo (demo) {
    currentDemo = demo.path;
    $.ajax({
        url: DEMOS_PATH+demo.path+".json",
        type: 'GET',
        data: {},
        success: function(data) {
            //<iframe class="player" id="wickPlayerIFrame" src="../../player.html"></iframe>
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

// Create page for everything
function buildPage (demos) {

    loadDemo({path:'KitchenSink'});

    //var playerWindow = document.getElementById("wickPlayerIFrame").contentWindow;
    thumbnailsContainer = document.getElementsByClassName('thumbnails-container')[0];
    playerContainer = document.getElementsByClassName('player-container')[0];
    openInEditorButton = document.getElementById('open-in-editor-button');

    openInEditorButton.onclick = function () {
        var url = "../../editor.html?demo=" + currentDemo + ".json";
        window.open(url,'_parent');
    }

    var titleColors = ['#D1F2A5','#FF9F80','#EFFAB4','#F56991','#FFC48C'];
    var titleColori = 0;

	demos.forEach(function (demo) {

        var thumb = document.createElement('div');
        thumb.className = 'thumbnail';
        thumb.style.backgroundImage = "url(" + DEMOS_PATH + demo.path + ".png)";
        //thumb.style.backgroundImage = "url(" + DEMOS_PATH + "placeholder.png)";
        thumb.onclick = function () {
            openInEditorButton.style.display = 'block';
            loadDemo(demo);
        }

        var thumbTitle = document.createElement('div');
        thumbTitle.className = 'thumb-title';
        thumbTitle.innerHTML = demo.name;
        thumbTitle.style.backgroundColor = titleColors[titleColori];
        titleColori ++;
        if(titleColori >= titleColors.length) titleColori = 0;
        thumb.appendChild(thumbTitle);

        thumbnailsContainer.appendChild(thumb);
	});

}

function recenterThumbnails () {
    //$('.thumbnails-container').css('width', '100%')
    var offset = (parseInt($('.thumbnails-container').width()) % 165) / 2;
    //$('.thumbnails-container').css('margin-left', offset + 'px')
    //$('.thumbnails-container').css('width', 'calc(720px - ' + offset + 'px)')
}

// Load the json file with all the demos info
$(document).ready(function() {
    $.ajax({
        url: DEMOS_PATH+"demos.json",
        type: 'GET',
        data: {},
        success: function(data) {
        	buildPage(data.demos);
            recenterThumbnails();
        },
        error: function () {
            console.log("ajax: error")
        },
        complete: function(response, textStatus) {

        }
    });

    window.onresize = recenterThumbnails;
});
*/

function createDemoThumbs (demos) {
    var dummy = document.getElementById('example-grid-element-dummy');
    var container = document.getElementById('examples-grid');

    document.getElementById('player-window-background').onclick = function () {
        document.getElementById('player-window').style.display = 'none';
        document.getElementById('player-container').innerHTML = "";
    }
    
    demos.forEach(function (demo) {
        var demoElem = dummy.cloneNode(true);
        var children = demoElem.getElementsByTagName('div');
        for(var i = 0; i < children.length; i++) {
            demoElem[children[i].className] = children[i];
        }
        demoElem['example-grid-element-thumbnail'].style.backgroundImage = "url(" + DEMOS_PATH+demo.thumbPath + ")"
        demoElem['example-grid-element-thumbnail'].onclick = function () {
            document.getElementById('player-window').style.display = 'block';
            loadDemo(demo);
        }
        demoElem['example-grid-element-title'].onclick = function () {
            document.getElementById('player-window').style.display = 'block';
            loadDemo(demo);
        }
        demoElem['example-grid-element-title'].innerHTML = demo.name;
        if(demo.tutorialPath) {

        } else {
            demoElem['example-grid-element-tutorial-link'].style.display = 'none';
        }
        demoElem['example-grid-element-open-in-editor-link'].onclick = function () {
            var url = "../../editor.html?demo=" + demo.projectPath;
            window.open(url,'_parent');
        }
        container.appendChild(demoElem);
    });

    dummy.parentNode.removeChild(dummy);
}

var DEMOS_PATH = "../demos/";

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
