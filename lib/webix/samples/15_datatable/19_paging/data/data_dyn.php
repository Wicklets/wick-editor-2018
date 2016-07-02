<?php
	require_once("../../../common/config.php");

	$data = new JSONDataConnector($conn, $dbtype);
	$data->dynamic_loading(30);
	$data->render_table("packages_plain","id","package, size, architecture, section");
?>
