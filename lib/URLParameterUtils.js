var URLParameterUtils = (function () {

	var urlParameterUtils = { };

	urlParameterUtils.getParameterByName = function (name, url) {
	    if (!url) url = window.location.href;
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	//http://stackoverflow.com/questions/1634748/how-can-i-delete-a-query-string-parameter-in-javascript
	urlParameterUtils.clearURLParam = function (parameter) {
	    //prefer to use l.search if you have a location/link object
	    var url = window.location.href;
	    var urlparts= url.split('?');   
	    if (urlparts.length>=2) {

	        var prefix= encodeURIComponent(parameter)+'=';
	        var pars= urlparts[1].split(/[&;]/g);

	        //reverse iteration as may be destructive
	        for (var i= pars.length; i-- > 0;) {    
	            //idiom for string.startsWith
	            if (pars[i].lastIndexOf(prefix, 0) !== -1) {  
	                pars.splice(i, 1);
	            }
	        }

	        url= urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : "");
	        //console.log(url)
	        //window.location.href = url;
	        history.pushState(null, null, url);
	        return url;
	    } else {
	        return url;
	    }
	}

	return urlParameterUtils;

})();