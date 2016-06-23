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
		localStorage.setItem('wickProject', projectJSON);
	}
}

WickLocalStorageHandler.prototype.getJSONProjectInLocalStorage = function () {
	if(this.localStorageAvailable) {
		return localStorage.getItem('wickProject');
	}
}

WickLocalStorageHandler.prototype.deleteJSONProjectInLocalStorage = function () {
	if(this.localStorageAvailable) {
		return localStorage.removeItem('wickProject');
	}
}