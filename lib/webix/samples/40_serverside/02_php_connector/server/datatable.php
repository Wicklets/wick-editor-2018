<?php

	require('../../../common/config.php');

	$data = new JSONDataConnector($conn, $dbtype);
	$data->render_table("films","id","title,year,votes,rating,rank");

?>