
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Si c'est une requête OPTIONS (preflight), on répond simplement avec 200 OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configuration de la base de données
$host = 'sql210.infinityfree.com';
$user = 'if0_39052950';
$pass = 'nO631eqsgTGgbET';
$db = 'omar';

// Connexion à la base de données
$conn = new mysqli($host, $user, $pass, $db);
$conn->set_charset('utf8mb4');

// Vérification de la connexion
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Erreur de connexion à la base de données: ' . $conn->connect_error
    ]);
    exit;
}

// Récupération de l'URI et de la méthode
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Journalisation des requêtes pour le débogage
$log_file = 'api_log.txt';
$log_message = date('Y-m-d H:i:s') . " - $method $uri\n";
file_put_contents($log_file, $log_message, FILE_APPEND);

// Route pour tester la connexion
if (strpos($uri, '/api/test-connection') !== false && $method === 'GET') {
    try {
        // Test simple pour vérifier que la connexion fonctionne
        $result = $conn->query("SELECT 1 as test");
        $row = $result->fetch_assoc();
        
        if ($row && $row['test'] == 1) {
            echo json_encode(['success' => true, 'data' => true, 'message' => 'Connexion à la base de données réussie']);
        } else {
            throw new Exception("Test de connexion échoué");
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'error' => 'Test de connexion échoué: ' . $e->getMessage()
        ]);
    }
    exit;
}

// Route pour exécuter une requête SQL
if (strpos($uri, '/api/query') !== false && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['query'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Requête SQL manquante']);
        exit;
    }
    
    // Journalisation de la requête SQL
    $log_sql = date('Y-m-d H:i:s') . " - SQL: " . $data['query'] . "\n";
    file_put_contents($log_file, $log_sql, FILE_APPEND);
    
    try {
        if (stripos($data['query'], 'select') === 0) {
            // Pour les requêtes SELECT
            $stmt = $conn->prepare($data['query']);
            
            if (!$stmt) {
                throw new Exception("Erreur de préparation: " . $conn->error);
            }
            
            if (isset($data['params']) && !empty($data['params'])) {
                $types = str_repeat('s', count($data['params']));
                $stmt->bind_param($types, ...$data['params']);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            
            if (!$result) {
                throw new Exception("Erreur d'exécution: " . $stmt->error);
            }
            
            $rows = [];
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            
            echo json_encode(['success' => true, 'data' => $rows]);
        } else {
            // Pour les requêtes INSERT, UPDATE, DELETE
            $stmt = $conn->prepare($data['query']);
            
            if (!$stmt) {
                throw new Exception("Erreur de préparation: " . $conn->error);
            }
            
            if (isset($data['params']) && !empty($data['params'])) {
                $types = str_repeat('s', count($data['params']));
                $stmt->bind_param($types, ...$data['params']);
            }
            
            $stmt->execute();
            
            if ($stmt->affected_rows >= 0) {
                echo json_encode([
                    'success' => true, 
                    'data' => [
                        'affected_rows' => $stmt->affected_rows,
                        'insert_id' => $stmt->insert_id
                    ],
                    'message' => 'Opération réussie'
                ]);
            } else {
                throw new Exception("Opération échouée: " . $stmt->error);
            }
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        
        // Journalisation de l'erreur
        $log_error = date('Y-m-d H:i:s') . " - ERREUR: " . $e->getMessage() . "\n";
        file_put_contents($log_file, $log_error, FILE_APPEND);
    }
    
    exit;
}

// Route par défaut si aucune route correspondante n'est trouvée
http_response_code(404);
echo json_encode([
    'success' => false, 
    'error' => 'Route non trouvée: ' . $uri,
    'available_routes' => [
        '/api/test-connection' => 'GET - Tester la connexion à la base de données',
        '/api/query' => 'POST - Exécuter une requête SQL'
    ]
]);
