<?php

function get($id = 0) {
	//connect to database
	$db = new SQLite3('../../../common/testdata.sqlite');

	//select data
	$res = $db->query("SELECT * FROM films_tree WHERE parent={$id}");

	//convert data to json
	$data = array();
	while ($rec = $res->fetchArray(SQLITE3_ASSOC)) {
		$rec["data"] = get($rec["id"]);
		$data[] = $rec;
	}
	//output json
	return $data;
}

echo json_encode(get());

?>