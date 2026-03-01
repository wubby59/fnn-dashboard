<?php
// Database credentials
$host = '192.168.100.230';
$dbname = 'reports';
$user = 'root';
$password = 'password';

try {
    // Create a PDO instance
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $pdo = new PDO($dsn, $user, $password, $options);

    // Prepare and execute the SQL query
    //$sql = "SELECT * FROM system_stats ORDER BY watch DESC";
    $sql = "SELECT computer_name, ip_address, time, system_uptime, 'partition', total_space_mb, free_space_mb, used_space_mb, free_memory_mb, cpu_usage, updated_at, watch FROM system_stats ORDER BY watch DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $data = $stmt->fetchAll();

    // Output the data as JSON
    header('Content-Type: application/json');
    echo json_encode($data);

} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage();
    exit;
}
?>

