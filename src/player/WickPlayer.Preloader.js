/* Wick - (c) 2017 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*  This file is part of Wick. 
    
    Wick is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Wick is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Wick.  If not, see <http://www.gnu.org/licenses/>. */

window.percentComplete = 0;

var WickPreloader = function (wickEditor) {

	//http://stackoverflow.com/questions/2592092/executing-script-elements-inserted-with-innerhtml
	var exec_body_scripts = function(body_el) {
	  // Finds and executes scripts in a newly added element's body.
	  // Needed since innerHTML does not run scripts.
	  //
	  // Argument body_el is an element in the dom.

	  function nodeName(elem, name) {
	    return elem.nodeName && elem.nodeName.toUpperCase() ===
	              name.toUpperCase();
	  };

	  function evalScript(elem) {
	    var data = (elem.text || elem.textContent || elem.innerHTML || "" ),
	        head = document.getElementsByTagName("head")[0] ||
	                  document.documentElement,
	        script = document.createElement("script");

	    script.type = "text/javascript";
	    try {
	      // doesn't work on ie...
	      script.appendChild(document.createTextNode(data));      
	    } catch(e) {
	      // IE has funky script nodes
	      script.text = data;
	    }

	    head.insertBefore(script, head.firstChild);
	    head.removeChild(script);
	  };

	  // main section of function
	  var scripts = [],
	      script,
	      children_nodes = body_el.childNodes,
	      child,
	      i;

	  for (i = 0; children_nodes[i]; i++) {
	    child = children_nodes[i];
	    if (nodeName(child, "script" ) &&
	      (!child.type || child.type.toLowerCase() === "text/javascript")) {
	          scripts.push(child);
	      }
	  }

	  for (i = 0; scripts[i]; i++) {
	    script = scripts[i];
	    if (script.parentNode) {script.parentNode.removeChild(script);}
	    evalScript(scripts[i]);
	  }
	};


	var preloadProjectName = URLParameterUtils.getParameterByName('loadProject');
	if(preloadProjectName) {
		$.ajax({
			url: preloadProjectName, 
			success: function(result){
				//console.log("done")
				//setTimeout(function () {
					WickPlayer.stopRunningCurrentProject();
		       		document.documentElement.innerHTML = result;
					exec_body_scripts(document.body);

		       	//}, 1000);
		    },
		      xhr: function()
			  {
			    var xhr = new window.XMLHttpRequest();
			    //Upload progress
			    xhr.upload.addEventListener("progress", function(evt){
			      if (evt.lengthComputable) {
			        var percentComplete = evt.loaded / evt.total;
			        //Do something with upload progress
			        window.percentComplete = percentComplete;
			      }
			    }, false);
			    //Download progress
			    xhr.addEventListener("progress", function(evt){
			      if (evt.lengthComputable) {
			        var percentComplete = evt.loaded / evt.total;
			        //Do something with download progress
			        window.percentComplete = percentComplete;
			      }
			    }, false);
			    return xhr;
			  }
		});
	}
}