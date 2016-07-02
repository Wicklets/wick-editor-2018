<?php
	require("../../common/config.php");
	
	$data = new DataConnector($conn, $dbtype);
	$data->render_table("films","id","title,year,votes,rating,rank");
?>