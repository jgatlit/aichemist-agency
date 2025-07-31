<?php
/**
 * BNI Referral Builders API
 * Handles all data requests for the SPA
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../data/database.php';

// Simple router for API actions
$action = $_GET['action'] ?? 'getAll';

switch ($action) {
    case 'getMemberBySlug':
        $slug = $_GET['slug'] ?? '';
        $member = $bni_db->getMemberBySlug($slug);
        if ($member) {
            // Also find referral matches for this member
            $member['referral_matches'] = $bni_db->findReferralMatches($member['referral_keywords']);
            echo json_encode($member);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Member not found']);
        }
        break;

    case 'search':
        $query = $_GET['query'] ?? '';
        $results = $bni_db->searchMembers($query);
        echo json_encode($results);
        break;

    case 'getFilters':
        echo json_encode([
            'industries' => $bni_db->getIndustries(),
            'categories' => $bni_db->getCategories(),
        ]);
        break;

    case 'getAll':
    default:
        $members = $bni_db->getAllMembers();
        echo json_encode($members);
        break;
}