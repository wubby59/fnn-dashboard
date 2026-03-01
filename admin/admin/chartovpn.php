<?php
try {
    // Database credentials
    $dbhost = '192.168.100.230';
    $dbuser = 'root';
    $dbpass = 'password';
    $dbname = 'reports';

    // Create PDO instance
    $pdo = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);

    // Prepare SQL query
    $stmt = $pdo->prepare("CALL dynamic_columns();");

    // Execute SQL query
    $stmt->execute();

    // Fetch data as associative array
    $yourDataArray = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Output data as JSON
    echo json_encode($yourDataArray);
} catch (PDOException $e) {
    // If an error occurs, print it
    echo 'Database error: ' . $e->getMessage();
}
?>

