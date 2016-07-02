<?php

	//connect to database
	$db = new SQLite3('../../../common/testdata.sqlite');

	$str = "";
	$whereArr = array();
	if (isset($_GET["filter"])){
		foreach($_GET["filter"] as $name => $value){
    	    array_push($whereArr,$db->escapeString($name)." LIKE '%".$db->escapeString($value)."%'");
    	}
    	if(count($whereArr))
			$str = " WHERE ".implode(" AND ",$whereArr);
	}
	$sortArr = array();
	if (isset($_GET["sort"])){
		foreach($_GET["sort"] as $name => $dir){
    	    array_push($sortArr,$db->escapeString($name)." ".$dir);
    	}
    	if(count($sortArr))
			$str .= " ORDER BY ".implode(",",$sortArr);
	}

	//select data
	$res = $db->query("SELECT * FROM films ".$str);

	//convert data to json
	$data = array();
	while ($rec = $res->fetchArray(SQLITE3_ASSOC))
		$data[] = $rec;
	//output json
	echo json_encode($data);

?>