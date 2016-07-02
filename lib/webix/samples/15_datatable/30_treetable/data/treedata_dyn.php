<?php
	require_once("../../../common/config.php");

	$data = new TreeDataConnector($conn, $dbtype);
	$data->dynamic_loading(30);
	function checkChild($data){
		if ($data->get_value("has_kids") == 1)
			$data->set_kids(true);
		else
			$data->set_kids(false);
	}
	$data->event->attach("beforeRender","checkChild");
	$data->render_table("packages_tree","id","value, state, hours","has_kids","parent_id");

?>
