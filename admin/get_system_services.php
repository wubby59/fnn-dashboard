<?php
// Database connection parameters
$servername = "localhost";
$username = "root";
$password = "password";
$dbname = "reports";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// SQL query
$sql = "SELECT service_name,remote_site,ip_address,updated_at,is_running,computer_name,priority FROM system_services";
//$sql = "SELECT * FROM system_services";
$result = $conn->query($sql);

// Fetch all rows as an associative array
$data = [];
while ($row = $result->fetch_assoc()) {
  $data[] = $row;
}

// Close connection
$conn->close();

// Output data as JSON
header('Content-Type: application/json');
echo json_encode($data);
?>

