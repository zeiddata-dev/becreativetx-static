<?php
/**
 * Handler for the "Upload Art" form (was WPForms #527).
 * Handles a required multipart file upload plus contact fields.
 * Pure vanilla PHP, no external libraries.
 */

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../upload-art.html');
    exit;
}

// A POST body bigger than the server limit arrives with empty $_POST/$_FILES,
// which would otherwise show a misleading "required field" error.
if (post_exceeded_limit()) {
    respond_error('Your upload was too large for the server to accept. Please reduce the file size and try again.');
}

$fields = form_fields();

// ---- Spam / honeypot ------------------------------------------------------
// [6] "File Company Name" is the original CSS-hidden WPForms honeypot (kept).
// "bctx_hp" is the extra honeypot injected into the static markup.
$honeypot = array(
    form_get($fields, array(6)),
    isset($_POST['bctx_hp']) ? $_POST['bctx_hp'] : '',
);
if (is_spam($honeypot)) {
    respond_success(); // accept silently, do not email
}

// ---- Collect fields -------------------------------------------------------
$first   = form_get($fields, array(10, 'first'));  // required
$last    = form_get($fields, array(10, 'last'));   // required
$company = form_get($fields, array(1));            // required
$email   = form_get($fields, array(2, 'primary'));   // required
$email2  = form_get($fields, array(2, 'secondary')); // required, must match
$phone   = form_get($fields, array(3));            // required
$comments = form_get($fields, array(5));

// ---- Validate required ----------------------------------------------------
$errors = array();
if ($first === '' || $last === '') {
    $errors[] = 'Your first and last name are required.';
}
if ($company === '') {
    $errors[] = 'Company name is required.';
}
if ($email === '' || !is_valid_email($email)) {
    $errors[] = 'A valid email address is required.';
}
if ($email2 === '' || $email !== $email2) {
    // Server-side replacement for the WPForms data-rule-confirm wiring.
    $errors[] = 'The two email addresses do not match.';
}
if ($phone === '') {
    $errors[] = 'Phone number is required.';
}
if (!isset($_FILES['wpforms_527_4']) || !isset($_FILES['wpforms_527_4']['error'])
    || $_FILES['wpforms_527_4']['error'] === UPLOAD_ERR_NO_FILE) {
    $errors[] = 'A file is required.';
}
if ($errors) {
    respond_error(implode(' ', $errors));
}

// ---- Store the uploaded file ----------------------------------------------
$err = '';
$saved = save_upload($_FILES['wpforms_527_4'], $GLOBALS['ALLOWED_UPLOAD_EXT'], $err);
if ($saved === null) {
    respond_error($err);
}

// ---- Build and send email -------------------------------------------------
$lines = array(
    'New art upload from the website',
    '===============================',
    'Name         : ' . $first . ' ' . $last,
    'Company      : ' . $company,
    'Email        : ' . $email,
    'Phone        : ' . $phone,
    '',
    'Additional Comments:',
    ($comments !== '' ? $comments : '(none)'),
    '',
    'Uploaded file:',
    '  Stored name : ' . $saved['name'],
    '  Original    : ' . $saved['original'],
    '  Location    : /uploads/' . $saved['name'],
    '',
    'The file is saved on the server (not attached to this email).',
    'Retrieve it from the /uploads/ folder over SFTP or hPanel File Manager.',
);
$body = implode("\n", $lines);

$sent = send_lead('Website art upload - ' . $company, $body, $email, $first . ' ' . $last);
if (!$sent) {
    respond_error('Your file was received but the notification email failed to send. Please call us to confirm receipt.');
}

respond_success();

// ---------------------------------------------------------------------------

function respond_success() {
    thank_you_page(
        'Thank you - your art was received',
        'Your files have been uploaded successfully and our team has been notified.'
    );
    exit;
}

function respond_error($message) {
    http_response_code(422);
    thank_you_page('There was a problem', htmlspecialchars($message, ENT_QUOTES), true);
    exit;
}

function thank_you_page($heading, $message, $is_error = false) {
    header('Content-Type: text/html; charset=UTF-8');
    $accent = $is_error ? '#D80F0F' : '#3961FF';
    echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>' . htmlspecialchars($heading, ENT_QUOTES) . '</title>';
    echo '<style>body{font-family:"Open Sans",Arial,sans-serif;background:#f8f8f8;color:#222;'
       . 'display:flex;min-height:100vh;margin:0;align-items:center;justify-content:center}'
       . '.card{background:#fff;max-width:520px;padding:48px 40px;border-radius:12px;'
       . 'box-shadow:0 30px 50px -10px rgba(0,0,0,.15);text-align:center}'
       . 'h1{color:' . $accent . ';font-size:24px;margin:0 0 12px}p{font-size:16px;line-height:1.5}'
       . 'a{display:inline-block;margin-top:24px;color:#3961FF;text-decoration:none;font-weight:600}</style>';
    echo '</head><body><div class="card"><h1>' . htmlspecialchars($heading, ENT_QUOTES) . '</h1>';
    echo '<p>' . $message . '</p>';
    echo '<a href="../upload-art.html">&larr; Back to the form</a></div></body></html>';
}
