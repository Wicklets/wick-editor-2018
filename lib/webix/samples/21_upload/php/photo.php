<?php

ini_set('max_execution_time', 120);
$destination = realpath('./photos');

if (isset($_FILES['upload'])){
    $file = $_FILES['upload'];

    $ext = pathinfo($file["name"], PATHINFO_EXTENSION);
    $sname = md5($file["name"]).".".$ext;
    $filename = $destination."/".preg_replace("|[\\\/]|", "", $sname);

    //check that file name is valid
    if ($filename !== "" && !file_exists($filename)){
        move_uploaded_file($file["tmp_name"], $filename);
        $res = array("status" => "server", "sname" => $sname);
    } else {
        $res = array("status" => "error");
    }

    echo json_encode($res);
}
?>