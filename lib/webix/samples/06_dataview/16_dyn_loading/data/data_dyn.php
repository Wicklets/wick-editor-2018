<?php

	require_once("../../../common/config.php");
	
	$data = new JSONDataConnector($conn, $dbtype);
	$data->dynamic_loading(50);
	$data->render_table("packages_plain","id","package,version,maintainer");
?>