<?php
/**
 * BNI Referral Builders Member Database - Master File
 * Combines all member data parts into a single searchable database
 */

class BNIMemberDatabase {
    private $members = [];
    
    public function __construct() {
        // Load all member data files
        $this->members = array_merge(
            include(__DIR__ . '/members.php'),
            include(__DIR__ . '/members_part2.php'),
            include(__DIR__ . '/members_part3.php'),
            include(__DIR__ . '/members_final.php')
        );
        
        // Add unique IDs and enhanced indexing
        foreach ($this->members as $index => &$member) {
            $member['id'] = $index + 1;
            $member['slug'] = $this->createSlug($member['company_name']);
            $member['search_text'] = $this->createSearchText($member);
        }
    }
    
    /**
     * Get all members
     */
    public function getAllMembers() {
        return $this->members;
    }
    
    /**
     * Get member by ID
     */
    public function getMemberById($id) {
        foreach ($this->members as $member) {
            if ($member['id'] == $id) {
                return $member;
            }
        }
        return null;
    }
    
    /**
     * Get member by company slug
     */
    public function getMemberBySlug($slug) {
        foreach ($this->members as $member) {
            if ($member['slug'] === $slug) {
                return $member;
            }
        }
        return null;
    }
    
    /**
     * Search members by keyword
     */
    public function searchMembers($query, $limit = null) {
        $query = strtolower(trim($query));
        if (empty($query)) {
            return $limit ? array_slice($this->members, 0, $limit) : $this->members;
        }
        
        $results = [];
        foreach ($this->members as $member) {
            if (strpos(strtolower($member['search_text']), $query) !== false) {
                $results[] = $member;
            }
        }
        
        return $limit ? array_slice($results, 0, $limit) : $results;
    }
    
    /**
     * Filter members by industry
     */
    public function filterByIndustry($industry) {
        $results = [];
        foreach ($this->members as $member) {
            if (stripos($member['industry'], $industry) !== false) {
                $results[] = $member;
            }
        }
        return $results;
    }
    
    /**
     * Filter members by category
     */
    public function filterByCategory($category) {
        $results = [];
        foreach ($this->members as $member) {
            if (stripos($member['category'], $category) !== false) {
                $results[] = $member;
            }
        }
        return $results;
    }
    
    /**
     * Get members by tags
     */
    public function getMembersByTag($tag) {
        $results = [];
        foreach ($this->members as $member) {
            if (in_array($tag, $member['tags'])) {
                $results[] = $member;
            }
        }
        return $results;
    }
    
    /**
     * Find referral matches based on keywords
     */
    public function findReferralMatches($keywords) {
        $matches = [];
        $keywords = is_array($keywords) ? $keywords : [$keywords];
        
        foreach ($this->members as $member) {
            $score = 0;
            foreach ($keywords as $keyword) {
                foreach ($member['referral_keywords'] as $ref_keyword) {
                    if (stripos($ref_keyword, $keyword) !== false) {
                        $score++;
                    }
                }
            }
            
            if ($score > 0) {
                $member['match_score'] = $score;
                $matches[] = $member;
            }
        }
        
        // Sort by match score
        usort($matches, function($a, $b) {
            return $b['match_score'] - $a['match_score'];
        });
        
        return $matches;
    }
    
    /**
     * Get all unique industries
     */
    public function getIndustries() {
        $industries = [];
        foreach ($this->members as $member) {
            if (!in_array($member['industry'], $industries)) {
                $industries[] = $member['industry'];
            }
        }
        sort($industries);
        return $industries;
    }
    
    /**
     * Get all unique categories
     */
    public function getCategories() {
        $categories = [];
        foreach ($this->members as $member) {
            if (!in_array($member['category'], $categories)) {
                $categories[] = $member['category'];
            }
        }
        sort($categories);
        return $categories;
    }
    
    /**
     * Get member statistics
     */
    public function getStats() {
        return [
            'total_members' => count($this->members),
            'industries' => count($this->getIndustries()),
            'categories' => count($this->getCategories()),
            'members_with_websites' => count(array_filter($this->members, function($m) { 
                return !empty($m['website']); 
            }))
        ];
    }
    
    /**
     * Create URL-friendly slug from company name
     */
    private function createSlug($name) {
        $slug = strtolower($name);
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);
        return trim($slug, '-');
    }
    
    /**
     * Create searchable text from member data
     */
    private function createSearchText($member) {
        $searchable = [
            $member['member_name'],
            $member['company_name'],
            $member['industry'],
            $member['category'],
            implode(' ', $member['services']),
            implode(' ', $member['customer_personas']),
            $member['ideal_referral_profile'],
            implode(' ', $member['tags']),
            implode(' ', $member['referral_keywords'])
        ];
        
        return implode(' ', $searchable);
    }
}

// Global instance
$bni_db = new BNIMemberDatabase();

/**
 * Helper functions for easy access
 */
function getBNIMembers() {
    global $bni_db;
    return $bni_db->getAllMembers();
}

function getBNIMember($id) {
    global $bni_db;
    return $bni_db->getMemberById($id);
}

function searchBNIMembers($query, $limit = null) {
    global $bni_db;
    return $bni_db->searchMembers($query, $limit);
}

function getBNIStats() {
    global $bni_db;
    return $bni_db->getStats();
}
?>