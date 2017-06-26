// ugh
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

// Helper function for creating elements
/*function newElem(tag, className, innerHTML, parentElem) {
    var elem = document.createElement(tag);
    if(className) elem.className = className;
    if(innerHTML) elem.innerHTML = innerHTML;
    if(parentElem)
        parentElem.appendChild(elem);
    else
        document.body.appendChild(elem);
    return elem;
}*/

function buildTOC (docs) {

    var tocElem = document.getElementById('toc');
    tocElem.className = 'toc';
    docs.forEach(function (group) {
        var tocItem = document.createElement('a');
        tocItem.innerHTML = group.name;
        tocItem.setAttribute("href", "#" + group.name);
        tocItem.className = 'toc-item';
        tocElem.appendChild(tocItem);
    });

    return tocElem;

}

function buildProperty (property) {

    var propertyElem = document.createElement('div');
    propertyElem.className = 'property';

    var propertyTitle = document.createElement('div');
    propertyTitle.className = 'property-title';
    propertyTitle.innerHTML = property.name;
    propertyTitle.onclick = function () {
        propertyContent.style.maxHeight = propertyContent.style.maxHeight === '400px' ? '0px' : '400px';
    }
    propertyElem.appendChild(propertyTitle);

    var propertyContent = document.createElement('div');
    propertyContent.className = 'property-content';
    propertyElem.appendChild(propertyContent);

    var propertyDescription = document.createElement('div');
    propertyDescription.className = 'property-description';
    propertyDescription.innerHTML = property.description;
    propertyContent.appendChild(propertyDescription);

    if(property.args.length > 0) {
        var propertiesTitle = document.createElement('div');
        propertiesTitle.className = "property-subtitle";
        propertiesTitle.innerHTML = "Arguments:"
        propertyContent.appendChild(propertiesTitle);

        var propertyParameters = document.createElement('div');
        propertyParameters.className = 'property-parameters';
        propertyContent.appendChild(propertyParameters);

        property.args.forEach(function (arg) {
            var propertyParameter = document.createElement('div');
            propertyParameter.className = 'property-parameter';
            propertyParameter.innerHTML = arg.name + " : " + "<u>"+arg.type+"</u>"+" - "+arg.description;
            propertyParameters.appendChild(propertyParameter);
        });
    }

    if(property.return) {
        var returnsTitle = document.createElement('div');
        returnsTitle.className = "property-subtitle";
        returnsTitle.innerHTML = "Returns:"
        propertyContent.appendChild(returnsTitle);

        var propertyReturns = document.createElement('div');
        propertyReturns.className = 'property-returns';
        propertyReturns.innerHTML = "<u>"+property.return.type+"</u>"+" : " + property.return.description;
        propertyContent.appendChild(propertyReturns);
    }

    var exampleTitle = document.createElement('div');
    exampleTitle.className = "property-subtitle";
    exampleTitle.innerHTML = "Example:"
    propertyContent.appendChild(exampleTitle);

    var propertyExample = document.createElement('div');
    propertyExample.className = 'property-example';
    propertyExample.innerHTML = '<pre class="property-example-code"><code class="javascript">'+property.example+'</code></pre>';
    propertyContent.appendChild(propertyExample);

    var hr = document.createElement('hr');
    hr.className = 'property-hr';
    propertyElem.appendChild(hr);   

    return propertyElem;

}

function buildGroup (group) {

    var groupElem = document.createElement('div');
    groupElem.className = 'group';

    var groupTitle = document.createElement('div');
    groupTitle.className = 'group-title';
    groupTitle.innerHTML = group.name;
    groupTitle.id = group.name;
    groupElem.appendChild(groupTitle);

    var hr = document.createElement('hr');
    hr.className = 'group-title-hr';
    groupElem.appendChild(hr);  

    group.properties.forEach(function (property) {
        var propertyElem = buildProperty(property);
        groupElem.appendChild(propertyElem);
    }); 

    return groupElem;

}

function buildDocs (docs) {

    var docsElem = document.createElement('div');
    docsElem.className = 'docs';
    docs.forEach(function (group) {
        var groupElem = buildGroup(group);
        docsElem.appendChild(groupElem);
    });

    return docsElem;
}

function buildPage (docs) {
    var tocElem = buildTOC(docs);

    var docsElem = buildDocs(docs);
    document.body.appendChild(docsElem);

    /*var docsContainer = newElem('div', 'docs')

	docs.forEach(function (group) {
	    var groupName = newElem('div', 'groupName', group.name);
        groupName.id = group.name;
        document.getElementById('toc').innerHTML += '<a href="#'+group.name+'">'+group.name+'</a><br />';

        group.properties.forEach(function (property) {
            var box = newElem('div', 'groupBox', docsContainer);
            
            newElem('div', 'propertyName', property.name, box);
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
            //newElem('div', 'propertyExample', property.example.replaceAll("\n", "<br />").replaceAll("\t", "&nbsp&nbsp&nbsp&nbsp"), box);
            var exampleCodeString = property.example
            box.innerHTML += '<pre class="propertyExample"><code class="javascript">'+exampleCodeString+'</code></pre>';
        });
    });*/

    //newElem('div', 'spacer');



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
    	buildPage(data.docs);
    },
    error: function () {
        console.log("ajax: error")
    },
    complete: function(response, textStatus) {
        
    }
});