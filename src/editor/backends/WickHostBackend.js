/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickHostBackend = function () {

    var projectID = URLParameterUtils.getParameterByName("project");

    if (!projectID) {
        return;
    }

    document.getElementById("menuBarButtons").innerHTML = '<div class="button buttonInRow tooltipElem" id="backToClubhouseButton" alt="Back to Clubhouse"><img src="resources/github.png" width="25" /></div>' + document.getElementById("menuBarButtons").innerHTML;
    document.getElementById("menuBarButtons").innerHTML = '<div class="button buttonInRow tooltipElem" id="saveToGithubClubhouseButton" alt="Save Project"><img src="resources/save.png" width="25" /></div>' + document.getElementById("menuBarButtons").innerHTML;

    var parent = document.getElementById("menuBarButtons");
    var child1 = document.getElementById("openProjectButton");
    var child2 = document.getElementById("exportHTMLButton");
    parent.removeChild(child1);
    parent.removeChild(child2);

    console.log("Trying to load project from WickHost:");
    console.log("projectID: " + projectID);

    // Load project from github clubhouse server
    $.ajax({
        url: "/project/" + projectID,
        type: 'GET',
        data: { 
            projectID : projectID
        },
        success: function(data) {
            console.log("ajax: success");
            wickEditor.project = WickProject.fromWebpage(data);
            wickEditor.syncInterfaces();
        },
        error: function () {
            console.log("ajax: error")
        },
        complete: function(response, textStatus) {
            console.log("ajax: complete")
            console.log(response)
            console.log(textStatus)
        }
    });

    document.getElementById('backToClubhouseButton').onclick = function (e) {
        window.location.href = "/projects";
    }

    // var btn = document.createElement("button"); btn.id = "saveToGithubClubhouseButton"; document.body.appendChild(btn); 
    $(document).on('click','#saveToGithubClubhouseButton',function(e){
        e.stopPropagation();
        e.preventDefault();
        WickProjectExporter.bundleProjectToHTML(wickEditor.project, function(fileOut) {
            $.ajax({
                url: '/home',
                type: 'POST',
                data: { 
                    projectData: fileOut, 
                    projectID : projectID
                },

                success: function(data) {
                    console.log("ajax: success:");
                    console.log(data);
                },
                error: function () {
                    console.log("ajax: error")
                },
                complete: function(response, textStatus) {
                    console.log("ajax: complete:")
                    console.log(response)
                    console.log(textStatus)
                }
            });
        });
        return false;
    });

}