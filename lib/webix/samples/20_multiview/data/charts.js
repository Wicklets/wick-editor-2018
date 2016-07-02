var achart = {
	view:"chart",
	type:"bar",
	value:"#sales#",
	color:"#color#",
	barWidth:30,
	radius:0,
	tooltip:{
		template:"#sales#"
	},
	xAxis:{
		template:"'#year#"
	},
	yAxis:{
		start:0,
		step: 10,
		end:100
	},
	padding:{
		bottom: 55
	},
	data: dataset_colors
};

var bchart = {
	view:"chart",
	type:"spline",
	value:"#sales#",
	item:{
		borderColor: "#ffffff",
		color: "#000000"
	},
	line:{
		color:"#ff9900",
		width:3
	},
	xAxis:{
		template:"'#year#"
	},
	offset:0,
	yAxis:{
		start:0,
		end:100,
		step:10,
		template:function(obj){
			return (obj%20?"":obj)
		}
	},
	padding:{
		bottom: 55
	},
	data: dataset
};


var cchart = {
	view:"chart",
	type:"line",

	xAxis:{
		template:"'#year#"
	},
	yAxis:{
		start:0,
		step: 10,
		end: 100
	},
	offset:0,
	legend:{
		values:[{text:"Company A"},{text:"Company B"},{text:"Company C"}],
		align:"right",
		valign:"middle",
		layout:"y",
		width: 100,
		margin: 8,
		marker:{
			type: "item",
			width: 18
		}
	},
	series:[
		{
			value:"#sales#",
			item:{
				borderColor: "#447900",
				color: "#69ba00"
			},
			line:{
				color:"#69ba00",
				width:2
			},
			tooltip:{
				template:"#sales#"
			}
		},
		{
			value:"#sales2#",
			item:{
				borderColor: "#0a796a",
				color: "#4aa397",
				type:"s",
				radius: 4
			},
			line:{
				color:"#4aa397",
				width:2
			},
			tooltip:{
				template:"#sales2#"
			}
		},
		{
			value:"#sales3#",
			item:{
				borderColor: "#b7286c",
				color: "#de619c",
				type:"t",
				radius: 4
			},
			line:{
				color:"#de619c",
				width:2
			},
			tooltip:{
				template:"#sales3#"
			}
		}
	],
	padding:{
		bottom: 55
	},
	data: multiple_dataset
}