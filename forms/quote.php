<?php
/**
 * Handler for the "Request a Quote" form (was WPForms #544).
 * Pure vanilla PHP, no external libraries.
 */

require __DIR__ . '/config.php';

// Only accept POST.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../request-a-quote.html');
    exit;
}

// A POST body bigger than the server limit arrives with empty $_POST/$_FILES.
if (post_exceeded_limit()) {
    respond_error('Your submission was too large. Please reduce the attached file size and try again.');
}

$fields = form_fields();

// ---- Spam / honeypot ------------------------------------------------------
// [1] "Pgs Size Size" is the original CSS-hidden WPForms honeypot (kept).
// "bctx_hp" is the extra honeypot injected into the static markup.
$honeypot = array(
    form_get($fields, array(1)),
    isset($_POST['bctx_hp']) ? $_POST['bctx_hp'] : '',
);
if (is_spam($honeypot)) {
    // Silently accept so the bot gets no signal, but do not email.
    respond_success();
}

// ---- Collect fields -------------------------------------------------------
$name_company = form_get($fields, array(23)); // required
$phone        = form_get($fields, array(37));
$email        = form_get($fields, array(28)); // required
$due_date     = form_get($fields, array(36));
$job_desc     = form_get($fields, array(2));
$quantity     = form_get($fields, array(7));
$num_pgs      = form_get($fields, array(38));
$sides        = form_get($fields, array(47));
$color        = form_get($fields, array(48));
$flat_size    = form_get($fields, array(39));
$folded_size  = form_get($fields, array(40));
$finished     = form_get($fields, array(41));
$cover        = form_get($fields, array(43));
$text_stock   = form_get($fields, array(44));
$binding      = form_get($fields, array(10));

// Checkbox [49][] arrives as an array; flatten to a readable string.
$bleeds_raw = form_get($fields, array(49));
$bleeds = is_array($bleeds_raw) ? implode(', ', $bleeds_raw) : (string) $bleeds_raw;

// ---- Validate required ----------------------------------------------------
$errors = array();
if ($name_company === '') {
    $errors[] = 'Name/Company is required.';
}
if ($email === '' || !is_valid_email($email)) {
    $errors[] = 'A valid email address is required.';
}
if ($errors) {
    respond_error(implode(' ', $errors));
}

// ---- Optional artwork upload (dropzone converted to a real file input) ----
$file_note = 'None';
if (isset($_FILES['wpforms_544_12']) && isset($_FILES['wpforms_544_12']['error'])
    && $_FILES['wpforms_544_12']['error'] !== UPLOAD_ERR_NO_FILE) {
    $err = '';
    $saved = save_upload($_FILES['wpforms_544_12'], $GLOBALS['ALLOWED_UPLOAD_EXT'], $err);
    if ($saved === null) {
        respond_error('Artwork upload problem: ' . $err);
    }
    $file_note = $saved['name'] . '  (stored at /uploads/' . $saved['name'] . ')';
}

// ---- Build and send email -------------------------------------------------
$lines = array(
    'New quote request from the website',
    '===================================',
    'Name/Company : ' . $name_company,
    'Phone        : ' . $phone,
    'Email        : ' . $email,
    'Due Date     : ' . $due_date,
    'Quantity     : ' . $quantity,
    '# of Pgs     : ' . $num_pgs,
    'Sides        : ' . $sides,
    'Color        : ' . $color,
    'Flat Size    : ' . $flat_size,
    'Folded Size  : ' . $folded_size,
    'Finished Size: ' . $finished,
    'Cover        : ' . $cover,
    'Text Stock   : ' . $text_stock,
    'Bleeds       : ' . $bleeds,
    '',
    'Job Description:',
    $job_desc,
    '',
    'Binding / Finishing Touches:',
    $binding,
    '',
    'Artwork file : ' . $file_note,
);
$body = implode("\n", $lines);

$sent = send_lead('Website quote request - ' . $name_company, $body, $email, $name_company);
if (!$sent) {
    respond_error('Sorry, the message could not be sent right now. Please call us or email us directly.');
}

respond_success();

// ---------------------------------------------------------------------------

function respond_success() {
    thank_you_page(
        'Thank you for your quote request',
        'We have received your request and will be in touch shortly.'
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
    echo '<a href="../request-a-quote.html">&larr; Back to the form</a></div></body></html>';
}
