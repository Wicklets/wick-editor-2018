<?php

	//connect to database
	$db = new SQLite3('../../../common/testdata.sqlite');

	//select data
	$res = $db->query("SELECT * FROM films ORDER BY rank");

	//convert data to json
	$data = array();
	while ($rec = $res->fetchArray(SQLITE3_ASSOC))
		$data[] = $rec;
	//output json
	echo json_encode($data);

?>