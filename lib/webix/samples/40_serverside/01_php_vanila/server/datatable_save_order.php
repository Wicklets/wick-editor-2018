<?php

	//connect to database
	$db = new SQLite3('../../../common/testdata.sqlite');

	// get id and data 
	//  !!! you need to escape data in real app, to prevent SQL injection !!!
	$id = @$_POST['id'];
	$rank = $_POST["rank"];
	$old_rank = $_POST["old_rank"];

	$db->query("UPDATE films SET rank = rank-1 WHERE rank >= $old_rank");
	$db->query("UPDATE films SET rank = rank+1 WHERE rank >= $rank");
	$db->query("UPDATE films SET rank = $rank  WHERE  id = $id");

	echo '{ "id":"'.$id.'", "status":"success" }';

?>