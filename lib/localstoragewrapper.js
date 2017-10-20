window.saveData = function (key, data) {
	if(!localStorage.savedData) 
		localStorage.savedData = JSON.stringify({});

	var savedData = JSON.parse(localStorage.savedData)
	var type = typeof data;
	savedData[key] = {
		type: type,
		data: (type === 'object') ? JSON.stringify(data) : data
	};
	localStorage.savedData = JSON.stringify(savedData);
}

window.getData = function (key) {
	var savedData = JSON.parse(localStorage.savedData)
	if(savedData[key] !== undefined) {
		var value = savedData[key];
		if(value.type === 'number') {
			return parseFloat(value.data)
		} else if (value.type === 'string') {
			return value.data;
		} else if (value.type === 'object') {
			return JSON.parse(value.data);
		}
	} else {
		throw (new Error(key + " does not exist in saved data."))
	}
}
