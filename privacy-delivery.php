<?php
declare(strict_types=1);
// Server-side gating: never let the HTML preload optional embeds or the booking SDK.
function lvPrivacyDelivery(string $document): string {
    $document = preg_replace('~<script\b[^>]*\bsrc=["\x27]https://sdk\.zenchef\.com/[^"\x27]*["\x27][^>]*>\s*</script>~i', '', $document);
    $document = preg_replace_callback('~<iframe\b[^>]*>~i', static function ($m) {
        $tag = $m[0];
        if (!str_contains($tag, 'data-consent-src=') && preg_match('~\bsrc="https://[^" ]+"~', $tag)) {
            $tag = preg_replace('~\bsrc=("https://[^" ]+")~', 'data-consent-src=$1', $tag, 1);
        }
        if (str_contains($tag, 'data-consent-src=') && !preg_match('~\bhidden(?:=|\s|>)~', $tag)) $tag = substr($tag, 0, -1) . ' hidden="">';
        return $tag;
    }, $document);
    foreach (['site','zenchef'] as $script) $document = preg_replace('~/assets/js/' . $script . '\.js(?:\?v=[^"\s<>]*)?~', '/assets/js/' . $script . '.js?v=20261006-privacy1', $document);
    if (!str_contains($document, 'data-privacy-style')) $document = str_replace('</head>', '<link data-privacy-style="" rel="stylesheet" href="/assets/css/analytics.css?v=20261006-privacy1"/></head>', $document);
    if (!str_contains($document, 'data-privacy-policy')) $document = str_replace('</body>', '<nav data-privacy-policy="" class="lv-privacy-footer"><a href="/confidentialite">Cookies &amp; Privacy — FR / EN</a></nav></body>', $document);
    return $document;
}
