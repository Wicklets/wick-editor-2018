<?php

	//connect to database
	$db = new SQLite3('../../../common/testdata.sqlite');

	$method = $_SERVER['REQUEST_METHOD'];

	if ($method != "GET")
		$request = json_decode(file_get_contents('php://input'), true);
	
	// get id and data 
	//  !!! you need to escape data in real app, to prevent SQL injection !!!
	$id = @$request['id'];
	$rank = $request["rank"];
	$year = $request["year"];
	$title = $request["title"];
	$votes = $request["votes"];


	if ($method == "POST"){
		//adding new record
		$db->query("INSERT INTO films(rank, title, year, votes) VALUES('$rank', '$title', '$year', '$votes')");
		echo '{ "id":"'.$id.'", "status":"success", "newid":"'.$db->lastInsertRowID().'" }';

	} else if ($method == "PUT"){
		//updating record
		$db->query("UPDATE films SET rank='$rank', title='$title', year='$year', votes='$votes' WHERE id='$id'");
		echo '{ "id":"'.$id.'", "status":"success" }';

	} else if ($method == "DELETE"){
		//deleting record
		$db->query("DELETE FROM films WHERE id='$id'");
		echo '{ "id":"'.$id.'", "status":"success" }';

	} else 
		echo "Not supported operation";

?>