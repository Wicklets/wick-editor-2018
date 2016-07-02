<?php

	require('../../../common/config.php');

	$data = new JSONTreeDataConnector($conn, $dbtype);
	$data->render_table("films_tree","id","title,open","","parent");

?>