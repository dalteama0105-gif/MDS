<?php
if (!isset($_GET['url'])) {
    die("No URL specified.");
}

$url = $_GET['url'];

// Basic validation
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    die("Invalid URL.");
}

// Fetch content
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
// Ignore SSL verification for simplicity in this dev environment
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

$content = curl_exec($ch);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

// Set correct content type
header("Content-Type: $contentType");

// URL Parsing for relative link fixing
$parsedUrl = parse_url($url);
$baseUrl = $parsedUrl['scheme'] . '://' . $parsedUrl['host'];
// Handle paths like /foo/bar to make relative links work
$path = isset($parsedUrl['path']) ? dirname($parsedUrl['path']) : '';
if ($path == '/' || $path == '\\')
    $path = '';

// Basic Rewriting of Relative Links (src="/...", href="/...", src="./...", etc.)
// This is NOT perfect but handles common cases.
$content = preg_replace('/(src|href|action)="\//i', '$1="' . $baseUrl . '/', $content);
$content = preg_replace('/(src|href|action)=".\//i', '$1="' . $baseUrl . $path . '/', $content);

// Fix CSS imports specifically might need more complex regex, keeping it simple for now.

echo $content;
?>