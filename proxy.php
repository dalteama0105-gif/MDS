<?php
// Simple Proxy for MDS
// Usage: proxy.php?url=http://example.com

if (!isset($_GET['url'])) {
    die("No URL specified.");
}

$url = $_GET['url'];

// basic security check
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    die("Invalid URL.");
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Allow self-signed certs for testing
curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Don't hang forever

// Enhanced Fake user agent
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

$content = curl_exec($ch);
$info = curl_getinfo($ch);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    die("Proxy Error: " . $error);
}

// Rewriting Relative URLs (Basic)
$base_url = $info['url'];
$base_parts = parse_url($base_url);
$root = $base_parts['scheme'] . '://' . $base_parts['host'];

// Correct basic relative paths for assets
$content = preg_replace('/(src|href)="\/([^"])/i', '$1="' . $root . '/$2', $content);
// Fix protocol-relative URLs
$content = preg_replace('/(src|href)="\/\//i', '$1="https://', $content);

// Allow framing by removing X-Frame-Options (simulated in proxy output)
header_remove("X-Frame-Options");
header_remove("Content-Security-Policy");

$contentType = $info['content_type'];
header("Content-Type: $contentType");

echo $content;
?>