<?php

try {
    $host = '192.168.100.230';
    $dbname = 'reports';
    $username = 'root';
    $password = 'password';

    // connect to the database
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);

    $query = "
        SELECT file_name, min_modification_date, file_size
        FROM (
            SELECT file_name, MIN(modification_date) AS min_modification_date, file_size
            FROM files
            WHERE DATE(modification_date) = CURDATE() - INTERVAL 1 DAY
                OR DATE(modification_date) = CURDATE() - INTERVAL 8 DAY
                OR DATE(modification_date) = CURDATE() - INTERVAL 15 DAY
                OR DATE(modification_date) = CURDATE() - INTERVAL 22 DAY
                OR DATE(modification_date) = CURDATE() - INTERVAL 31 DAY
            GROUP BY file_name, file_size
        ) AS subquery  
        ORDER BY CASE WHEN file_name LIKE 'CCPDOCS-%' THEN 0 ELSE 1 END, min_modification_date;
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach($rows as $row){
        if (!isset($result[$row['file_name']])){
            $result[$row['file_name']] = [
                'file_name' => $row['file_name'],
                'values' => []
            ];
        }

        $result[$row['file_name']]['values'][] = "{$row['min_modification_date']},{$row['file_size']}";
    }

    echo json_encode(array_values($result), JSON_PRETTY_PRINT);

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}

$conn = null;

?>

