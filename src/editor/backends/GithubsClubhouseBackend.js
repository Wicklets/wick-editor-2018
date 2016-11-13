/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var GithubsClubhouseBackend = function () {

    // Check to see if we need to load a project from GitHub's Clubhouse
    var githubClubhouseProjectID = URLParameterUtils.getParameterByName("id");
    var githubClubhouseProjectName = URLParameterUtils.getParameterByName("project");

    if (!githubClubhouseProjectID) {
        return;
    }   

    document.getElementById("menuBarButtons").innerHTML += '<div class="button buttonInRow tooltipElem" id="backToClubhouseButton" alt="Back to Clubhouse"><img src="resources/back.png" width="30" /></div>'
    document.getElementById("menuBarButtons").innerHTML += '<div class="button buttonInRow tooltipElem" id="saveToGithubClubhouseButton" alt="Save Project"><img src="resources/save.png" width="30" /></div>'

    var parent = document.getElementById("menuBarButtons");
    var child1 = document.getElementById("openProjectButton");
    var child2 = document.getElementById("exportHTMLButton");
    parent.removeChild(child1);
    parent.removeChild(child2);

    console.log("Trying to load project from Github's Clubhouse");
    console.log("githubClubhouseProjectID: " + githubClubhouseProjectID);
    this.mode = "github-clubhouse";

    // Load project from github clubhouse server
    $.ajax({
        url: "/projects/1",
        type: 'GET',
        success: function(data) {
            console.log("ajax: success");
            var base64WickProject = data.split('<div id="wick_project">')[1].split('</div>')[0];
            var decodedProject = atob(base64WickProject);
            that.project = WickProject.fromWebpage(decodedProject);
            that.syncInterfaces();
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
                url: '/projects/1',
                type: 'PUT',
                data: { 
                    file:fileOut, 
                    name: githubClubhouseProjectName, 
                    id: githubClubhouseProjectID 
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