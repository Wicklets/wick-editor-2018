<?php

function get_top_level($start, $count){
	$data = array();
	for ($i=0; $i<$count; $i++)
		$data[] = array( "value" => "record $i : $start", "id" => "x".($i+$start), "webix_kids" => true );
	

	$response = array( "total_count" => 100000, "pos" => $start, "data" => $data );
	return json_encode($response);
}

function get_sub_data($parent){
	$data = array();
	for ($i=0; $i<10; $i++)
		$data[] = array( "value" => "Child $i : $parent", "id" => "x-$i-$parent");
	

	$response = array( "parent" => $parent, "data" => $data );
	return json_encode($response);
}


if (isset($_GET["parent"])){
	//request sub-level data
	echo get_sub_data($_GET["parent"]);
} else {
	//dynamic data loading}
	$start = 0;
	$count = 50;

	if (isset($_GET["start"])) $start = $_GET["start"]*1;
	if (isset($_GET["count"])) $count = $_GET["count"]*1;


	echo get_top_level($start, $count);
}

?>