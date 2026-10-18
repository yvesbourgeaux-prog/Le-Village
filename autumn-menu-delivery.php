<?php
declare(strict_types=1);

/** Bring prebuilt localized pages into line with the autumn menu. */
function lvAutumnMenuDelivery(string $document, string $lang, string $slug): string {
    if ($slug === 'le-village-restaurant-haut-de-cagnes-sur-mer') {
        // The four thumbnails and the lightbox must point at the same autumn pages.
        $document = preg_replace_callback(
            '~https://assets\\.zyrosite\\.com/[^"\\s<>]*carte-avril-26_page-000([1-4])-[^"\\s<>]+\\.jpg~',
            static fn(array $m): string => '/assets/images/carte-automne-2026-' . (int)$m[1] . '.jpg',
            $document
        );
        $document = preg_replace(
            '~data-lv-original-src="/assets/images/carte-automne-2026-([1-4])\\.jpg"~',
            'data-lv-original-src="/assets/images/carte-automne-2026-$1.png"',
            $document
        );
        $document = preg_replace(
            '~/assets/js/lv-056b84595d24\\.js(?:\\?v=[^"\\s<>]*)?~',
            '/assets/js/lv-056b84595d24.js?v=20261018-automne',
            $document
        );
        // Some language packs have the inline lightbox list rather than the shared script.
        $document = preg_replace(
            '~(?<!data-lv-original-src=")/assets/images/carte-automne-2026-([1-4])\\.jpg(?="[,\\s])~',
            '/assets/images/carte-automne-2026-$1.png',
            $document
        );
        return $document;
    }
    if ($slug !== 'la-carte') return $document;

    $all = json_decode((string)file_get_contents(__DIR__ . '/i18n/autumn-menu-locales.json'), true);
    $translation = $all[$lang] ?? null;
    if (!is_array($translation)) return $document;
    $labels = $translation['labels'];
    $names = $translation['dishes'];
    $groups = [
        'entrees' => [1, [0,1,2]],
        'salades' => [2, [3]],
        'partager' => [3, [4,5]],
        'mer' => [4, [6]],
        'terre' => [5, [7,8,9]],
        'italie' => [6, [10,11,12,13,14]],
        'vegetarien' => [7, [1,2,5,15,16,10,11,17,12,13]],
    ];
    $prices = ['16','19','14','22','14','12','32','25','28','24','26','24','15','18','19','24','22','19,50'];
    $esc = static fn(string $s): string => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    foreach ($groups as $id => [$labelIndex, $items]) {
        $heading = $esc((string)$labels[$labelIndex]);
        $cards = '';
        foreach ($items as $index) {
            $cards .= '<div class="dish-container"><div class="dish-header"><h3 class="dish-title">'
                . $esc((string)$names[$index]) . '</h3><div class="dish-dots"></div><span class="dish-price">'
                . $prices[$index] . ' €</span></div></div>';
        }
        $replacement = '<h2 class="font-serif text-3xl md:text-4xl text-center text-village-dark uppercase tracking-widest mb-6">'
            . $heading . '</h2><div class="section-ornament"></div>' . $cards;
        $document = preg_replace_callback(
            '~(<section\\b[^>]*\\bid="' . preg_quote($id, '~') . '"[^>]*>).*?(</section>)~s',
            static fn(array $m): string => $m[1] . $replacement . $m[2],
            $document,
            1
        );
    }
    // The lunch formulas, desserts and drinks remain in their localized form.
    $document = preg_replace_callback(
        '~(<main\\b[^>]*>.*?<h1\\b[^>]*>).*?(</h1>)~s',
        static fn(array $m): string => $m[1] . $esc((string)$labels[0]) . $m[2],
        $document,
        1
    );
    foreach (['partager' => 3, 'salades' => 2] as $id => $index) {
        $document = preg_replace_callback(
            '~(<a\\b[^>]*href="#' . $id . '"[^>]*>).*?(</a>)~s',
            static fn(array $m): string => $m[1] . $esc((string)$labels[$index]) . $m[2],
            $document,
            1
        );
    }
    $document = preg_replace_callback(
        '~<script type="application/ld\\+json">([^<]+)</script>~',
        static function(array $m) use ($groups, $labels, $names, $prices, $lang): string {
            $schema = json_decode($m[1], true);
            if (!is_array($schema) || !isset($schema['@graph'])) return $m[0];
            foreach ($schema['@graph'] as &$entity) {
                if (($entity['@type'] ?? '') !== 'Menu') continue;
                $keep = array_slice($entity['hasMenuSection'] ?? [], -2);
                $sections = [];
                foreach ($groups as [$labelIndex, $items]) {
                    $entries = [];
                    foreach ($items as $index) {
                        $entries[] = [
                            '@type' => 'MenuItem', 'name' => $names[$index],
                            'offers' => ['@type' => 'Offer', 'price' => str_replace(',', '.', $prices[$index]), 'priceCurrency' => 'EUR']
                        ];
                    }
                    $sections[] = ['@type' => 'MenuSection', 'name' => $labels[$labelIndex], 'hasMenuItem' => $entries];
                }
                $entity['hasMenuSection'] = array_merge($sections, $keep);
                $entity['name'] = $labels[0];
            }
            unset($entity);
            return '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
        },
        $document
    );
    return $document;
}

