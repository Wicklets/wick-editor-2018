/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickDemoLoader = function (wickEditor) {

    var demoName = URLParameterUtils.getParameterByName("demo");

    if (!demoName) {
        return;
    }

    this.active = true;

    console.log("Trying to load demo:");
    console.log("demoName: " + demoName);

    $.ajax({
        url: "../demos/" + demoName,
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

}