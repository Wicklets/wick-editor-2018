var WickLocalStorageHandler = function (wickEditor) {

	this.localStorageAvailable = this.checkBrowserLocalStorageCompatibility();

}

WickLocalStorageHandler.prototype.checkBrowserLocalStorageCompatibility = function () {
	if ('localStorage' in window && window['localStorage'] !== null) {
		return true;
	} else {
		VerboseLog.error("LocalStorage not available in this browser.")
		alert("Warning: LocalStorage not available in this browser! Your projects will not autosave - be careful!")
		return false;
	}
}

WickLocalStorageHandler.prototype.saveJSONProjectInLocalStorage = function (projectJSON) {
	if(this.localStorageAvailable) {
		try {
			VerboseLog.log("Saving project to local storage...");
			localStorage.setItem('wickProject', projectJSON);
		} catch (err) {
			VerboseLog.error("LocalStorage could not save project, threw error:");
			VerboseLog.log(err);
		}
	}
}

WickLocalStorageHandler.prototype.getJSONProjectInLocalStorage = function () {
	if(this.localStorageAvailable) {
		VerboseLog.log("Loading project from local storage...");
		return localStorage.getItem('wickProject');
	}
}

WickLocalStorageHandler.prototype.deleteJSONProjectInLocalStorage = function () {
	if(this.localStorageAvailable) {
		VerboseLog.log("Deleting project in local storage...");
		return localStorage.removeItem('wickProject');
	}
}