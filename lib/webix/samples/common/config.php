<?php
	$common = dirname(__FILE__);

	require_once($common."/connector/data_connector.php");
	require_once($common."/connector/db_sqlite3.php");

	$conn = new SQLite3($common.'/testdata.sqlite');
	$dbtype = "SQLite3";
?>