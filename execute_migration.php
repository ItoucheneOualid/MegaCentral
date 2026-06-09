<?php
// Migration script for idmegacentral database
// Execute via command line: php execute_migration.php

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "idmegacentral";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Connected successfully\n";

// Read SQL file
$sql_file = file_get_contents("c:/Users/itouc/Desktop/MegaCentral/backend/sql/migration_normalize_to_class_diagram.sql");

if (!$sql_file) {
    die("Could not read migration file\n");
}

// Split by semicolon and execute each statement
$statements = explode(";", $sql_file);

$success_count = 0;
$error_count = 0;

foreach ($statements as $statement) {
    $statement = trim($statement);
    if (empty($statement)) {
        continue;
    }
    
    if (strpos($statement, "--") === 0) {
        echo "Skipping comment: " . substr($statement, 0, 50) . "...\n";
        continue;
    }
    
    echo "\n> Executing: " . substr($statement, 0, 100) . "...\n";
    
    if ($conn->query($statement) === TRUE) {
        echo "  ✓ Success\n";
        $success_count++;
    } else {
        echo "  ✗ Error: " . $conn->error . "\n";
        $error_count++;
    }
}

echo "\n================================\n";
echo "MIGRATION COMPLETED\n";
echo "Successfully executed: $success_count statements\n";
echo "Errors: $error_count statements\n";
echo "================================\n";

// Verify migration results
echo "\nVERIFICATION RESULTS:\n";

$result = $conn->query("SELECT COUNT(*) as nb_clients FROM clients");
$row = $result->fetch_assoc();
echo "✓ Total clients: " . $row['nb_clients'] . "\n";

$result = $conn->query("SELECT COUNT(*) as nb_ventes FROM ventes");
$row = $result->fetch_assoc();
echo "✓ Total ventes: " . $row['nb_ventes'] . "\n";

$result = $conn->query("SELECT COUNT(*) as nb_ventes_avec_client FROM ventes WHERE client_id IS NOT NULL");
$row = $result->fetch_assoc();
echo "✓ Ventes with client_id: " . $row['nb_ventes_avec_client'] . "\n";

$conn->close();
echo "\nDone!\n";
?>
