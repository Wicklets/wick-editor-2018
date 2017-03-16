var docs;

// ugh
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

// Helper function for creating elements
function newElem(tag, className, innerHTML, parentElem) {
    var elem = document.createElement(tag);
    if(className) elem.className = className;
    if(innerHTML) elem.innerHTML = innerHTML;
    if(parentElem)
        parentElem.appendChild(elem);
    else
        document.body.appendChild(elem);
    return elem;
}

// Create page for everything
function buildPage () {
	docs.docs.forEach(function (group) {
	    var groupName = newElem('div', 'groupName', group.name);
        groupName.id = group.name;
        document.getElementById('toc').innerHTML += '&#8226; <a href="#'+group.name+'">'+group.name+'</a><br />';
        group.properties.forEach(function (property) {
            var box = newElem('div', 'groupBox');
            
            newElem('div', 'propertyName', /*'&#8226; ' + */property.name, box);
            newElem('hr', null, null, box);
            
            newElem('div', 'propertyDescription', property.description, box);
            
            if(property.args.length > 0) {
                newElem('div', 'title', 'Parameters:', box);
                property.args.forEach(function (arg) {
                    newElem('div', 'propertyParameter', arg.name + " : " + "<u>"+arg.type+"</u>"+" - "+arg.description, box);
                });
            }
            
            if(property.return) {
                newElem('div', 'title', 'Returns:', box);
                newElem('div', 'propertyReturns', "<u>"+property.return.type+"</u>"+" : " + property.return.description, box);
            }
            
            newElem('div', 'title', 'Example:', box);
            /*newElem('div', 'propertyExample', property.example.replaceAll("\n", "<br />").replaceAll("\t", "&nbsp&nbsp&nbsp&nbsp"), box);*/
            var exampleCodeString = property.example
            box.innerHTML += '<pre class="propertyExample"><code class="javascript">'+exampleCodeString+'</code></pre>';
        });
    });
    newElem('div', 'spacer');
    // Tell highlight.js to highlight the example code
    $(document).ready(function() {
      $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
      });
    });
}

// Load the json file with all the docs info
$.ajax({
    url: "../../src/project/Docs.json",
    type: 'GET',
    data: {},
    success: function(data) {
    	docs = data;
    	buildPage();
    },
    error: function () {
        console.log("ajax: error")
    },
    complete: function(response, textStatus) {
        
    }
});