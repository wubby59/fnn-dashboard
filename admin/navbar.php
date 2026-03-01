<?php
include_once('db_config.php');

try {
    // connect to the database
    $conn = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PASSWORD, DB_OPTIONS);

    // Define and execute queries
    $queries = [
        "files_count" => "
            SELECT COUNT(DISTINCT file_name) AS count
            FROM files
            WHERE DATE(modification_date) = CURDATE() - INTERVAL 1 DAY
                OR DATE(modification_date) = CURDATE() - INTERVAL 8 DAY
                OR DATE(modification_date) = CURDATE() - INTERVAL 15 DAY
                OR DATE(modification_date) = CURDATE() - INTERVAL 22 DAY
                OR DATE(modification_date) = CURDATE() - INTERVAL 31 DAY;
        ",
        "system_stats_count" => "SELECT COUNT(DISTINCT computer_name) AS count FROM system_stats",
        "system_services_count" => "SELECT COUNT(DISTINCT service_name) AS count FROM system_services",
    ];

    $counts = [];

    foreach ($queries as $key => $query) {
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $counts[$key] = $stmt->fetchColumn();
    }

    // Return the results in a JSON object
    echo json_encode($counts);
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>

