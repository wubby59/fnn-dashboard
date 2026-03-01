// delete_element.php
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

    // Retrieve POST data
    $computer_name = $_POST['computer_name'];

    // Prepare and execute the SQL query
    $sql = "DELETE FROM system_stats WHERE computer_name = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$computer_name]);

    echo "Success";

} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage();
    exit;
}
?>

