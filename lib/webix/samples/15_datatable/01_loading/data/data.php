<?php
	require_once("../../../common/config.php");

	$data = new JSONDataConnector($conn, $dbtype);
	Connector::$sort_var = "sort";
	Connector::$filter_var = "filter";
	$data->render_table("packages_plain","id","package, size, architecture, section");
?>
