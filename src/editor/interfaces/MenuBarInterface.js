/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var MenuBarInterface = function (wickEditor) {

    this.syncWithEditorState = function () {
        document.getElementById("backToClubhouseButton").style.display = "none";
        document.getElementById("saveToGithubClubhouseButton").style.display = "none";
        document.getElementById("openProjectButton").style.display = "none";
        document.getElementById("exportHTMLButton").style.display = "none";

        if(wickEditor.mode === "normal") {
            document.getElementById("openProjectButton").style.display = "block";
            document.getElementById("exportHTMLButton").style.display = "block";
        } else if (wickEditor.mode === "github-clubhouse") {
            document.getElementById("backToClubhouseButton").style.display = "block";
            document.getElementById("saveToGithubClubhouseButton").style.display = "block";
        }
    }

// Common buttons

    document.getElementById('settingsButton').onclick = function (e) {
        wickEditor.interfaces["settings"].open = true;
        wickEditor.syncInterfaces();
    }

    document.getElementById('openProjectButton').onclick = function (e) {
        $('#importButton').click(); // This just opens the file dialog, file import is handled in InputHandler.js
    }

    document.getElementById('exportHTMLButton').onclick = function (e) {
        WickProjectExporter.exportProject(wickEditor.project);
    }

    document.getElementById('runButton').onclick = function (e) {
        wickEditor.interfaces["builtinplayer"].runProject();
    }

// Github Clubhouse buttons

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
                data: { file:"Test project", name:wickEditor.githubClubhouseProjectName, id:wickEditor.githubClubhouseProjectID },
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