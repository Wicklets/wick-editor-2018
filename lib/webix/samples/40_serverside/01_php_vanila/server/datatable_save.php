<?php

	//connect to database
	$db = new SQLite3('../../../common/testdata.sqlite');

	$operation = $_POST["webix_operation"];

	// get id and data 
	//  !!! you need to escape data in real app, to prevent SQL injection !!!
	$id = @$_POST['id'];
	$rank = $_POST["rank"];
	$year = $_POST["year"];
	$title = $_POST["title"];
	$votes = $_POST["votes"];


	if ($operation == "insert"){
		//adding new record
		$db->query("INSERT INTO films(rank, title, year, votes) VALUES('$rank', '$title', '$year', '$votes')");
		echo '{ "id":"'.$id.'", "status":"success", "newid":"'.$db->lastInsertRowID().'" }';

	} else if ($operation == "update"){
		//updating record
		$db->query("UPDATE films SET rank='$rank', title='$title', year='$year', votes='$votes' WHERE id='$id'");
		echo '{ "id":"'.$id.'", "status":"success" }';

	} else if ($operation == "delete"){
		//deleting record
		$db->query("DELETE FROM films WHERE id='$id'");
		echo '{ "id":"'.$id.'", "status":"success" }';

	} else 
		echo "Not supported operation";

?>