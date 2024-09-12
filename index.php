<?php
// Check if the GET request contains a 'name' parameter
if (isset($_GET['name'])) {
    $name = htmlspecialchars($_GET['name']);
    echo "Hello, " . $name . "!";
} else {
    echo "Hello, World!";
}
?>
