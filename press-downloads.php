<?php
// Called by the language router to keep existing packs aligned with the current PDFs.
if (!defined('LV_PRESS_PAGE')) { http_response_code(404); exit; }
function lvPressDownloadButtons(string $document, string $slug, string $lang): string {
    $releases = json_decode(file_get_contents(__DIR__ . '/tools/press-pdfs.json'), true);
    if (!in_array($slug, array_column($releases, 'slug'), true)) return $document;
    $labels = json_decode('{"fr": ["Dossier de Presse", "Télécharger le communiqué (PDF)"], "en": ["Press Kit", "Download PDF (French)"], "sv": ["Pressmapp", "Ladda ner PDF (franska)"], "da": ["Pressekit", "Download PDF (fransk)"], "nl": ["Persmap", "PDF downloaden (Frans)"], "de": ["Pressemappe", "PDF herunterladen (Französisch)"], "it": ["Kit stampa", "Scarica il PDF (francese)"], "es": ["Kit de prensa", "Descargar PDF (francés)"], "ja": ["プレスキット", "PDFをダウンロード（フランス語）"], "zh-CN": ["新闻资料包", "下载PDF（法语）"]}', true);
    $start = strpos($document, '<article');
    $end = strpos($document, '</article>', $start ?: 0);
    if ($start === false || $end === false) return $document;
    $article = substr($document, $start, $end + 10 - $start);
    $index = 0;
    $article = preg_replace_callback('~<a\b([^>]*class="[^"]*\binline-block\b[^"]*"[^>]*)>.*?</a>~s', function($match) use (&$index, $slug, $lang, $labels) {
        if ($index >= 2) return $match[0];
        $i = $index++;
        $attrs = preg_replace('~\s(?:data-i18n|href|download|type)=(["\']).*?\1~s', '', $match[1]);
        $href = $i === 0 ? '/' . $lang . '/dossier-presse' : '/assets/pdf/communiques/' . $slug . '.pdf';
        $key = substr(hash('sha256', $i === 0 ? 'Dossier de Presse' : 'Télécharger le communiqué (PDF)'), 0, 16);
        $mapping = htmlspecialchars(json_encode(['t' => ['0' => $key], 'a' => (object) []]), ENT_QUOTES, 'UTF-8');
        $download = $i === 1 ? ' download="' . $slug . '.pdf" type="application/pdf"' : '';
        return '<a' . $attrs . ' href="' . $href . '" data-i18n="' . $mapping . '"' . $download . '>' . htmlspecialchars($labels[$lang][$i], ENT_QUOTES, 'UTF-8') . '</a>';
    }, $article);
    return substr_replace($document, $article, $start, $end + 10 - $start);
}
