# BolKese frontend ve tasarım rehberi

Bu belge, BolKese arayüzünü geliştiren kişiler ve kodlama ajanları için mevcut frontend yapısını ve tasarım dilini açıklar. İnceleme tarihi: 4 Ekim 2026. Bilgiler kaynak koddan çıkarılmıştır; aşağıdaki geliştirme ilkeleri öneridir, henüz uygulanmamış özellikler mevcut davranış gibi değerlendirilmemelidir.

## 1. Projenin kapsamı ve dosya haritası

BolKese; altın, döviz, nakit ve özel varlık kategorilerini takip etmeye yönelik Türkçe bir portföy arayüzüdür. Mevcut uygulama tek bir genel bakış ekranından ve varlık ekleme/güncelleme pencerelerinden oluşur.

| Dosya | Sorumluluk |
| --- | --- |
| `frontend/package.json` | Bağımlılıklar ve `dev`, `build`, `preview` komutları |
| `frontend/package-lock.json` | Bağımlılıkların çözümlenen sürümleri |
| `frontend/vite.config.js` | Vite ve React eklentisi |
| `frontend/index.html` | Türkçe sayfa dili, viewport, başlık, açıklama, tema rengi ve favicon bağlantısı |
| `frontend/src/main.jsx` | `createRoot`, React `StrictMode`, `App` ve global CSS yüklemesi |
| `frontend/src/App.jsx` | Ekranın tamamı, yardımcı bileşenler, örnek veriler ve durum yönetimi |
| `frontend/src/styles.css` | Tasarım değişkenleri, bütün bileşen stilleri, animasyonlar ve responsive kurallar |
| `frontend/public/favicon.svg` | Cüzdan biçimindeki SVG marka simgesi |

Teknoloji: React, React DOM, Vite, `@vitejs/plugin-react` ve `lucide-react`. JavaScript/JSX ve ES modules kullanılır. Tailwind, Bootstrap, Sass, CSS Modules, CSS-in-JS, yönlendirme veya harici durum yönetimi kütüphanesi yoktur. `package.json` bağımlılıkları `latest` olarak tanımladığı için kesin sürüm bilgisi için kilit dosyasına bakılmalıdır.

## 2. Bileşenler ve veri akışı

Tüm React bileşenleri şu anda `App.jsx` içindedir; ayrı `components`, `pages` veya `hooks` dizinleri bulunmaz.

| Bileşen | İşlev ve temel CSS sınıfları |
| --- | --- |
| `App` | Uygulama kabuğu, yan menü, üst başlık, portföy özeti, varlık alanı, piyasa paneli ve mobil menü |
| `IconBadge` | Varlığa ait renkli Lucide ikonu; `.icon-badge`, `.icon-badge--small` |
| `Modal` | Ortak karartma katmanı, pencere, Escape ve dışarı tıklayarak kapatma; `.modal-layer`, `.modal-card` |
| `AddAssetModal` | Varlık türü seçimi ve kategori formu; `.preset-grid`, `.preset`, `.form-grid` |
| `UpdateAssetModal` | Miktar, fiyat, hızlı ekleme, hesaplanan toplam ve silme işlemi; `.quantity-panel`, `.quick-add`, `.calculated-total` |
| `EmptyState` | Varlık yokken gösterilen açıklama, CSS cüzdan çizimi ve kategori ekleme çağrısı |
| `AssetCard` | Kategori ikonu, kodu, adı, miktarı, toplam değeri ve fiyat değişimi; tamamı bir `button` |

`App` içinde `useState` ile `assets`, `modal`, `hidden`, `lastUpdated`, `toast` ve `activeNav` tutulur. Toplam değer ve günlük değişim `useMemo` ile hesaplanır. Varlıklar `useEffect` üzerinden `localStorage` içindeki `bolkese-assets-v2` anahtarına yazılır.

- `PRESETS`: Altın, USD, EUR, TRY ve diğer varlık için başlangıç adı, kodu, birimi, fiyatı, ikonu ve rengi.
- `MARKET_ITEMS`: Piyasa özetinin sabit örnek fiyatları ve değişim oranları.
- `iconMap`: Varlık türünü Lucide bileşenine eşler; bilinmeyen ikon için `Gem` kullanılır.
- Yeni kategori `crypto.randomUUID()` ile kimlik alır; miktarı ve değişimi sıfırdır. Oluşturulduktan sonra miktar güncelleme penceresi açılır.
- `modal`: `null`, `{ type: 'add' }` veya `{ type: 'update', asset }` biçimindedir.
- Başarı/bilgilendirme mesajı `.toast` ile gösterilir ve 2600 ms sonra kapanır.

### Mevcut davranışın sınırları

- Gerçek piyasa API'si veya backend bağlantısı yoktur. `refreshPrices`, TRY dışındaki kayıtlı varlıkların fiyatlarını rastgele değiştirir; sabit `MARKET_ITEMS` listesini güncellemez.
- “Varlıklarım”, “Piyasalar” ve “Ayarlar” seçimi aktif menü durumunu ve bilgilendirme mesajını değiştirir; farklı bir sayfa açmaz. Başlık ve genel bakış içeriği aynı kalır.
- Özet kartındaki 12 çubuk sabit yüksekliklerle çizilir; gerçek fiyat geçmişini göstermez. Grafik kütüphanesi kullanılmaz.
- Profil adı ve avatar harfleri kaynak kodda sabittir; oturum açma sistemi değildir.
- Bakiye gizleme, özet değerlerini ve varlık kartlarının parasal tutarlarını maskeler. Varlık miktarı, piyasa paneli ve düzenleme penceresindeki değerler gizlenmez; bu tercih kalıcı saklanmaz.
- “Dünden bugüne” tutarı kayıtlı miktar, mevcut fiyat ve değişim yüzdesinden türetilir; geçmiş portföy kayıtları bulunmaz.

## 3. Tasarımın genel karakteri

Görsel dil, açık gri-yeşil bir zemin üzerinde beyaz kartlar, koyu petrol renkli sabit menü ve koyu bir portföy özeti kullanır. Mint/turkuaz yeşili ana eylemleri ve olumlu durumları vurgular. Altın sarısı para çağrışımı ve dekoratif vurgu için, kırmızı olumsuz değişim ve silme işlemi için kullanılır.

Hiyerarşi: sayfa başlığı → büyük toplam bakiye → varlık kartları → yardımcı piyasa bilgileri. Tasarımın karakteristik parçaları ince kenarlıklar, yumuşak gölgeler, yuvarlatılmış köşeler, çizgisel ikonlar, küçük açıklama metinleri ve geniş bölüm aralıklarıdır. Gradient veya fotoğraf kullanılmaz. Arayüzün tamamı koyu tema değildir; koyu alanlar açık tema içindeki vurgu yüzeyleridir.

## 4. CSS mimarisi

`styles.css`, `main.jsx` üzerinden tek kez içe aktarılır ve global kapsamdadır. Dosya; font importu ve `:root`, temel stiller, masaüstü bileşenleri, modal/form, toast, animasyonlar, ekran genişliği kuralları ve azaltılmış hareket tercihi sırasıyla düzenlenmiştir.

- Anlamlı sınıf isimleri ve BEM benzeri varyantlar kullanılır: `.button--primary`, `.icon-badge--small`, `.preset--active`, `.modal-actions--between`.
- Menü seçiminde `.active`, modal açıkken `body.modal-open` kullanılır.
- Yerleşimde Flexbox ve CSS Grid birlikte kullanılır. Akışkan boyutlandırma için `min()`, `minmax()`, `clamp()` ve `calc()` vardır.
- Inline stiller mevcutta dinamik `--asset-color` ve dekoratif grafik çubuklarının `height` değerleri içindir.
- `.change-up` ve `.change-down` renklerinde `!important` vardır; azaltılmış hareket kuralı da `!important` kullanır. Yeni stillerde bunu varsayılan yaklaşım yapma.
- `color-mix()`, `backdrop-filter` ve `env(safe-area-inset-bottom)` kullanılır; hedef tarayıcıda bu özelliklerin görünümünü kontrol et.

## 5. Ana renk değişkenleri

Kaynak: `frontend/src/styles.css` içindeki `:root`.

| Değişken | Değer | Kullanım |
| --- | --- | --- |
| `--ink` | `#0b1f2a` | Yan menü zemini, ana başlıklar, güçlü metinler, hesaplanan toplam zemini |
| `--ink-soft` | `#314a55` | İkincil güçlü metin, form etiketi, yardımcı buton |
| `--muted` | `#71848b` | Açıklama, birim, fiyat etiketi ve yardımcı metin |
| `--canvas` | `#f3f7f6` | Ana sayfa zemini |
| `--surface` | `#ffffff` | Tanımlı beyaz yüzey değişkeni; mevcut kartlar çoğunlukla doğrudan `white` kullanır |
| `--line` | `#dde7e5` | Kart, ikon butonu ve seçim kutusu kenarlıkları |
| `--accent` | `#21b999` | Birincil eylem, marka simgesi, aktif ikon, canlı durum noktası |
| `--accent-dark` | `#11846f` | Açık zeminde yeşil metin/ikon, aktif mobil menü |
| `--accent-soft` | `#dcf7f0` | Açık yeşil yardımcı yüzey ve hover |
| `--gold` | `#e2ac43` | Piyasa başlığındaki `Sparkles` ikonu |
| `--danger` | `#d45760` | Düşüş, silme ve bildirim noktası |

Kök metin rengi ayrıca `#152a35` olarak tanımlıdır. `--shadow` renk dışındaki ortak değişkendir: `0 18px 50px rgba(18, 50, 61, 0.08)`.

### Bileşenlere özel önemli renkler

| Alan / durum | Değerler |
| --- | --- |
| Yan menü | Genel metin `#dbe7e7`; pasif menü `#a7b8bc`; aktif zemin `#173741`; hover `rgba(255,255,255,0.06)` |
| Profil avatarı | Zemin `#d1ebe5`; metin `#17383a` |
| Ana buton | Metin `#082820`; hover zemini `#28c9a7` |
| İkincil buton | Zemin `#eef4f3`; metin `--ink-soft` |
| Bakiye kartı | Zemin `#102e38`; kenarlık `#1a4650`; dekoratif daire `#164852`, kalın halka `#143d47` |
| Bakiye açıklaması | Etiket `#9ab4b7`; değişim açıklaması `#88a3a6`; senkronizasyon metni `#90a9ad` |
| Bakiye artış rozeti | Metin `#6be0c5`; zemin `rgba(33,185,153,0.13)` |
| Bakiye düşüş rozeti | Metin `#ff9298`; zemin `rgba(212,87,96,0.14)` |
| Grafik çubukları | Yeşil `#2ab89b`; her üçüncü çubuk `#dfad4b`; opaklık `0.72` |
| Kart/piyasa artışı | `.change-up`: `#188d76`; düşüş: `--danger` |
| Boş durum | Zemin `rgba(255,255,255,0.73)`; kesikli kenarlık `#c7d7d4` |
| Boş durum cüzdanı | Zemin `#dff5ef`; kenarlık `#bce6db` |
| Dekoratif madeni paralar | Sarı `#f2c96f` / `#f9dda0` / `#664813`; yeşil `#65d5bc` / `#a5eadb` / `#115444` (zemin/kenarlık/metin) |
| Varlık kartı hover / kod rozeti | Hover kenarlığı `#b8d4cf`; kod zemini `#f1f5f4` |
| Piyasa bilgi kutusu | Zemin `#edf9f6`; kenarlık `#d8f0ea`; metin `#65827d`; güçlü metin `#285b52` |
| Form girdisi | Zemin `#fbfcfc`; kenarlık `#dbe5e3`; focus zemini `white`, kenarlığı `--accent` |
| Seçili varlık türü | Zemin `#f2fbf8`; kenarlık `--accent` |
| Miktar paneli | Zemin `#f4f8f7`; kenarlık `#e2ebea`; miktar kontrolü kenarlığı `#cfe0dd` |
| Modal arka katmanı | `rgba(4, 18, 25, 0.63)` ve `blur(8px)` |
| Silme hover | `#fff1f2` |
| Toast | Zemin `#17343d`; kenarlık `#26505a`; metin `white` |
| Mobil | Sayfa zemini `#f6f9f8`; alt menü `rgba(255,255,255,0.96)`; pasif ikon/metin `#8a9b9f` |
| Favicon | Koyu `#0b1f2a`, yeşil `#29c7a8`, sarı `#f4bd50`; ana CSS renklerinden kısmen farklıdır |

Bu tablo ana paleti ve belirleyici bileşen renklerini kapsar. Küçük ayırıcılar ve yardımcı tonlar için CSS dosyası esas kaynaktır; bütün renkler henüz değişkenlere taşınmış değildir.

### Varlık renkleri ve ikonları

Kaynak: `App.jsx` içindeki `PRESETS` ve `iconMap`.

| Tür | Kod | Renk | Lucide ikonu |
| --- | --- | --- | --- |
| Gram Altın | `XAU` | `#D69A29` | `Coins` |
| Amerikan Doları | `USD` | `#159478` | `CircleDollarSign` |
| Euro | `EUR` | `#3867D6` | `Euro` |
| Türk Lirası | `TRY` | `#D6575D` | `Banknote` |
| Diğer Varlık | `VAR` | `#7C5CC4` | `Gem` |

`IconBadge`, rengi `style={{ '--asset-color': color }}` üzerinden alır. İkon rengi doğrudan bu değişkendir; zemin `color-mix(in srgb, var(--asset-color) 12%, white)`, kenarlık aynı rengin `%18` karışımıdır. Yeni bir varlık türünde bu yapıyı kullan; her tür için ayrı CSS sınıfı üretmek gerekmez.

## 6. Tipografi ve ikonografi

Fontlar CSS başındaki Google Fonts `@import` ile yüklenir:

- **DM Sans**: Genel metin, butonlar, form alanları ve açıklamalar. İstenen ağırlıklar: 400, 500, 600, 700.
- **Manrope**: Marka, başlıklar, bakiye, varlık toplamı ve miktar alanı gibi vurgulu değerler. İstenen ağırlıklar: 500, 600, 700, 800.
- Her iki ailede de yedek font `sans-serif` olur. Font yüklemesi dış ağ bağlantısına bağlıdır.
- Kök seviyede `font-synthesis: none` ve `text-rendering: optimizeLegibility` vardır. Bazı DM Sans metinleri CSS'te 800 ister; import listesinde DM Sans 800 bulunmaz.

| Öğe | Boyut / ağırlık / detay |
| --- | --- |
| Marka | Manrope 800, `1.3rem`, harf aralığı `-0.04em` |
| Sayfa başlığı | Manrope, `clamp(1.55rem, 2.2vw, 2rem)`; mobilde `1.48rem` |
| Üst küçük etiket | `0.68rem`, 800, `0.13em`, büyük harf |
| Bakiye | Manrope 700, `clamp(2.2rem, 5vw, 3.4rem)/1.1`, `-0.06em` |
| Mobil bakiye | `clamp(2rem, 10vw, 2.6rem)` |
| Bölüm başlığı | Manrope, `1.08rem`, `-0.04em` |
| Varlık toplamı | Manrope 700, `1.35rem/1.2`, `-0.035em` |
| Modal başlığı | Manrope, `1.35rem`; mobilde `1.18rem` |
| Birincil buton | `0.87rem`, 700 |
| Form etiketi / girdisi | `0.76rem`, 700 / `0.86rem` |
| Küçük yardımcı metin | Çoğunlukla `0.66rem–0.79rem` |

İkonlar `lucide-react` üzerinden çizgisel SVG olarak gelir. Menü ikonları genellikle 19–21 px, buton ikonları 17–21 px boyutundadır. `IconBadge` içinde normal ikon 22 px, küçük ikon 18 px ve `strokeWidth={1.9}` kullanılır. Boş durum çizimi CSS şekilleri, para karakterleri ve `WalletCards` birleşimidir; bitmap görsel değildir.

## 7. Yerleşim, ölçüler ve yüzeyler

Masaüstünde `.sidebar` solda sabit, `.main-area` onun sağındadır. Ana içerik üst başlık, bakiye kartı ve iki kolonlu içerik düzeni şeklindedir.

| Öğe | Mevcut ölçü ve davranış |
| --- | --- |
| Sayfa | `body` minimum genişlik `320px`, minimum yükseklik `100vh` |
| Yan menü | `248px`; padding `30px 20px 22px`; alt profil `margin-top: auto` ile aşağı taşınır |
| Ana alan | `width: min(1320px, calc(100% - 248px))`; sol marj `248px`; padding `28px clamp(28px, 4vw, 62px) 52px` |
| İçerik kolonları | `minmax(0, 1fr) 335px`; aralık `24px`; üst marj `31px` |
| Varlık kartları | İki eşit kolon, aralık `14px`; minimum yükseklik `186px`; padding `19px`; radius `16px` |
| Bakiye kartı | Minimum yükseklik `205px`; padding `clamp(26px, 4vw, 40px)`; radius `22px` |
| Piyasa paneli | Padding `22px`; radius `18px`; beyaz yüzey, ince kenarlık |
| Boş durum | Minimum yükseklik `340px`; padding `42px 24px 36px`; radius `18px`; kesikli kenarlık |
| Marka simgesi | `37×37px`; radius `12px 12px 12px 5px` |
| Birincil/ikincil buton | Minimum yükseklik `43px`; yatay padding `17px`; radius `11px` |
| İkon butonu | `42×42px`; radius `11px` |
| İkon rozeti | Normal `43×43px`, radius `12px`; küçük `36×36px`, radius `10px` |
| Modal | `width: min(590px, 100%)`; `max-height: calc(100vh - 40px)`; kendi içinde kaydırma; padding `28px`; radius `20px` |
| Tür seçimi | Beş eşit kolon; aralık `8px`; seçenek radius `12px` |
| Ekleme formu | Kolonlar `1.4fr 0.6fr`; aralık `16px`; input yüksekliği `45px`, radius `10px` |
| Miktar kontrolü | Kolonlar `48px 1fr 48px`; butonlar `48×48px`; input yüksekliği `58px` |
| Toast | Sağ ve alt boşluk `25px`; radius `12px` |

Boşluklar henüz bir spacing token sistemiyle yönetilmez. Sık tekrarlanan küçük aralıklar 7–11 px, kart aralıkları 14–24 px, geniş bölüm boşlukları 25–40 px civarındadır. Yeni bileşende en yakın mevcut bileşenin ölçülerini örnek al.

Gölgeler:

- Varlık hover: `var(--shadow)`.
- Bakiye kartı: `0 22px 60px rgba(11,31,42,0.16)`.
- Birincil buton: `0 8px 20px rgba(33,185,153,0.18)`; hover `0 10px 24px rgba(33,185,153,0.25)`.
- Modal: `0 30px 90px rgba(2,20,26,0.28)`.
- Toast: `0 16px 45px rgba(4,25,32,0.25)`.

Katman sırası: sidebar `z-index: 10`, mobil menü `40`, modal `100`, toast `120`. Bakiye kartında `isolation: isolate` ve dekoratif `::after` için `z-index: -1` vardır.

## 8. Responsive davranış

CSS masaüstünden küçük ekranlara doğru `max-width` kurallarıyla ilerler. Kurallar birikimli uygulanır; daha dar breakpoint önceki kuralların yalnızca belirtilen özelliklerini değiştirir.

| Ekran genişliği | Düzen |
| --- | --- |
| `>1060px` | 248 px yan menü; varlıklar ve 335 px piyasa paneli yan yana; varlıklar iki kolon |
| `≤1060px` | İçerik tek kolona döner; piyasa paneli alta iner; piyasa listesi üç kolon olur |
| `≤820px` | Yan menü 82 px olur; marka yazısı, menü metinleri/sayacı, güvenlik notu, ayarlar bağlantısı ve profil ayrıntıları gizlenir; ana alanın sol marjı 82 px olur |
| `≤640px` | Yan menü tamamen gizlenir; ana alan tam genişlik ve `20px 17px 104px` padding alır; varlık ve piyasa listeleri tek kolon olur; sabit alt menü görünür |

Mobil ayrıntıları:

- Bakiye kartı minimum `234px` yüksekliğe, `19px` radius'a geçer; grafik sağ altta mutlak konumlanır ve `45px` yüksekliğe iner.
- Üstteki kategori ekle butonu ve fiyat yenile metni `font-size: 0` ile görsel olarak saklanır; ikonlar korunur.
- Alt menü `78px` yüksekliğinde beş kolondur; ortadaki ekle butonu `49×49px`, dairesel ve `translateY(-17px)` ile yukarı taşınmıştır. Zeminde `blur(14px)` vardır.
- Modal ekranın altına yaslanan bir panel olur; genişlik `%100`, maksimum yükseklik `92vh`, radius `23px 23px 0 0` olur. Alt padding güvenli ekran alanını içerir.
- Tür seçimi üç kolona, form tek kolona döner. Ekleme modalının eylemleri `0.8fr 1.2fr` grid olur; güncelleme modalının eylemleri `column-reverse` ile dikey yerleşir.
- Toast sağdan/soldan `15px` ve alttan `92px` boşlukla mobil menünün üstünde gösterilir.
- `env(safe-area-inset-bottom)` mobil menü ve modalda kullanılır.
- Piyasa fiyat satırının `1060px` kuralındaki `grid-template-columns: 1fr auto` tanımı mobilde sıfırlanmaz; mevcut cascade değerlendirilirken buna dikkat edilmelidir.

## 9. Etkileşim, hareket ve erişilebilirlik

- Buton hover: `translateY(-1px)`, 160 ms geçiş; varlık kartı hover: `translateY(-2px)`, kenarlık ve gölgeyle 180 ms geçiş.
- Yan menü geçişi 180 ms; modal katmanı `fade-in` 160 ms; modal `modal-in` 200 ms (`translateY(12px) scale(0.98)` başlangıcı); toast `toast-in` 220 ms (`translateY(10px)` başlangıcı).
- `prefers-reduced-motion: reduce` animasyon/geçiş süresini `0.01ms` yapar ve animasyonu tek tekrara indirir.
- `button:focus-visible` ve `input:focus-visible`: `3px solid rgba(33,185,153,0.25)` outline, `2px` offset.
- Modal `role="dialog"`, `aria-modal="true"` ve başlığa bağlı `aria-labelledby` kullanır. Escape, kapatma butonu ve dış katmana tıklamak pencereyi kapatır. Açıkken `body` kaydırması kilitlenir.
- Ekleme formunda ilk input `autoFocus` alır. Modal içinde odağı hapsetme ve kapanınca tetikleyiciye geri verme uygulanmamıştır.
- Tür seçiminde `radiogroup`, `radio` ve `aria-checked` vardır; ok tuşlarıyla özel radio grubu gezinmesi uygulanmamıştır.
- Toast `role="status"` kullanır. Dekoratif grafik ve bazı ikon grupları `aria-hidden` ile saklanır.
- Yan menü 820 px altında yalnızca ikonlara düştüğünde düğmelerde ayrıca `aria-label` yoktur. Yeni veya değiştirilen ikon butonlarında erişilebilir adı koru.

## 10. Türkçe içerik ve sayı biçimleri

`index.html` dili `tr`, başlığı `BolKese — Varlık Takibi`, tarayıcı tema rengi `#0b1f2a` olarak tanımlıdır.

- `formatTRY`: `Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 })`.
- Gizlenmiş para değeri: `•••••• ₺`.
- `formatNumber`: Türkçe biçimlendirme ve en fazla dört ondalık basamak.
- `timeNow`: `Intl.DateTimeFormat('tr-TR')` ile saat/dakika; açık bir saat dilimi verilmediğinden tarayıcının saat dilimini kullanır.
- Yüzde gösterimleri mevcutta `toFixed(2)` kullandığı için noktalı ondalıktır. Varlık kartında yüzde işareti başta, piyasa panelinde sondadır; henüz tek bir yüzde biçimlendiricisi yoktur.
- Arayüzde “varlık”, “kategori”, “alış fiyatı”, “miktar” ve “portföy” terimleri kullanılır. Yeni metinleri Türkçe ve bu terminolojiyle yaz.

## 11. Sonraki geliştirmelerde izlenecek ilkeler

1. Önce `App.jsx` içindeki ilgili bileşeni ve `styles.css` içindeki sınıfı birlikte oku; breakpoint kurallarını da kontrol et.
2. Mevcut kapsam için React/JSX ve düz CSS yaklaşımını koru. Yeni bir UI/CSS kütüphanesi eklemeyi ayrı bir mimari karar olarak değerlendir.
3. Aynı semantik rol için mevcut renk değişkenini kullan. Yeni bir ortak renk gerekiyorsa `:root` içinde anlamlı bir değişken tanımla.
4. Yeni yüzeylerde beyaz/açık zemin, ince kenarlık ve mevcut radius ailesini kullan; ana eylemleri `button button--primary`, ikincil eylemleri `button button--ghost` ile eşleştir.
5. Lucide ikonlarını ve `IconBadge` yapısını yeniden kullan. Kategori rengi ile başarı/hata anlamını birbirine karıştırma.
6. Yeni varlık türünde `PRESETS` ve gerekirse `iconMap` güncellenir. Piyasa panelinde de gösterilecekse bağımsız `MARKET_ITEMS` kaydı ayrıca ele alınır.
7. Tekrarlanan arayüz büyüdüğünde bileşenleri ayırabilirsin; mevcut sınıf sözleşmesini, Türkçe metinleri ve responsive davranışı koru.
8. Demo fiyatları ve dekoratif grafiği gerçek veri gibi sunma; API entegrasyonunda yükleniyor, hata ve boş durumlarını ayrıca tasarla.
9. Formlara ve ikon butonlarına erişilebilir etiket ekle; mevcut focus stillerini ve azaltılmış hareket desteğini koru. Modal odak yönetimi mevcut yapının geliştirmeye açık bir kısmıdır.
10. Bu belgeyi frontend mimarisi, palet veya breakpoint değişiklikleriyle birlikte güncelle. Belgeyle uygulama çelişirse mevcut davranışı kaynak koddan doğrula.

## 12. Çalıştırma ve değişiklik doğrulama

Komutlar `frontend` klasöründen çalıştırılır:

```powershell
cd frontend
npm ci
npm run dev
```

Üretim derlemesi için `npm run build`, derlemeyi yerel görüntülemek için `npm run preview` kullanılır. `package.json` içinde test veya lint komutu tanımlı değildir.

Arayüz değişikliğinden sonra uygun kontrol kapsamı:

- Masaüstü, 1060 px/820 px/640 px eşiklerinin iki yanı ve 320–390 px dar ekranlarda taşma ve yerleşim.
- Boş portföy, dolu portföy, uzun kategori adı ve büyük parasal değerler.
- Kategori oluşturma, miktar/fiyat güncelleme, silme ve yenileme mesajları.
- Modalın açılması/kapanması, gövde kaydırma kilidi, klavye odağı ve mobilde kaydırılabilir içerik.
- Bakiye gizleme, pozitif/negatif değişim renkleri ve sayfa yenilendiğinde varlıkların geri gelmesi.
- Alt menü, toast ve modalın katman sırası; font yüklenmediğinde yedek font görünümü.

Bu belgenin hazırlanmasında kaynak dosyaları incelenmiştir; tarayıcıda görsel doğrulama veya işlevsel test yapıldığı iddia edilmez.
