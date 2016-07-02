<?php
	require_once("../../../common/config.php");

	$data = new TreeDataConnector($conn, $dbtype);
	$data->render_table("packages_tree","id","value, state, hours","","parent_id");
?>
