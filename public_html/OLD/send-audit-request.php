<?php
header("Access-Control-Allow-Origin: *"); // Allows requests from any origin
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the posted data.
    $json = file_get_contents('php://input');
    $data = json_decode($json);

    // Validate and sanitize the data
    if (!isset($data->name) || !isset($data->email) || !isset($data->company) || !isset($data->challenge)) {
        http_response_code(400);
        echo json_encode(['message' => 'Incomplete data.']);
        exit();
    }

    $name = htmlspecialchars(strip_tags($data->name));
    $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
    $company = htmlspecialchars(strip_tags($data->company));
    $challenge = htmlspecialchars(strip_tags($data->challenge));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid email format.']);
        exit();
    }

    // Email configuration
    $recipient = "info@aichemist.agency";
    $subject = "New Automation Audit Request from $name";
    
    $email_content = "You have received a new Automation Audit request.\n\n";
    $email_content .= "Name: $name\n";
    $email_content .= "Company: $company\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Biggest Challenge:\n$challenge\n";

    $email_headers = "From: $name <$email>";

    // Send the email
    if (mail($recipient, $subject, $email_content, $email_headers)) {
        http_response_code(200);
        echo json_encode(['message' => 'Success! Your audit request has been sent.']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Oops! Something went wrong.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
}
?>