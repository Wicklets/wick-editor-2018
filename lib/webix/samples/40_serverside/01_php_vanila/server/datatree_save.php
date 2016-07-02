<?php

	//connect to database
	$db = new SQLite3('../../../common/testdata.sqlite');

	$operation = $_POST["webix_operation"];

	// get id and data 
	//  !!! you need to escape data in real app, to prevent SQL injection !!!
	$id = @$_POST['id'];
	$title = $_POST["title"];
	//if($_POST["parent"]){
		$parent = $_POST["parent"];
	//}

	if ($operation == "insert"){
		//adding new record
		$db->query("INSERT INTO films_tree(title,parent) VALUES('$title', $parent)");
		echo '{ "id":"'.$id.'", "status":"success", "newid":"'.$db->lastInsertRowID().'" }';

	} else if ($operation == "update"){
		//updating record
		$db->query("UPDATE films_tree SET title='$title', parent='$parent' WHERE id='$id'");
		echo '{ "id":"'.$id.'", "status":"success" }';

	} else if ($operation == "delete"){
		//deleting record
		$db->query("DELETE FROM films_tree WHERE id='$id'");
		echo '{ "id":"'.$id.'", "status":"success" }';

	} else 
		echo "Not supported operation";

?>