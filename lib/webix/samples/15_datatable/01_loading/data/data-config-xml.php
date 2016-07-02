<?php
	require_once("../../../common/config.php");

	$data = new DataConnector($conn, $dbtype);
	$data->add_section("config", '
		<columns stack="true">
			<column id="package"		header="Name"			width="200"></column>
			<column id="section"		header="Section"		width="120"></column>
			<column id="size"			header="Size"			width="80"></column>
			<column id="architecture"	header="PC"				width="60"></column>
		</columns>
		<height>100</height>
		<autowidth>true</autowidth>
	');
	$data->render_table("packages_plain","id","package, size, architecture, section");
?>
