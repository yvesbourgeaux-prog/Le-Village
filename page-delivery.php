<?php
declare(strict_types=1);
// Resize the same source images; keep originals available as error fallbacks.
function lvPageDelivery(string $document, string $lang, string $slug): string {
    $document = preg_replace_callback('~<img\b[^>]*>~i', static function ($match) {
        $tag = $match[0];
        if (str_contains($tag, 'srcset=') || !preg_match('~\bsrc="(https://assets\.zyrosite\.com/gnKoPAn3rxzY53IR/[^"?]+\.(?:png|jpg|jpeg|webp))"~i', $tag, $source)) return $tag;
        $original = html_entity_decode($source[1], ENT_QUOTES, 'UTF-8');
        $path = substr($original, strlen('https://assets.zyrosite.com/'));
        $logo = str_contains($original, '/chatgpt-image-22-nov.');
        $widths = $logo ? [200, 400] : [480, 960, 1440, 1920, 2560];
        $url = static fn($width) => 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,width=' . $width . ',quality=85,fit=scale-down/' . $path;
        $tag = str_replace($source[0], 'src="' . htmlspecialchars($url($logo ? 400 : 1440), ENT_QUOTES, 'UTF-8') . '"', $tag);
        $sizes = $logo ? '190px' : '(min-width: 1200px) 1200px, 100vw';
        $attributes = ' sizes="' . $sizes . '"';
        if (preg_match('~\bsizes="~', $tag)) {
            $tag = preg_replace('~\bsizes="[^"]*"~', 'sizes="' . $sizes . '"', $tag);
            $attributes = '';
        }
        $variants = array_map(static fn($width) => $url($width) . ' ' . $width . 'w', $widths);
        $attributes .= ' srcset="' . implode(', ', $variants) . '" data-lv-original-src="' . htmlspecialchars($original, ENT_QUOTES, 'UTF-8') . '"';
        return str_ends_with($tag, '/>') ? substr($tag, 0, -2) . $attributes . '/>' : substr($tag, 0, -1) . $attributes . '>';
    }, $document);
    $config = json_decode(file_get_contents(__DIR__ . '/tools/page-adjustments.json'), true);
    $heading = $config['headings'][$slug][$lang] ?? null;
    if (is_string($heading)) {
        $document = preg_replace_callback('~(<h1\b[^>]*>).*?</h1>~s', static function ($match) use ($heading) {
            $opening = preg_replace('~\sdata-i18n=(?:\x27[^\x27]*\x27|"[^"]*")~', '', $match[1]);
            return $opening . htmlspecialchars($heading, ENT_QUOTES, 'UTF-8') . '</h1>';
        }, $document, 1);
    }
    return $document;
}
