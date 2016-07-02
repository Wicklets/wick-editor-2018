<?php

require("./countries.php");

$filter = isset($_GET["filter"]) ? $_GET["filter"]["value"] : false;
$json = Array();
$max = 0;
for ($i = 0; $i < count($countries); $i++) {
	if ($filter===false || $filter === "" || strpos(strtolower($countries[$i]["name"]), strtolower($filter)) === 0) {
		$json[] = Array("id"=> $countries[$i]["id"],"value"=>$countries[$i]["name"] );
		if (++$max >= 10) break;
	}
}

echo json_encode($json);

?>