<?php
$filename = trim(file_get_contents("php://input"));
if (!$filename) {
    echo json_encode(["success" => false, "error" => "No filename provided"]);
    exit;
}

$filename = basename($filename);
$filePath = "../images/" . $filename;
if (file_exists($filePath)) {
    if (unlink($filePath)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "File could not be deleted"]);
    }
} else {
    echo json_encode(["success" => false, "error" => "File does not exist"]);
}
?>