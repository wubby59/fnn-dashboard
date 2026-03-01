<?php
// Database credentials
define('DB_HOST', '192.168.100.227');
define('DB_NAME', 'reports');
define('DB_USER', 'reports');
define('DB_PASSWORD', '$2y$10$GL7wSPeIMCBCaFm0nD76Eu1wr7Ci52Fj9BXXEFpN.W0yxIc9w/Pb2');
define('DB_OPTIONS', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);
?>

