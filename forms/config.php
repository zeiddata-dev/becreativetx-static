<?php
/**
 * Shared configuration and helpers for the Be Creative static contact forms.
 *
 * Both quote.php and upload.php include this file.
 *
 * -------------------------------------------------------------------------
 * OPERATOR: FILL IN THE VALUES BELOW WITH YOUR HOSTINGER MAILBOX DETAILS.
 * -------------------------------------------------------------------------
 * Create a real mailbox in hPanel (Emails > Email Accounts) on the domain,
 * e.g. noreply@becreativetx.com, and use its credentials here.
 *
 * DELIVERABILITY NOTE:
 * Authenticated SMTP is STRONGLY PREFERRED over PHP mail(). mail() hands the
 * message to the local MTA with no authentication, which frequently lands in
 * spam or is rejected outright once SPF/DKIM/DMARC are enforced. This file
 * ships with mail() as the default because no SMTP library is installed
 * (PHPMailer is NOT present and Composer is not used). The SMTP_* constants
 * below are wired so that if/when an SMTP transport is added, the operator
 * only edits this one block. See DEPLOY.md Phase 4 for the mail fix.
 */

// ---- Recipient / sender ---------------------------------------------------

// Where form leads are delivered. Change to the real destination inbox.
define('TO_EMAIL', 'quotes@becreativetx.com');

// The envelope/header From. MUST be a mailbox that exists ON THIS DOMAIN so
// SPF/DKIM pass. Do NOT set this to the visitor's address (that fails SPF and
// is the top cause of form mail going to spam). The visitor's address is put
// in Reply-To instead so replies still reach them.
define('FROM_EMAIL', 'noreply@becreativetx.com');
define('FROM_NAME',  'Be Creative Website');

// ---- SMTP (optional, preferred) -------------------------------------------
// These are read only if USE_SMTP is true AND an SMTP transport is wired in.
// With the default vanilla-PHP mail() path they are informational only.
define('USE_SMTP',  false);            // set true once an SMTP sender is added
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_USER', 'noreply@becreativetx.com'); // full mailbox address
define('SMTP_PASS', '');                          // mailbox password
define('SMTP_PORT', 465);                         // 465 = SSL, 587 = STARTTLS

// ---- Uploads --------------------------------------------------------------

// Max accepted upload size in bytes. Default 25 MB.
// NOTE: the server's php.ini upload_max_filesize / post_max_size must be at
// least this large or large files are rejected by PHP before this code runs.
define('MAX_UPLOAD_BYTES', 25 * 1024 * 1024);

// Absolute path to the uploads directory (one level up from /forms).
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads');

// Allowed file extensions for artwork uploads.
$ALLOWED_UPLOAD_EXT = array(
    'pdf', 'png', 'jpg', 'jpeg', 'gif',
    'ai', 'eps', 'svg', 'psd', 'zip',
);

// Cap on the total size of everything already stored in /uploads. When the
// directory is at or over this, new uploads are refused until old lead files
// are cleared out (see the retention note in DEPLOY.md).
define('UPLOAD_QUOTA_BYTES', 512 * 1024 * 1024);

// Per-IP rate limit for upload attempts: at most this many stored files per
// window. Tracked with tiny marker files, no database needed.
define('UPLOAD_RATE_MAX', 10);
define('UPLOAD_RATE_WINDOW', 3600); // seconds

// ---------------------------------------------------------------------------
// Helpers below this line. No configuration needed.
// ---------------------------------------------------------------------------

/**
 * Read a nested value out of the posted wpforms[...] array structure without
 * tripping a fatal error when a bot posts garbage (e.g. wpforms=x).
 * Returns '' when any step of the path is missing or not an array.
 *
 * @param array  $root  Usually $_POST['wpforms']['fields'] guarded by caller.
 * @param array  $path  Ordered keys to descend, e.g. array(10, 'first').
 */
function form_get($root, array $path) {
    $cur = $root;
    foreach ($path as $key) {
        if (!is_array($cur) || !array_key_exists($key, $cur)) {
            return '';
        }
        $cur = $cur[$key];
    }
    return is_array($cur) ? $cur : trim((string) $cur);
}

/**
 * Return $_POST['wpforms']['fields'] as an array, or an empty array if the
 * client did not send the expected structure.
 */
function form_fields() {
    if (!isset($_POST['wpforms']) || !is_array($_POST['wpforms'])) {
        return array();
    }
    if (!isset($_POST['wpforms']['fields']) || !is_array($_POST['wpforms']['fields'])) {
        return array();
    }
    return $_POST['wpforms']['fields'];
}

/**
 * Strip CR/LF so a user-supplied value cannot inject extra mail headers.
 * Use on anything that ends up inside a header (Reply-To, Subject).
 */
function header_safe($value) {
    return trim(str_replace(array("\r", "\n", "%0a", "%0d"), '', (string) $value));
}

/**
 * Basic email sanity check for the Reply-To header.
 */
function is_valid_email($email) {
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Honeypot check. Rejects the submission if any named field is non-empty.
 * Pass the visible/hidden honeypot field values collected by the handler.
 * Returns true when the submission looks like spam.
 */
function is_spam(array $honeypot_values) {
    foreach ($honeypot_values as $v) {
        if (trim((string) $v) !== '') {
            return true;
        }
    }
    return false;
}

/**
 * Detect the case where the POST body exceeded the server's post_max_size.
 * When that happens PHP delivers empty $_POST AND empty $_FILES even though
 * the browser sent data, so ordinary "required field" checks would produce a
 * misleading message. Call this first on any handler that accepts uploads.
 */
function post_exceeded_limit() {
    return $_SERVER['REQUEST_METHOD'] === 'POST'
        && empty($_POST)
        && empty($_FILES)
        && isset($_SERVER['CONTENT_LENGTH'])
        && (int) $_SERVER['CONTENT_LENGTH'] > 0;
}

/**
 * Total bytes currently stored in the uploads directory (top level only,
 * which is the only place save_upload() writes).
 */
function upload_dir_bytes() {
    $total = 0;
    foreach ((array) @scandir(UPLOAD_DIR) as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        $path = UPLOAD_DIR . '/' . $entry;
        if (is_file($path)) {
            $total += (int) filesize($path);
        }
    }
    return $total;
}

/**
 * Per-IP rate limit using marker files under uploads/.ratelimit/.
 * Counts this IP's stored markers inside the window; expired markers from any
 * IP are pruned on the way through. Records a new marker when allowed.
 */
function upload_rate_ok() {
    $dir = UPLOAD_DIR . '/.ratelimit';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $ip     = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    $prefix = hash('sha256', $ip);
    $now    = time();
    $count  = 0;
    foreach ((array) @scandir($dir) as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        $path  = $dir . '/' . $entry;
        $mtime = (int) @filemtime($path);
        if ($now - $mtime > UPLOAD_RATE_WINDOW) {
            @unlink($path);
            continue;
        }
        if (strpos($entry, $prefix) === 0) {
            $count++;
        }
    }
    if ($count >= UPLOAD_RATE_MAX) {
        return false;
    }
    @touch($dir . '/' . $prefix . '_' . $now . '_' . bin2hex(random_bytes(3)));
    return true;
}

/**
 * Validate and store one uploaded file.
 *
 * @param array  $file  A single entry from $_FILES.
 * @param array  $allowed_ext  Lowercased allowed extensions.
 * @param string &$error  Set to a human message on failure.
 * @return array|null  On success: array('name' => stored filename,
 *                     'path' => absolute path, 'original' => original name).
 *                     On failure: null (and $error is set).
 */
function save_upload($file, array $allowed_ext, &$error) {
    // PHP-level upload errors (size, partial, no file, etc.).
    if (!isset($file['error']) || is_array($file['error'])) {
        $error = 'Invalid upload.';
        return null;
    }
    switch ($file['error']) {
        case UPLOAD_ERR_OK:
            break;
        case UPLOAD_ERR_NO_FILE:
            $error = 'No file was uploaded.';
            return null;
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            $error = 'The file is larger than the server allows.';
            return null;
        default:
            $error = 'The file could not be uploaded. Please try again.';
            return null;
    }

    // Confirm it really is an uploaded file (blocks path-traversal tricks).
    if (!is_uploaded_file($file['tmp_name'])) {
        $error = 'Upload verification failed.';
        return null;
    }

    if ($file['size'] > MAX_UPLOAD_BYTES) {
        $error = 'The file exceeds the ' . (MAX_UPLOAD_BYTES / (1024 * 1024)) . ' MB limit.';
        return null;
    }

    // Extension check (case-insensitive), based only on the final extension.
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if ($ext === '' || !in_array($ext, $allowed_ext, true)) {
        $error = 'That file type is not allowed.';
        return null;
    }

    // Build a safe, collision-resistant, non-traversable filename.
    $base = pathinfo($file['name'], PATHINFO_FILENAME);
    $base = preg_replace('/[^A-Za-z0-9_-]/', '-', $base);   // strip anything odd
    $base = trim($base, '-');
    if ($base === '') {
        $base = 'file';
    }
    $base = substr($base, 0, 60);
    $stored = date('Ymd-His') . '_' . bin2hex(random_bytes(4)) . '_' . $base . '.' . $ext;

    if (!is_dir(UPLOAD_DIR)) {
        @mkdir(UPLOAD_DIR, 0755, true);
    }

    // Abuse guards: refuse before writing anything to disk.
    if (!upload_rate_ok()) {
        $error = 'Too many uploads from your connection. Please try again later.';
        return null;
    }
    if (upload_dir_bytes() + (int) $file['size'] > UPLOAD_QUOTA_BYTES) {
        $error = 'Our upload storage is temporarily full. Please email your file instead.';
        return null;
    }

    $dest = UPLOAD_DIR . '/' . $stored;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        $error = 'The file could not be saved on the server.';
        return null;
    }

    return array(
        'name'     => $stored,
        'path'     => $dest,
        'original' => $file['name'],
    );
}

/**
 * Send the lead email. Default transport is PHP mail() with proper headers.
 *
 * To switch to authenticated SMTP (recommended): install a mailer, set
 * USE_SMTP = true above, and replace the mail() call in the SMTP branch.
 *
 * To ATTACH an uploaded file instead of just linking it: build a MIME
 * multipart/mixed body with the file base64-encoded and set the matching
 * Content-Type header. Left off by default because of message-size limits.
 */
function send_lead($subject, $body, $reply_to_email, $reply_to_name) {
    $subject = header_safe($subject);

    $headers   = array();
    $headers[] = 'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>';
    if ($reply_to_email !== '' && is_valid_email($reply_to_email)) {
        $rn = header_safe($reply_to_name);
        $re = header_safe($reply_to_email);
        // Quote the display name (RFC 5322): commas, dots etc. in values like
        // "Acme, Inc." would otherwise be parsed as an address-list separator.
        if ($rn !== '') {
            $rn = '"' . addcslashes($rn, "\\\"") . '"';
        }
        $headers[] = 'Reply-To: ' . ($rn !== '' ? $rn . ' <' . $re . '>' : $re);
    }
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = 'X-Mailer: PHP/' . phpversion();

    if (USE_SMTP) {
        // Placeholder for an authenticated SMTP transport. Until a mailer is
        // wired in this falls through to mail() so the form still works.
        // Replace this branch with your SMTP send using SMTP_HOST/USER/PASS/PORT.
    }

    // Fifth arg sets the envelope sender so bounces go to our domain mailbox.
    return mail(TO_EMAIL, $subject, $body, implode("\r\n", $headers), '-f' . FROM_EMAIL);
}
