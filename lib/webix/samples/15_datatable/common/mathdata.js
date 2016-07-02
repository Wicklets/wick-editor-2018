var budget = [
	{ id:1, name:"United States",	rev: "2092000", exp: "3397000", dif:"=2092000 - 3397000", dif_math:"=[:0,:2]-[:0,:3]", date: "2010"},
	{ id:2, name:"Japan",			rev: "1839000", exp: "2252000", dif:"=1839000 - 2252000", dif_math:"=[:1,:2] - [:1,:3]", date: "2009"},
	{ id:3, name:"Germany",			rev: "1398000", exp: "1540000", dif:"=1398000 - 1540000", dif_math:"=[:2,:2] - [:2,:3]", date: "2009"},
	{ id:4, name:"France ",			rev: "1229000", exp: "1445000", dif:"=1229000 - 1445000", dif_math:"=[:3,:2] - [:3,:3]", date: "2009"},
	{ id:5, name:"China",			rev: "1149000", exp: "1270000", dif:"=1149000 - 1270000", dif_math:"=[:4,:2] - [:4,:3]", date: "2009"},
	{ id:6, name:"Italy",			rev: "960100", exp: "1068000", dif:"=960100 - 1068000", dif_math:"=[:5,:2] - [:5,:3]", date: "2009"},
	{ id:7, name:"United Kingdom",	rev: "926700", exp: "1154000", dif:"=926700 - 1154000", dif_math:"=[:6,:2] - [:6,:3]", date: "2009"},
	{ id:8, name:"Canada",			rev: "605700", exp: "677700", dif:"=605700 - 677700", dif_math:"=[:7,:2] - [:7,:3]", date: "2009"},
	{ id:9, name:"Spain",			rev: "503100", exp: "633300", dif:"=503100 - 633300", dif_math:"=[:8,:2] - [:8,:3]", date: "2009"},
	{ id:10, name:"Brazil",			rev: "464400", exp: "552600", dif:"=464400 - 552600", dif_math:"=[:9,:2] - [:9,:3]", date: "2009"}

];

var budget_tree = [

	{ name:"Top Group", data:[
		{ id:1, name:"United States",	rev: "2092000", exp: "3397000", dif:"=2092000 - 3397000", dif_math:"=[:0,:2]-[:0,:3]", date: "2010"},
		{ id:2, name:"Japan",			rev: "1839000", exp: "2252000", dif:"=1839000 - 2252000", dif_math:"=[:1,:2] - [:1,:3]", date: "2009"},
		{ id:3, name:"Germany",			rev: "1398000", exp: "1540000", dif:"=1398000 - 1540000", dif_math:"=[:2,:2] - [:2,:3]", date: "2009"},
		{ id:4, name:"France ",			rev: "1229000", exp: "1445000", dif:"=1229000 - 1445000", dif_math:"=[:3,:2] - [:3,:3]", date: "2009"},
		{ id:5, name:"China",			rev: "1149000", exp: "1270000", dif:"=1149000 - 1270000", dif_math:"=[:4,:2] - [:4,:3]", date: "2009"}
	]},
	{ name:"Other", data:[
		{ id:6, name:"Italy",			rev: "960100", exp: "1068000", dif:"=960100 - 1068000", dif_math:"=[:5,:2] - [:5,:3]", date: "2009"},
		{ id:7, name:"United Kingdom",	rev: "926700", exp: "1154000", dif:"=926700 - 1154000", dif_math:"=[:6,:2] - [:6,:3]", date: "2009"},
		{ id:8, name:"Canada",			rev: "605700", exp: "677700", dif:"=605700 - 677700", dif_math:"=[:7,:2] - [:7,:3]", date: "2009"},
		{ id:9, name:"Spain",			rev: "503100", exp: "633300", dif:"=503100 - 633300", dif_math:"=[:8,:2] - [:8,:3]", date: "2009"},
		{ id:10, name:"Brazil",			rev: "464400", exp: "552600", dif:"=464400 - 552600", dif_math:"=[:9,:2] - [:9,:3]", date: "2009"}
	]}

];