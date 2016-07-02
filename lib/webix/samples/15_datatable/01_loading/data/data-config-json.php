<?php
	require_once("../../../common/config.php");

	$data = new JSONDataConnector($conn, $dbtype);
	$data->add_section("config", '{
		"columns":[
			{ "id":"package",	"header":"Name", 			"width":200 },
			{ "id":"section",	"header":"Section",		"width":120 },
			{ "id":"size",	"header":"Size" , 		"width":80  },
			{ "id":"architecture",	"header":"PC", 	"width":60  }
		],
		"height":100,
		"autowidth":true
	}');
	$data->render_table("packages_plain","id","package, size, architecture, section");
?>
