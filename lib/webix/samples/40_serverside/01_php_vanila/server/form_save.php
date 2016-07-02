<?php

	//connect to database
	$db = new SQLite3('../../../common/testdata.sqlite');

	//$operation = $_POST["webix_operation"];

	// get id and data 
	//  !!! you need to escape data in real app, to prevent SQL injection !!!
	$id = @$_POST['id'];
	$year = $_POST["year"];
	$title = $_POST["title"];
	$votes = $_POST["votes"];

	//updating record
	$db->query("UPDATE films SET title='$title', year='$year', votes='$votes' WHERE id='$id'");
	echo '{ "id":"'.$id.'", "status":"success" }';

?>