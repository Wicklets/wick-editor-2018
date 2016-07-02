var dataset = [
	{ id:1, sales:20, year:"02"},
	{ id:2, sales:55, year:"03"},
	{ id:3, sales:40, year:"04"},
	{ id:4, sales:78, year:"05"},
	{ id:5, sales:61, year:"06"},
	{ id:6, sales:35, year:"07"},
	{ id:7, sales:80, year:"08"},
	{ id:8, sales:50, year:"09"},
	{ id:9, sales:65, year:"10"},
	{ id:10, sales:59, year:"11"}
];

var dataset_colors = [
	{ id:1, sales:20, year:"02", color: "#ee4339"},
	{ id:2, sales:55, year:"03", color: "#ee9336"},
	{ id:3, sales:40, year:"04", color: "#eed236"},
	{ id:4, sales:78, year:"05", color: "#d3ee36"},
	{ id:5, sales:61, year:"06", color: "#a7ee70"},
	{ id:6, sales:35, year:"07", color: "#58dccd"},
	{ id:7, sales:80, year:"08", color: "#36abee"},
	{ id:8, sales:50, year:"09", color: "#476cee"},
	{ id:9, sales:65, year:"10", color: "#a244ea"},
	{ id:10, sales:59, year:"11", color: "#e33fc7"}
];
var small_dataset = [
	{ sales:35, year:"07" },
	{ sales:50, year:"08" },
	{ sales:65, year:"09" },
	{ sales:30, year:"10" },
	{ sales:45, year:"11" }
];
var data_xml = "<data><item id='01'><sales>35</sales><year>'07</year></item><item id='11'><sales>50</sales><year>'08</year></item><item id='21'><sales>65</sales><year>'09</year></item><item id='31'><sales>30</sales><year>'10</year></item><item id='41'><sales>45</sales><year>'11</year></item></data>";

var scatter_dataset = [
	{ "b":"4", "a":4.7, type: "Type A" },
	{ "b":"3.5", "a":0.8, type: "Type B" },
	{ "b":"2.4", "a":1.1, type: "Type C" },
	{ "b":"5.1", "a":10.5, type: "Type A" },
	{ "b":"4.8", "a":9.1, type: "Type B" },
	{ "b":"5.9", "a":8.5, type: "Type A" },
	{ "b":"3.1", "a":7.7, type: "Type B" },
	{ "b":"4.5", "a":7.2, type: "Type B" },
	{ "b":"5.9", "a":12.9, type: "Type C" },
	{ "b":"2.8", "a":5.8, type: "Type B" },
    { "b":"3.7", "a":8.1, type: "Type C" },
    { "b":"5.5", "a":14.0, type: "Type A" },
    { "b":"4.1", "a":1.5, type: "Type A" },
    { "b":"4.2", "a":6.1, type: "Type B" },
	{ "b":"2.7", "a":1.9, type: "Type C" },
	{ "b":"3.1", "a":5.5, type: "Type A" },
	{ "b":"6.3", "a":12.1, type: "Type B" },
	{ "b":"4.9", "a":11.5, type: "Type C" },
	{ "b":"2.8", "a":2.7, type: "Type A" },
	{ "b":"5.5", "a":10.2, type: "Type B" },
	{ "b":"8.2", "a":21.5, type: "Type C" },
	{ "b":"7.2", "a":15.8, type: "Type A" },
    { "b":"3.9", "a":11.1, type: "Type B" },
    { "b":"6.5", "a":15.0 , type: "Type C" },
    { "b":"7.0", "a":16.1, type: "Type A" },
    { "b":"2.9", "a":5.2, type: "Type C" },
	{ "b":"7.4", "a":18.5, type: "Type C" },
	{ "b":"6.5", "a":17.8, type: "Type A" },
    { "b":"4.7", "a":7.1, type: "Type C" },
    { "b":"7.7", "a":17.0 , type: "Type B" },
    { "b":"8.3", "a":16.5, type: "Type C" },
    { "b":"3.9", "a":9.6, type: "Type A" },
    { "b":"8.4", "a":23.0 , type: "Type B" },
    { "b":"7.7", "a":18.1, type: "Type A" },
    { "b":"3.9", "a":7.2, type: "Type A" },
	{ "b":"7.4", "a":20.5, type: "Type B" },
	{ "b":"6.2", "a":15.8, type: "Type C" },
    { "b":"4.2", "a":9.1, type: "Type B" },
    { "b":"8.7", "a":19.2 , type: "Type A" }
];
var scatter_dataset2 = [
	{ "b1":"4", "a":4.7 },
	{ "b2":"3.5", "a":0.8 },
	{ "b3":"2.4", "a":1.1 },
	{ "b1":"5.1", "a":10.5 },
	{ "b2":"4.8", "a":9.1 },
	{ "b1":"5.9", "a":8.5 },
	{ "b2":"3.1", "a":7.7 },
	{ "b2":"4.5", "a":7.2},
	{ "b3":"5.9", "a":12.9 },
	{ "b2":"2.8", "a":5.8 },
	{ "b3":"3.7", "a":8.1 },
	{ "b1":"5.5", "a":14.0},
	{ "b1":"4.1", "a":1.5 },
	{ "b2":"4.2", "a":6.1 },
	{ "b3":"2.7", "a":1.9 },
	{ "b1":"3.1", "a":5.5 },
	{ "b2":"6.3", "a":12.1 },
	{ "b3":"4.9", "a":11.5 },
	{ "b1":"2.8", "a":2.7 },
	{ "b2":"5.5", "a":10.2 },
	{ "b3":"8.2", "a":21.5 },
	{ "b1":"7.2", "a":15.8 },
	{ "b2":"3.9", "a":11.1 },
	{ "b3":"6.5", "a":15.0 },
	{ "b1":"7.0", "a":16.1 },
	{ "b3":"2.9", "a":5.2 },
	{ "b3":"7.4", "a":18.5 },
	{ "b1":"6.5", "a":17.8 },
	{ "b3":"4.7", "a":7.1 },
	{ "b2":"7.7", "a":17.0 },
	{ "b3":"8.3", "a":16.5 },
	{ "b1":"3.9", "a":9.6 },
	{ "b2":"8.4", "a":23.0 },
	{ "b1":"7.7", "a":18.1 },
	{ "b1":"3.9", "a":7.2 },
	{ "b2":"7.4", "a":20.5 },
	{ "b3":"6.2", "a":15.8 },
	{ "b2":"4.2", "a":9.1 },
	{ "b1":"8.7", "a":19.2 }
];
var month_dataset = [
	{ sales:"20", month:"Jan", color: "#ee3639" },
	{ sales:"30", month:"Feb", color: "#ee9e36" },
	{ sales:"50", month:"Mar", color: "#eeea36" },
	{ sales:"40", month:"Apr", color: "#a9ee36" },
	{ sales:"70", month:"May", color: "#36d3ee" },
	{ sales:"80", month:"Jun", color: "#367fee" },
	{ sales:"60", month:"Jul", color: "#9b36ee" }
];
var companies = [
    { "companyA":"4.8", "companyB":"2.3", "month":"Jan" },
    { "companyA":"5.0", "companyB":"2.1", "month":"Feb" },
    { "companyA":"3.2", "companyB":"0.1", "month":"Mar" },
    { "companyA":"3.1", "companyB":"5.7", "month":"Apr" },
    { "companyA":"1.0", "companyB":"3.0", "month":"May" },
    { "companyA":"1.3", "companyB":"2.6", "month":"Jun" },
    { "companyA":"3.2", "companyB":"3.0", "month":"Jul" },
    { "companyA":"2.3", "companyB":"5.0", "month":"Aug" },
    { "companyA":"1.9", "companyB":"1.4", "month":"Sep" },
    { "companyA":"2.2", "companyB":"1.0", "month":"Oct" },
    { "companyA":"4.0", "companyB":"1.5", "month":"Nov" },
    { "companyA":"6.0", "companyB":"4.0", "month":"Dec" }

];

var multiple_dataset = [
	{ sales:"20", sales2:"35", sales3:"55", year:"02" },
	{ sales:"40", sales2:"24", sales3:"40", year:"03" },
	{ sales:"44", sales2:"20", sales3:"27", year:"04" },
	{ sales:"23", sales2:"50", sales3:"43", year:"05" },
	{ sales:"21", sales2:"36", sales3:"31", year:"06" },
	{ sales:"50", sales2:"40", sales3:"56", year:"07" },
	{ sales:"30", sales2:"65", sales3:"75", year:"08" },
	{ sales:"90", sales2:"62", sales3:"55", year:"09" },
	{ sales:"55", sales2:"40", sales3:"60", year:"10" },
	{ sales:"72", sales2:"45", sales3:"54", year:"11" }
];
var multiple_dataset = [
	{ sales:"20", sales2:"35", sales3:"55", year:"02" },
	{ sales:"40", sales2:"24", sales3:"40", year:"03" },
	{ sales:"44", sales2:"20", sales3:"27", year:"04" },
	{ sales:"23", sales2:"50", sales3:"43", year:"05" },
	{ sales:"21", sales2:"36", sales3:"31", year:"06" },
	{ sales:"50", sales2:"40", sales3:"56", year:"07" },
	{ sales:"30", sales2:"65", sales3:"75", year:"08" },
	{ sales:"90", sales2:"62", sales3:"55", year:"09" },
	{ sales:"55", sales2:"40", sales3:"60", year:"10" },
	{ sales:"72", sales2:"45", sales3:"54", year:"11" }
];
var dates_dataset = [
	{ id:1, sales:20, date:"05.01.2012", color: "#ee4339"},
	{ id:2, sales:55, date:"10.01.2012", color: "#ee9336"},
	{ id:3, sales:40, date:"15.01.2012", color: "#eed236"},
	{ id:4, sales:78, date:"18.01.2012", color: "#d3ee36"},
	{ id:5, sales:61, date:"25.01.2012", color: "#a7ee70"},
	{ id:6, sales:35, date:"02.02.2012", color: "#58dccd"},
	{ id:7, sales:80, date:"06.02.2012", color: "#36abee"},
	{ id:8, sales:50, date:"19.02.2012", color: "#476cee"},
	{ id:9, sales:65, date:"22.02.2012", color: "#a244ea"},
	{ id:10, sales:59, date:"27.02.2012", color: "#e33fc7"},
	{ id:11, sales:86, date:"11.01.2013", color: "#e33fc7"}
];
var groupdata = [{"id":"1","sales":"262","year":"2003","company":"Company 3"},{"id":"2","sales":"527","year":"1998","company":"Company 1"},{"id":"3","sales":"629","year":"2006","company":"Company 3"},{"id":"4","sales":"403","year":"2008","company":"Company 2"},{"id":"5","sales":"652","year":"2005","company":"Company 3"},{"id":"6","sales":"708","year":"2006","company":"Company 3"},{"id":"7","sales":"377","year":"2006","company":"Company 2"},{"id":"8","sales":"714","year":"2004","company":"Company 3"},{"id":"9","sales":"385","year":"2000","company":"Company 3"},{"id":"10","sales":"113","year":"2002","company":"Company 3"},{"id":"11","sales":"215","year":"2004","company":"Company 2"},{"id":"12","sales":"149","year":"2003","company":"Company 1"},{"id":"13","sales":"391","year":"1996","company":"Company 3"},{"id":"14","sales":"234","year":"2006","company":"Company 2"},{"id":"15","sales":"847","year":"2003","company":"Company 3"},{"id":"16","sales":"878","year":"2008","company":"Company 1"},{"id":"17","sales":"248","year":"2004","company":"Company 2"},{"id":"18","sales":"311","year":"2007","company":"Company 1"},{"id":"19","sales":"724","year":"1996","company":"Company 1"},{"id":"20","sales":"113","year":"2003","company":"Company 3"},{"id":"21","sales":"884","year":"2003","company":"Company 1"},{"id":"22","sales":"936","year":"1996","company":"Company 2"},{"id":"23","sales":"550","year":"2001","company":"Company 3"},{"id":"24","sales":"923","year":"2006","company":"Company 2"},{"id":"25","sales":"977","year":"2005","company":"Company 1"},{"id":"26","sales":"446","year":"2002","company":"Company 3"},{"id":"27","sales":"578","year":"1999","company":"Company 3"},{"id":"28","sales":"521","year":"1999","company":"Company 2"},{"id":"29","sales":"554","year":"2002","company":"Company 1"},{"id":"30","sales":"335","year":"2005","company":"Company 2"},{"id":"31","sales":"612","year":"2006","company":"Company 3"},{"id":"32","sales":"173","year":"2000","company":"Company 1"},{"id":"33","sales":"995","year":"2005","company":"Company 3"},{"id":"34","sales":"743","year":"2006","company":"Company 2"},{"id":"35","sales":"904","year":"2003","company":"Company 2"},{"id":"36","sales":"696","year":"2007","company":"Company 1"},{"id":"37","sales":"526","year":"2008","company":"Company 2"},{"id":"38","sales":"459","year":"1997","company":"Company 1"},{"id":"39","sales":"357","year":"2007","company":"Company 2"},{"id":"40","sales":"655","year":"2009","company":"Company 2"},{"id":"41","sales":"527","year":"2009","company":"Company 3"},{"id":"42","sales":"526","year":"2008","company":"Company 2"},{"id":"43","sales":"125","year":"1998","company":"Company 2"},{"id":"44","sales":"865","year":"2003","company":"Company 3"},{"id":"45","sales":"125","year":"2000","company":"Company 2"},{"id":"46","sales":"633","year":"2002","company":"Company 2"},{"id":"47","sales":"911","year":"2006","company":"Company 3"},{"id":"48","sales":"791","year":"2008","company":"Company 2"},{"id":"49","sales":"700","year":"2006","company":"Company 3"},{"id":"50","sales":"921","year":"1996","company":"Company 3"},{"id":"51","sales":"267","year":"2000","company":"Company 2"},{"id":"52","sales":"350","year":"2005","company":"Company 1"},{"id":"53","sales":"477","year":"2006","company":"Company 1"},{"id":"54","sales":"180","year":"1997","company":"Company 3"},{"id":"55","sales":"699","year":"2008","company":"Company 3"},{"id":"56","sales":"808","year":"2000","company":"Company 2"},{"id":"57","sales":"837","year":"1999","company":"Company 2"},{"id":"58","sales":"352","year":"2004","company":"Company 2"},{"id":"59","sales":"656","year":"1999","company":"Company 2"},{"id":"60","sales":"279","year":"2002","company":"Company 3"},{"id":"61","sales":"907","year":"2004","company":"Company 3"},{"id":"62","sales":"227","year":"1997","company":"Company 2"},{"id":"63","sales":"845","year":"2002","company":"Company 2"},{"id":"64","sales":"931","year":"2003","company":"Company 3"},{"id":"65","sales":"264","year":"2006","company":"Company 1"},{"id":"66","sales":"846","year":"2005","company":"Company 1"},{"id":"67","sales":"616","year":"1999","company":"Company 2"},{"id":"68","sales":"877","year":"1998","company":"Company 2"},{"id":"69","sales":"738","year":"1997","company":"Company 3"},{"id":"70","sales":"999","year":"2008","company":"Company 2"},{"id":"71","sales":"674","year":"2006","company":"Company 1"},{"id":"72","sales":"483","year":"2006","company":"Company 3"},{"id":"73","sales":"105","year":"2002","company":"Company 1"},{"id":"74","sales":"826","year":"2005","company":"Company 3"},{"id":"75","sales":"372","year":"2004","company":"Company 2"},{"id":"76","sales":"566","year":"2009","company":"Company 2"},{"id":"77","sales":"196","year":"2001","company":"Company 1"},{"id":"78","sales":"919","year":"2004","company":"Company 2"},{"id":"79","sales":"412","year":"2008","company":"Company 1"},{"id":"80","sales":"591","year":"1999","company":"Company 2"},{"id":"81","sales":"588","year":"2006","company":"Company 1"},{"id":"82","sales":"517","year":"2005","company":"Company 1"},{"id":"83","sales":"149","year":"2002","company":"Company 1"},{"id":"84","sales":"474","year":"1998","company":"Company 1"},{"id":"85","sales":"408","year":"2008","company":"Company 2"},{"id":"86","sales":"212","year":"2003","company":"Company 1"},{"id":"87","sales":"284","year":"1999","company":"Company 3"},{"id":"88","sales":"580","year":"1999","company":"Company 2"},{"id":"89","sales":"134","year":"2005","company":"Company 3"},{"id":"90","sales":"145","year":"1997","company":"Company 3"},{"id":"91","sales":"172","year":"1997","company":"Company 2"},{"id":"92","sales":"825","year":"1997","company":"Company 1"},{"id":"93","sales":"696","year":"2005","company":"Company 3"},{"id":"94","sales":"907","year":"2008","company":"Company 1"},{"id":"95","sales":"515","year":"1996","company":"Company 2"},{"id":"96","sales":"675","year":"1996","company":"Company 2"},{"id":"97","sales":"771","year":"2005","company":"Company 3"},{"id":"98","sales":"836","year":"1996","company":"Company 2"},{"id":"99","sales":"666","year":"2007","company":"Company 3"},{"id":"100","sales":"944","year":"2007","company":"Company 1"}]

var dataset_min_max = [
	{ sales:"1000", sales2:"35", year:"02" },
	{ sales:"1400", sales2:"24", year:"03" },
	{ sales:"1800", sales2:"20", year:"04" },
	{ sales:"1700", sales2:"50", year:"05" },
	{ sales:"2100", sales2:"36", year:"06" },
	{ sales:"2200", sales2:"40", year:"07" },
	{ sales:"2500", sales2:"65", year:"08" },
	{ sales:"2000", sales2:"62", year:"09" },
	{ sales:"2900", sales2:"40", year:"10" },
	{ sales:"2700", sales2:"45", year:"11" }
];
