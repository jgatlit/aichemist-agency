<?php
header('Content-Type: application/json');

$presetsFile = __DIR__ . '/data/presets.json';

// Ensure the data directory exists
if (!is_dir(dirname($presetsFile))) {
    mkdir(dirname($presetsFile), 0755, true);
}

// Function to read presets with file locking
function readPresets($file) {
    $handle = fopen($file, 'c+'); // Open for reading and writing; create if not exists
    if (!$handle) {
        error_log("Failed to open presets file: " . $file);
        return [];
    }
    flock($handle, LOCK_SH); // Acquire a shared lock
    $contents = stream_get_contents($handle);
    flock($handle, LOCK_UN); // Release the lock
    fclose($handle);

    if (empty($contents)) {
        return [];
    }
    return json_decode($contents, true) ?: [];
}

// Function to write presets with file locking
function writePresets($file, $data) {
    $handle = fopen($file, 'c+'); // Open for reading and writing; create if not exists
    if (!$handle) {
        error_log("Failed to open presets file for writing: " . $file);
        return false;
    }
    flock($handle, LOCK_EX); // Acquire an exclusive lock
    ftruncate($handle, 0); // Truncate the file to 0 length
    rewind($handle); // Rewind to the beginning of the file
    $result = fwrite($handle, json_encode($data, JSON_PRETTY_PRINT));
    flock($handle, LOCK_UN); // Release the lock
    fclose($handle);
    return $result !== false;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $presets = readPresets($presetsFile);
        // Group by device name and sort by timestamp
        $groupedPresets = [];
        foreach ($presets as $preset) {
            $deviceName = $preset['deviceName'] ?? 'Unknown Device';
            if (!isset($groupedPresets[$deviceName])) {
                $groupedPresets[$deviceName] = [];
            }
            $groupedPresets[$deviceName][] = $preset;
        }

        // Sort presets within each device group by timestamp (newest first)
        foreach ($groupedPresets as $deviceName => $list) {
            usort($groupedPresets[$deviceName], function($a, $b) {
                return ($b['timestamp'] ?? 0) - ($a['timestamp'] ?? 0);
            });
        }
        echo json_encode($groupedPresets);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!isset($input['deviceName']) || !isset($input['presetName']) || !isset($input['config'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing deviceName, presetName, or config']);
            exit();
        }

        $presets = readPresets($presetsFile);
        $input['timestamp'] = time(); // Add current timestamp
        $presets[] = $input; // Add new preset

        if (writePresets($presetsFile, $presets)) {
            echo json_encode(['message' => 'Preset saved successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save preset']);
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!isset($input['deviceName']) || !isset($input['presetName'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing deviceName or presetName']);
            exit();
        }

        $presets = readPresets($presetsFile);
        $found = false;
        foreach ($presets as &$preset) {
            if (($preset['deviceName'] ?? '') === $input['deviceName'] && ($preset['presetName'] ?? '') === $input['presetName']) {
                $preset['hidden'] = true; // Soft delete
                $found = true;
                break;
            }
        }

        if ($found && writePresets($presetsFile, $presets)) {
            echo json_encode(['message' => 'Preset deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Preset not found or failed to delete']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        break;
}
?>