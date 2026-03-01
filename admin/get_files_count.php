<?php

try {
    $host = '192.168.100.230';
    $dbname = 'reports';
    $username = 'root';
    $password = 'password';

    // connect to the database
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);

    $query = "
        SELECT COUNT(DISTINCT file_name) AS count
        FROM files
        WHERE DATE(modification_date) = CURDATE() - INTERVAL 1 DAY
            OR DATE(modification_date) = CURDATE() - INTERVAL 8 DAY
            OR DATE(modification_date) = CURDATE() - INTERVAL 15 DAY
            OR DATE(modification_date) = CURDATE() - INTERVAL 22 DAY
            OR DATE(modification_date) = CURDATE() - INTERVAL 31 DAY;
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute();

    $count = $stmt->fetchColumn();

    echo $count;
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}

