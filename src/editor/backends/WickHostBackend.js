/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickHostBackend = function (wickEditor) {

    var projectName = URLParameterUtils.getParameterByName("project");

    if (!projectName) {
        return;
    }

    this.active = true;

    document.getElementById("menuBarButtons").innerHTML = '<div class="button buttonInRow tooltipElem" id="saveToWickHostButton" alt="Save Project"><img src="resources/save.png" width="25" /></div>' + document.getElementById("menuBarButtons").innerHTML;
    document.getElementById("menuBarButtons").innerHTML = '<div class="button buttonInRow tooltipElem" id="backToMyProjectsButton" alt="Back to My Projects"><img src="resources/back.png" width="25" /></div>' + document.getElementById("menuBarButtons").innerHTML;

    var parent = document.getElementById("menuBarButtons");
    var child1 = document.getElementById("openProjectButton");
    var child2 = document.getElementById("exportHTMLButton");
    parent.removeChild(child1);
    parent.removeChild(child2);

    console.log("Trying to load project from WickHost:");
    console.log("projectName: " + projectName);

    $.ajax({
        url: "/project/" + projectName,
        type: 'GET',
        data: {},
        success: function(data) {
            console.log("ajax: success");
            if(data === "NEW_PROJECT") {
                wickEditor.project = new WickProject();
            } else {
                wickEditor.project = WickProject.fromWebpage(data);
            }
            wickEditor.syncInterfaces();
        },
        error: function () {
            console.log("ajax: error")
            console.log("loading project from localstorage instead of backend.")
            wickEditor.project = WickProject.fromLocalStorage();
            wickEditor.syncInterfaces();
        },
        complete: function(response, textStatus) {
            console.log("ajax: complete")
            console.log(response)
            console.log(textStatus)
        }
    });

    document.getElementById('backToMyProjectsButton').onclick = function (e) {
        window.location.href = "/myprojects";
    }

    $(document).on('click','#saveToWickHostButton',function(e){
        e.stopPropagation();
        e.preventDefault();
        wickEditor.interfaces.statusbar.setState('uploading');
        WickProjectExporter.bundleProjectToHTML(wickEditor.project, function(fileOut) {
            $.ajax({
                url: '/updateproject',
                type: 'POST',
                data: { 
                    projectData: fileOut, 
                    projectName : projectName
                },

                success: function(data) {
                    console.log("ajax: success:");
                    console.log(data);
                    wickEditor.interfaces.statusbar.setState('done');
                },
                error: function () {
                    console.log("ajax: error")
                    wickEditor.interfaces.statusbar.setState('error');
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