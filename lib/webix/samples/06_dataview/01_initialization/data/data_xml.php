<?php

	require_once("../../../common/config.php");
	
	$data = new DataConnector($conn, $dbtype);
	$data->render_table("packages_plain","id","package,version,maintainer");
?>