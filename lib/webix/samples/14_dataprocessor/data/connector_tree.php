<?php
	$db = new SQLite3('../../common/testdata.sqlite');

	require("../../common/connector/data_connector.php");
	require("../../common/connector/db_sqlite3.php");

	$conn = new TreeDataConnector($db, "SQLite3");
	$conn->render_table("films_tree","id","title(value),open", "", "parent");
?>