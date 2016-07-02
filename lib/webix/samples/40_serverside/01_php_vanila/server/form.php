<?php

	//connect to database
	$db = new SQLite3('../../../common/testdata.sqlite');

	if (!isset($_GET["id"])) {
		header("HTTP/1.0 400 Bad request");
		die();
	}

	$id = $_GET["id"];

	//select data
	$res = $db->query("SELECT * FROM films WHERE id={$id}");

	//convert data to json
	$data = array();
	while ($rec = $res->fetchArray(SQLITE3_ASSOC))
		$data[] = $rec;
	//output json
	echo json_encode($data);

?>