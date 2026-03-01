<?php
$servername = "192.168.100.230";
$username = "root";
$password = "password";
$dbname = "reports";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$query = "SELECT COUNT(DISTINCT service_name) AS count FROM system_services";
$result = $conn->query($query);
$data = $result->fetch_assoc();
echo $data['count'];
?>

