<?php

	require_once("../../../common/config.php");
	
	$data = new JSONDataConnector($conn, $dbtype);
	$data->render_table("packages_plain","id","package,version,maintainer");
?>