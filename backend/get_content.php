<?php
require 'config.php';

$sql = "SELECT setting_value FROM app_settings WHERE setting_key = 'site_content'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    // Check if empty or null
    if (empty($row['setting_value']) || $row['setting_value'] === '{}') {
        echo json_encode(null); // Return null so frontend uses defaultContent
    } else {
        echo $row['setting_value'];
    }
} else {
    echo json_encode(null);
}

$conn->close();
?>
