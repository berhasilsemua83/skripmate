
import { Formula } from './types';

export const STORYTELLING_FORMULAS: Formula[] = [
  { id: 'explain-reveal-invite', label: 'Explain - Reveal - Invite' },
  { id: 'before-after-bridge', label: 'Before - After - Bridge' },
  { id: 'problem-agitate-solve', label: 'Problem - Agitate - Solve' },
  { id: 'feature-advantages-benefits', label: 'Feature - Advantages - Benefits' },
  { id: 'useful-useful-unique', label: 'Useful - Useful - Unique' },
  { id: 'attention-interest-desire-action', label: 'Attention - Interest - Desire - Action' },
  { id: 'problem-promise-prove', label: 'Problem - Promise - Prove' },
  { id: 'attention-problem-solution', label: 'Attention - Problem - Solution' },
  { id: 'problem-statistics-solution', label: 'Problem - Statistik - Solution' },
  { id: 'problem-grouping-solution', label: 'Problem - Grouping - Solution' },
  { id: 'problem-impact-solution', label: 'Problem - Impact - Impact - Solution' },
  { id: 'star-story-solution', label: 'STAR - Story - Solution' },
  { id: 'why-try-buy', label: 'Why - Try - Buy' },
  { id: 'failed-growth-success', label: 'Failed - Growth - Success' },
  { id: 'success-failed-insight', label: 'Success - Failed - Insight' },
  { id: 'feature-advantage-analogy', label: 'Feature - Advantage - Analogy' },
  { id: 'extreme-one-stop-solution', label: 'Extreme - One Stop Solution' },
  { id: 'solution-impact-problem', label: 'Solution - Impact - Problem' },
  { id: 'open-loop', label: 'Psychological Pull of Open Loops' },
];

export const RELATE_FORMULAS: Formula[] = [
    { id: 'mirror-relate', label: '1. Mirror Relate: Audiens merasa "bercermin" -> Ungkap alasan tersembunyi -> Insight (Gue banget)' },
    { id: 'hidden-truth', label: '2. Hidden Truth: Ungkap kebenaran/fakta emosional yang sering dipendam -> Validasi jujur' },
    { id: 'pain-relief', label: '3. Pain → Relief: Sentuh luka emosional -> Validasi (itu wajar) -> Jalan keluar/penguatan' },
    { id: 'we-are-same', label: '4. We’re the Same: Aku pernah mengalaminya -> Aku paham perasaanmu -> Kebersamaan (Selevel)' },
    { id: 'call-out', label: '5. Call Out Your People: Panggil kelompok spesifik (Introvert/Pekerja/Ibu/dll) -> Tantangan khas mereka' },
    { id: 'wish-told-me', label: '6. I Wish Someone Told Me: Pelajaran hidup/penyesalan -> Nasihat lembut untuk masa lalu' },
    { id: 'validation-healing', label: '7. Validation / Healing: Identifikasi luka -> Ucapkan kalimat apresiasi yang dirindukan audiens' },
    { id: 'know-feel-this', label: '8. I Know You Feel This: Baca pikiran/perasaan audiens -> Jelaskan penyebab -> Validasi' },
    { id: 'silent-pain', label: '9. Silent Pain: Luarnya tampak baik -> Mengungkap struggle di balik layar -> Empati' },
    { id: 'growing-up', label: '10. Growing Up Realization: Dulu vs Sekarang (Perubahan cara pandang saat dewasa)' },
    { id: 'soft-punch', label: '11. Soft Punch: Kenyataan pahit dengan nada lembut -> Penyadaran tanpa menghakimi -> Arah kebaikan' },
    { id: 'self-worth', label: '12. Self-Worth Reminder: Masalah bukan karena kurangnya dirimu -> Ingatkan nilai diri berharga' },
    { id: 'adult-friendship', label: '13. Adult Friendship: Realita pertemanan dewasa (Sibuk/Jarang main) -> Makna baru -> Nostalgia' },
    { id: 'overthinking-cycle', label: '14. Overthinking Cycle: Gambarkan siklus pikiran berputar -> Validasi normal -> Empati' },
    { id: 'unspoken-love', label: '15. Unspoken Love: Cinta/Rindu tak terungkap -> Alasan takut -> Konsekuensi emosional (Melankolis)' },
    { id: 'caring-too-much', label: '16. Caring Too Much: Lelahnya people pleaser (Terlalu peduli) -> Luka -> Ingatkan peduli diri sendiri' },
    { id: 'first-step', label: '17. First Step Relate: Takut memulai -> Validasi perasaan -> Dorongan motivasi tanpa memaksa' },
    { id: 'regret-growth', label: '18. Regret vs Growth: Identifikasi kesalahan/kegagalan -> Hikmah -> Fokus ke pelajaran (Bukan gagal tapi belajar)' },
    { id: 'quiet-hero', label: '19. The Quiet Hero: Apresiasi perjuangan diam-diam/pengorbanan tak terlihat (Memberi kekuatan)' },
    { id: 'healing-linear', label: '20. Healing Is Not Linear: Hari baik vs buruk -> Bagian proses -> Dorongan lanjut (Jangan merasa gagal)' },
];

export const SALES_CTA_TYPES = [
  'CTA Ajakan Lembut',
  'CTA Logika',
  'CTA Emosional',
  'CTA Rasa Penasaran',
  'CTA Sosial',
  'CTA Eksperimen',
  'CTA Hard Selling'
];

export const MODEL_REGIONS = [
    { id: 'east_asia', label: 'Asia Timur (Korea / Jepang)', prompt: 'East Asian facial features, Korean/Japanese aesthetic, fair skin, K-Drama style look' },
    { id: 'se_asia', label: 'Asia Tenggara (Indonesia)', prompt: 'Southeast Asian Indonesian facial features, warm skin tone, authentic Indonesian look' },
    { id: 'south_asia', label: 'Asia Selatan (India)', prompt: 'South Asian Indian facial features, beautiful tanned skin, Bollywood cinematic look' },
    { id: 'middle_east', label: 'Timur Tengah (Arab Saudi)', prompt: 'Middle Eastern Arabian facial features, sharp features, olive skin' },
    { id: 'africa_sub', label: 'Afrika Sub-Sahara (Nigeria)', prompt: 'Sub-Saharan African Nigerian facial features, beautiful dark skin, glowing complexion' },
    { id: 'africa_north', label: 'Afrika Utara (Mesir)', prompt: 'North African Egyptian facial features, golden olive skin' },
    { id: 'west_europe', label: 'Eropa Barat (Inggris)', prompt: 'Western European British facial features, caucasian, fair skin' },
    { id: 'south_europe', label: 'Eropa Selatan (Italia)', prompt: 'Southern European Italian facial features, Mediterranean look' },
    { id: 'latin_america', label: 'Amerika Latin (Brazil / Meksiko)', prompt: 'Latin American facial features, Brazilian/Mexican aesthetic, sun-kissed skin' },
    { id: 'oceania', label: 'Oceania (Australia)', prompt: 'Australian caucasian facial features, outdoorsy look, sun-kissed' },
];

export const CHARACTER_FRAMINGS = [
    { id: 'close_up', label: 'Close Up (Kepala)', prompt: 'Close-up shot focusing primarily on the face, neck, and shoulders. High detail on facial features.' },
    { id: 'half_body', label: 'Half Body (Setengah Badan)', prompt: 'Medium shot, showing the character from the waist up. Captures upper body outfit details and gestures.' },
    { id: 'full_body', label: 'Full Body (Seluruh Badan)', prompt: 'Full body wide shot, showing the character from head to toe, including shoes. The entire outfit must be visible.' },
];

export const LIPSYNC_FOCUS_OPTIONS = [
    'Auto Detect (AI Recommendation)',
    'Fashion Atasan (Top/Shirt)',
    'Fashion Bawahan (Pants/Skirt)',
    'Item di Pegang (Object in Hand)',
    'Ekspresi Wajah (Face/Service)'
];

export const TONES_OF_VOICE: string[] = ['Super Natural', 'Santai & Sopan', 'Ngobrol', 'Mengandung Hiperbola', 'Lucu & Menghibur', 'Melankolis & Emosional', 'Tegas & Memotivasi'];
export const TARGET_AUDIENCES: string[] = ['Pria', 'Wanita', 'Pria & Wanita', 'Gen Z', 'Millennials', 'Orang Tua', 'Pekerja Kantoran', 'Mahasiswa'];

export const MARKETPLACE_COMPLIANCE_LIST = `
DILARANG (BERISIKO) -> GANTI DENGAN (AMAN)
terbaik -> salah satu yang disukai banyak orang
nomor 1 -> termasuk produk favorit
paling ampuh -> bekerja sesuai kebutuhan
paling cepat -> hasil tiap orang berbeda
paling efektif -> bantu memaksimalkan penggunaan
paling murah -> harganya ramah kantong
termurah -> harga termasuk terjangkau
paling lengkap -> fiturnya cukup lengkap
paling bagus -> kualitasnya rapi dan nyaman
hasil instan -> hasil bisa berbeda-beda
hasil permanen -> hasil tergantung pemakaian
garansi pasti berhasil -> cocok untuk banyak orang
100% berhasil -> bantu mengoptimalkan fungsi
100% aman -> lebih nyaman digunakan
anti gagal -> banyak review positif
jaminan berhasil -> bantu mempermudah aktivitas
wajib punya -> cocok buat yang butuh produk ini
must have -> bisa jadi pilihan menarik
termurah se- -> salah satu opsi ekonomis
paling murah di TikTok -> harganya kompetitif
harga paling rendah -> harganya cukup masuk akal
banting harga -> penawaran menarik
murah banget -> harganya bersahabat
diskon terbesar -> promo yang lumayan membantu
harga tercantik -> harga cukup oke
kurus -> lebih ringan
gemuk -> berisi
obesitas -> berat di atas rata-rata
tirus -> bentuk wajah lebih ramping
pipi tembem -> pipi lebih penuh
pipi chubby -> pipi lebih penuh
berat badan -> bobot tubuh
menurunkan berat badan -> bantu mengelola bobot
menaikkan berat badan -> bantu memenuhi kebutuhan nutrisi
mengecilkan perut -> bantu merapikan area perut
mengecilkan lengan -> bantu memperindah tampilan lengan
membesarkan bokong -> memberi efek lebih berisi
membesarkan payudara -> memberi efek lebih penuh
mengecilkan paha -> bantu merapikan area paha
tinggi badan -> postur tubuh
menambah tinggi -> bantu mendukung postur
tubuh ideal -> tubuh yang nyaman buat kamu
tubuh sempurna -> versi terbaik dari diri sendiri
langsing instan -> tampilan lebih ramping
menyembuhkan -> membantu meredakan
mengobati -> membantu mengurangi ketidaknyamanan
terapi -> perawatan sederhana di rumah
menyembuhkan penyakit -> mendukung aktivitas harian
bebas penyakit -> menjaga kebersihan
obat kuat -> suplemen penunjang
obat pelangsing -> produk pendukung diet
obat pemutih -> produk pencerah
memutihkan -> mencerahkan bertahap
mencerahkan permanen -> efek cerah yang konsisten bila rutin
whitening permanen -> bantu menjaga kecerahan
aman untuk ibu hamil -> konsultasikan dulu bila perlu
aman untuk menyusui -> gunakan sesuai kebutuhan
untuk bayi baru lahir -> cocok untuk usia tertentu
cocok untuk anak-anak -> baca petunjuk penggunaan
jelek -> kurang rapi
item kulit -> kulit kurang merata
kusam parah -> kulit kurang cerah
muka rusak -> kulit sedang tidak stabil
muka berantakan -> kulit lagi kurang bagus
wajah hancur -> kulit butuh perhatian
bodoh -> kurang tepat
tolol -> kurang efektif
instan -> bekerja perlahan
seketika -> terlihat lebih cepat pada sebagian orang
permanen -> bisa bertahan lama bila rutin
menghilangkan jerawat 100% -> membantu merawat kulit berjerawat
menghilangkan noda hitam -> membantu menyamarkan noda
glowing instan -> memberikan tampilan lebih fresh
berubah drastis -> lebih rapi/smooth
transformasi ekstrem -> perubahan lebih terlihat
keranjang kuning -> keranjang bawah
keranjang oren -> keranjang bawah
`;

export const HOOKS: string[] = [
  "Diluar ekspektasi banget aku beli X… kirain bakal Y, ternyata…",
  "Ternyata orang yang Z itu pakenya X…",
  "Baru tau kalau ada X yang bisa Y…",
  "Kok ada sih orang mau X, padahal Y…",
  "Baru tau X ini dari kemarin, padahal berguna banget…",
  "Ternyata banyak yang belum tau soal X…",
  "Aku baru nyoba X kemarin, ternyata…",
  "Please… jangan beli X kalau belum lihat ini…",
  "Hari ini aku mau sharing pengalaman soal X…",
  "Hari ini aku mau eksperimen, kalau X apakah Y?",
  "Menurutku yang bikin X ini cukup menarik…",
  "Lumayan repot juga gara-gara beli X…",
  "Aku nemu 1 produk yang cocok buat Z…",
  "Cukup bagus sih produk X ini…",
  "Aku hampir kelewatan produk X ini…",
  "Dulu aku pikir X itu Y, tapi sekarang beda…",
  "Beginilah hasilnya setelah pakai X…",
  "Aku beli X lagi karena…",
  "Kalau kamu suka X, produk ini bisa jadi pilihan…",
  "Ini dia X yang aku pakai sekarang…",
  "Harga X ini cukup terjangkau menurutku…",
  "Ini pengalaman aku pakai X…",
  "Perlu diperhatikan kalau mau beli X, karena…",
  "Produk X ini lumayan populer…",
  "Kalau punya anak kecil, X ini bisa jadi pilihan…",
  "Yang sering Y, bisa coba X…",
  "Dalam jualan, harga mahal atau murah itu relatif tergantung nilai yang didapat…",
  "Ada beberapa feedback tentang X ini…",
  "Hari ini aku mau coba X dan sharing pengalaman…",
  "Stop scrolling kalau lagi nyari X…",
  "Produk kayak gini yang menarik buat dicoba…",
  "Temen-temen penasaran sama X ini…",
  "Sebenernya aku mau sharing pengalaman soal X…",
  "X lagi… tapi kali ini ada yang beda…",
  "Cukup hemat pakai X dibanding alternatif lain…",
  "Kalau HP kamu support Y, X ini bisa jadi pilihan…",
  "Nemu X yang harganya cukup bersaing…",
  "Pernah ngalamin Y? Nah X ini bisa jadi solusi…",
  "Hari ini aku mau bandingkan beberapa X…",
  "Kalau mau Y, pertimbangkan pakai X…",
  "Siapa tau kamu belum tau ada X kayak gini…",
  "Ini pengalaman jujur aku soal X…",
  "X ini punya kualitas yang cukup bagus…",
  "Coba pertimbangkan X kalau lagi nyari produk sejenis…",
  "Dengan budget terbatas, X ini bisa jadi pilihan…",
  "X ini harganya cukup kompetitif…",
  "Lagi ada promo untuk X…",
  "Ini kabar baik buat yang sering Y…",
  "Belum banyak yang tau ada X seperti ini…",
  "Harga X ini cukup terjangkau untuk kualitasnya…",
  "Coba pertimbangkan kualitas sebelum beli X…",
  "Cara supaya Y nggak kejadian lagi: pertimbangkan X…",
  "Dengan budget pas-pasan, ini bisa jadi solusi…",
  "Kebiasaan yang bisa diperbaiki: Y, coba pakai X…",
  "Kalau cocok sama kebutuhanmu, X ini bisa jadi pilihan…",
  "Saatnya tes X ini, apakah sesuai klaim?",
  "Pilih mana, sering bayar buat Y, atau investasi sekali untuk X?",
  "Harga X ini cukup mengejutkan…",
  "Diluar ekspektasi, X ini cukup terjangkau…",
  "Kompetisi di kategori X ini cukup ketat…",
  "Dari beberapa X yang aku coba, ini yang menurutku bagus…",
  "Nggak tau kenapa tapi aku cukup suka X ini…",
  "Harga terjangkau nggak selalu berarti kualitas jelek…",
  "Sekarang Y jadi lebih mudah dengan X…",
  "Siapa yang bisa lebih hemat dengan pakai X?",
  "Gimana kalau X bisa membantu kamu Y?",
  "Produk ini punya banyak review positif…",
  "X ini punya kualitas yang kompetitif…",
  "Kok bisa ada X dengan harga segini…",
  "Pengalamanku pakai X cukup positif…",
  "Menurutku X ini cukup membantu untuk Y…",
  "Penasaran nggak kalau X bisa Y?",
  "Gimana bisa ya X harganya segini…",
  "Coba pertimbangkan X kalau kebutuhanmu seperti ini…",
  "Apakah X bisa membantu kamu Y?",
  "Nggak nyangka X segini harganya…",
  "Contoh kalau produk bagus nggak harus mahal…",
  "Kalau nemu X harga segini, bisa jadi kesempatan bagus…",
  "Ada nggak sih X yang lebih bagus dari ini?",
  "Pengalaman aku pakai X cukup menarik…",
  "Anak-anak sepertinya suka X ini…",
  "Menurutku X ini termasuk yang bagus di kategorinya…",
  "Bisa jadi pilihan bagus buat kamu yang sering Y…",
  "Gara-gara X, pengalaman Y jadi lebih baik…",
  "Solusi buat kamu yang mau Y dengan budget terbatas…",
  "Ternyata dengan X bisa membantu untuk…",
  "Bisa menambah kenyamanan dengan X…",
  "Coba pertimbangkan X sebelum terlambat…",
  "X ini mulai banyak dipakai orang…",
  "Waktu yang tepat buat coba X…",
  "Kalau tau dari dulu ada X, mungkin aku nggak perlu repot Y…",
  "Pengalaman aku dengan X cukup memuaskan…",
  "Pernah nggak sih penasaran kenapa nggak coba X dari dulu?",
  "Dengan budget terbatas, kamu bisa coba X ini…",
  "Supaya Y nggak terulang, bisa coba pakai X…",
  "Setelah coba beberapa X, ini yang aku rekomendasikan…",
  "Bisa jadi pilihan kalau kamu sering Y…",
  "Aku pikir X ini biasa aja, ternyata cukup bagus…",
  "Kalau ada X, beberapa hal jadi lebih praktis…",
  "Alternatif yang lebih baik dari Y adalah X…",
  "Siapa bilang X mahal? Ini ada pilihan terjangkau…",
  "Banyak alasan kenapa X layak dicoba…",
  "Banyak orang sekarang beralih ke X…",
  "X ini bisa jadi tambahan yang berguna di rumah…",
  "Kalau kamu males ribet, X ini bisa jadi solusi…",
  "Karena X, sekarang aku bisa Y dengan lebih mudah…",
  "Yang jarang keluar rumah mungkin butuh X…",
  "Beberapa orang kaget dengan harga X…",
  "Akhirnya nemu juga X yang sesuai kebutuhan…",
  "Tinggal pilih: tetap dengan cara lama atau coba X ini…",
  "Kadang yang harganya terjangkau justru seperti X ini…",
  "Setelah pakai X, pengalamannya cukup positif…",
  "Ada yang masih ragu sama X?",
  "Aku beliin X ini buat keluarga dan responnya positif…",
  "Mau lebih hemat? Coba X…",
  "Penawaran X dengan harga segini cukup menarik…",
  "Aku tantang kamu coba X ini…",
  "Gaya hidup hemat bisa dimulai dari X…",
  "Yang belum nyoba mungkin belum paham nilai X…",
  "Kualitas bagus dengan harga bersaing… itu X…",
  "Kenapa nggak dari dulu aku coba X…",
  "Awalnya ragu… tapi setelah coba X pengalamannya bagus…",
  "X ini membantu aku untuk Y…",
  "Jangan-jangan kamu belum tau ada X ini…",
  "Mau Y tanpa ribet? Coba X…",
  "Masalah Y jadi lebih jarang setelah pakai X…",
  "Respon keluarga terhadap X ini positif…",
  "Kalau tau ada X dari dulu, mungkin lebih praktis…",
  "Pengalaman pakai X cukup modern…",
  "Bayangin aja, X ini harganya segini…",
  "Siapa yang tertarik dengan X harga segini…",
  "Belum pernah nemu X yang bisa Y seperti ini…",
  "Banyak yang bilang X ini worth it mencoba…",
  "Investasi sekali, manfaat jangka panjang… itu X…",
  "X ini bisa jadi tambahan yang berguna…",
  "Biarpun harganya terjangkau, X ini kualitasnya lumayan…",
  "Awalnya aku ragu, tapi ternyata X ini oke…",
  "Solusi hemat waktu dan tenaga? Coba X…",
  "Jangan nunda, coba X sekarang…",
  "Kalau ada pilihan produk terbaik, aku pilih X…",
  "Pengalaman pakai X terus positif…",
  "Cukup sekali coba untuk tau kualitas X…",
  "Banyak yang nyoba X dan kasih review bagus…",
  "Beberapa hal jadi lebih mudah gara-gara X…",
  "Kadang solusi datang dari produk seperti X…",
  "Sering Y? Coba pertimbangkan X…",
  "Yang aku butuhin tersedia di X ini…",
  "Pertimbangkan apakah kamu butuh X…",
  "Bukan cuma bagus, X ini juga praktis…",
  "Banyak yang nyoba dan memberikan feedback positif…",
  "Sejak ada X, pengalaman Y jadi lebih baik…",
  "Ini alasan kenapa banyak orang pilih X…",
  "X ini cukup berkualitas…",
  "Awalnya cuma iseng beli X, sekarang jadi langganan…",
  "Siapa sangka X bisa bikin beberapa hal lebih simpel…",
  "Agak kurang nyaman kalau kehabisan X…",
  "Nggak nyangka X bisa jadi solusi untuk Y…",
  "Banyak rumah tangga yang terbantu dengan X ini…",
  "Setelah pakai, kamu bakal paham kenapa X ini populer…",
  "Harga segini untuk X? Cukup kompetitif…",
  "Jangan sampai kehabisan, coba X sekarang…",
  "Banyak orang yang Z memilih X ini…",
  "Aku sharing pengalamanku: X…",
  "X ini jadi produk andalan aku…",
  "Awalnya cuma coba-coba, eh ternyata cocok sama X…",
  "Penawaran X dengan harga ini cukup menarik…",
  "Beberapa orang kaget X ini bisa Y…",
  "Banyak review yang sejalan tentang X…",
  "Aku beli X ini setelah pertimbangan…",
  "Jangan remehkan X, ini bisa sangat membantu…",
  "Pengalaman dengan X ini cukup unik…",
  "Banyak orang perlu tau soal X ini…",
  "Awalnya males, sekarang lebih rajin gara-gara X membantu…",
  "Kalau kamu mau lebih hemat, pertimbangkan X…",
  "Produk seperti X ini jarang ada promo…",
  "Pengalaman dengan X sejauh ini positif…",
  "Banyak yang setuju X ini bagus…",
  "Aku rekomendasikan X ini buat kamu…",
  "X ini membantu aku jadi lebih efisien…",
  "Banyak yang liat X ini langsung tertarik…",
  "Sejak punya X, beberapa hal jadi lebih mudah…",
  "Pengalaman aku dengan X cukup memuaskan…",
  "Setiap kali pakai X, hasilnya konsisten…",
  "X ini cocok buat yang sering Y…",
  "Awalnya nggak ngerti kegunaan X, sekarang paham manfaatnya…",
  "Mau hidup lebih praktis? Coba X…",
  "Banyak yang tau X dan kasih review positif…",
  "X ini jadi bagian rutinitas aku…",
  "Nggak nyangka produk sekompak X bisa seefektif ini…",
  "Masalah Y lebih mudah ditangani dengan X…",
  "Aku prefer pakai X dibanding cara lama…",
  "Kadang solusi cukup sederhana dengan X…",
  "Yang Z mungkin butuh X ini…",
  "Kalau nggak mau repot, pertimbangkan X…",
  "X ini bikin aku lebih produktif untuk Y…",
  "Aku cukup puas dengan X ini…",
  "X ini membantu pengeluaran jadi lebih efisien…",
  "Yang udah coba pasti paham nilai X…",
  "Sekarang aku paham kenapa X ini populer…",
  "Mau hidup lebih santai? X bisa membantu..",
  "Sejak pakai X, aku jadi lebih aware soal dampak pilihan kita ke lingkungan…",
  "Ternyata hidup lebih simpel bisa bikin kita lebih bahagia…",
  "Cerita tentang bagaimana X mengubah cara aku menghargai waktu bersama keluarga…",
  "Aku belajar bahwa konsumsi bertanggung jawab dimulai dari hal kecil seperti…",
  "Perjalanan aku mencari X yang ramah lingkungan dan ternyata…",
  "Kadang produk terbaik bukan yang paling mahal, tapi yang paling bermakna…",
  "Bagaimana X membantu aku mengurangi sampah dan ternyata lebih hemat juga…",
  "Aku pengen sharing kenapa aku beralih ke X dan dampaknya ke kehidupan sehari-hari…",
  "Ternyata keputusan kecil kita bisa punya dampak besar, contohnya…",
  "Sejak aware sama X, cara pandang aku berubah tentang konsumsi…",
  "Aku nggak nyangka pilihan sederhana seperti X bisa bikin aku merasa lebih baik…",
  "Cerita tentang perjalanan aku menemukan X yang selaras dengan nilai hidupku…",
  "Kadang kita butuh reminder bahwa kualitas hidup bukan soal kuantitas barang…",
  "Bagaimana X mengajarkan aku tentang konsumsi mindful…",
  "Aku belajar dari X bahwa produk bagus juga bisa bertanggung jawab sosial…",
  "Perjalanan aku mencoba hidup lebih sustainable dimulai dari…",
  "Ternyata dengan memilih X, aku bisa support komunitas lokal juga…",
  "Sejak kenal X, aku jadi lebih menghargai proses di balik produk yang kita pakai…",
  "Kadang cerita di balik X lebih menarik dari produknya sendiri…",
  "Bagaimana X membantu aku align antara nilai pribadi dengan pilihan konsumsi…",
  "Aku pengen cerita tentang brand yang peduli lebih dari sekadar profit…",
  "Ternyata memilih produk yang etis nggak harus mahal atau ribet…",
  "Sejak pakai X, aku merasa lebih connected dengan purpose hidupku…",
  "Cerita tentang bagaimana X berkontribusi ke komunitas dan kenapa itu penting…",
  "Aku belajar bahwa behind every product ada cerita manusia…",
  "Perjalanan aku menemukan X yang transparent soal proses produksinya…",
  "Kadang kita lupa bahwa pilihan kita punya suara, dan aku pilih X karena…",
  "Bagaimana X membuktikan bahwa bisnis bisa profitable sambil doing good…",
  "Aku pengen sharing kenapa aku peduli dengan supply chain dari X…",
  "Ternyata generasi kita lebih peduli dengan impact, bukan cuma harga…",
  "Sejak aware sama fair trade, aku mulai lebih selective, dan nemu X…",
  "Cerita tentang bagaimana X memberdayakan pengrajin lokal…",
  "Aku nggak nyangka dengan memilih X, aku bisa berkontribusi untuk pendidikan anak-anak…",
  "Kadang produk yang meaningful lebih memuaskan daripada yang sekadar murah…",
  "Bagaimana X mengubah perspektif aku tentang value for money…",
  "Aku belajar dari X bahwa sustainability bukan trend, tapi kebutuhan…",
  "Perjalanan aku mencari produk yang cruelty-free dan nemu X…",
  "Ternyata dengan memilih X, kita bisa vote untuk dunia yang lebih baik…",
  "Sejak kenal philosophy behind X, aku jadi lebih mindful dalam berbelanja…",
  "Cerita tentang brand yang walk the talk soal sustainability…",
  "Aku pengen cerita kenapa aku proud pakai X dan nilai yang mereka pegang…",
  "Kadang kita butuh produk yang reflect siapa kita dan apa yang kita yakini…",
  "Bagaimana X menginspirasi aku untuk lebih conscious dalam konsumsi…",
  "Aku belajar bahwa authentic brand punya cerita yang genuine, seperti X…",
  "Perjalanan aku menemukan X yang mission-nya align dengan concern aku…",
  "Ternyata produk dengan purpose bisa bikin kita feel good beyond function-nya…",
  "Sejak pakai X, aku merasa jadi part of something bigger…",
  "Cerita tentang bagaimana X membuat positive impact tanpa sacrificing quality…",
  "Aku nggak nyangka bisa nemuin X yang both good for me and good for others…",
  "Kadang small choice kita bisa create ripple effect, seperti memilih X…",
  "Bagaimana X membuka mata aku soal konsumsi yang lebih bertanggung jawab…",
  "Aku pengen sharing tentang brand yang transparent dan X salah satunya…",
  "Ternyata conscious living bisa dimulai dari hal sederhana seperti X…",
  "Sejak kenal X, aku jadi lebih appreciate craftsmanship dan human touch…",
  "Cerita tentang perjalanan X dari ide hingga jadi produk yang impactful…",
  "Aku belajar bahwa premium bukan soal mahal, tapi soal values, seperti X…",
  "Perjalanan aku mencari X yang packaging-nya environmentally friendly…",
  "Kadang kita butuh reminder bahwa setiap pembelian adalah voting, dan aku vote X…",
  "Bagaimana X membuktikan bahwa ethical business bisa sustainable dan profitable…",
  "Aku pengen cerita kenapa origin story X inspiring banget…",
  "Ternyata produk lokal seperti X punya kualitas yang nggak kalah dan impact-nya lebih terasa…",
  "Sejak aware sama carbon footprint, aku mulai pilih X yang locally sourced…",
  "Cerita tentang founder X dan kenapa mission mereka resonate dengan aku…",
  "Aku nggak nyangka dengan support X, aku juga support [cause] yang aku peduliin…",
  "Kadang authenticity lebih penting dari advertising, dan X proof-nya…",
  "Bagaimana X mengajarkan aku tentang balance antara quality, price, dan impact…",
  "Aku belajar dari X bahwa good business dimulai dari good intention…",
  "Perjalanan aku menemukan X yang empower women/communities…",
  "Ternyata dengan conscious choice seperti X, kita invest in better future…",
  "Sejak kenal X, aku jadi lebih curious tentang story behind products…",
  "Cerita tentang bagaimana X maintain quality sambil stay true to their values…",
  "Aku pengen sharing kenapa aku percaya with X's long-term vision…",
  "Kadang produk yang dibuat dengan intention beda energinya, seperti X…",
  "Bagaimana X menunjukkan bahwa profit dan purpose bisa go hand in hand…",
  "Aku belajar bahwa supporting X artinya supporting ecosystem yang lebih besar…",
  "Perjalanan aku dari unconscious consumer jadi lebih mindful, dan X bagian dari journey itu…",
  "Ternyata generasi kita demand more transparency, dan X deliver that…",
  "Sejak pakai X, aku merasa more aligned antara kata dan tindakan…",
  "Cerita tentang bagaimana X contribute to circular economy…",
  "Aku nggak nyangka bisa nemuin brand yang actually care beyond marketing, seperti X…",
  "Kadang simple living lebih fulfilling, dan X membantu aku realize that…",
  "Bagaimana X inspire aku untuk lebih intentional dalam setiap pilihan…",
  "Aku pengen cerita tentang impact measurement yang dilakukan X…",
  "Ternyata dengan memilih X, aku juga supporting innovation yang responsible…",
  "Sejak kenal X, aku jadi lebih appreciate slow living dan quality over quantity…",
  "Cerita tentang community yang dibangun X dan kenapa itu meaningful…",
  "Aku belajar dari X bahwa true luxury adalah sustainability…",
  "Perjalanan aku menemukan X yang zero waste dan ternyata lebih practical juga…",
  "Kadang kita butuh brand yang share our values, dan aku nemu itu di X…",
  "Bagaimana X prove bahwa doing good is good business…",
  "Aku pengen sharing kenapa aku bangga jadi part of X's community…",
  "Ternyata produk yang meaningful punya longer lifecycle dan emotional connection…",
  "Sejak aware sama impact, aku pilih X yang B-Corp certified…",
  "Cerita tentang transparency X soal sourcing dan production…",
  "Aku nggak nyangka dengan simple switch ke X, impact-nya bisa segede ini…",
  "Kadang best investment adalah yang aligned dengan our deepest values…",
  "Bagaimana X mengajarkan aku bahwa enough is a feast…",
  "Aku belajar dari X tentang responsible consumption tanpa sacrificing joy…",
  "Perjalanan aku menemukan X yang give back to society in meaningful ways…",
  "Ternyata happiness bukan dari having more, tapi from living aligned, dan X bagian dari itu…"
];

export const IDEA_ACTIONS = [
  "Cara memahami...",
  "Penjelasan sederhana tentang...",
  "Breakdown strategi...",
  "Tips praktis untuk...",
  "Kesalahan umum dalam...",
  "Ide kreatif untuk...",
  "Rahasia di balik...",
  "Panduan singkat...",
  "Fakta penting mengenai...",
  "Langkah-langkah memulai...",
  "Studi kasus tentang...",
  "Perbandingan antara...",
  "Mitos vs Fakta soal...",
  "Hack cepat untuk...",
  "Solusi jika kamu mengalami...",
  "Tutorial langkah demi langkah...",
  "Strategi rahasia...",
  "Bedah tuntas...",
  "Alasan kenapa kamu gagal...",
  "Cara termudah melakukan...",
  "Teknik ampuh untuk...",
  "Kebenaran tentang...",
  "Stop melakukan ini jika...",
  "Trik psikologi dalam...",
  "Cara expert melakukan...",
  "Behind the scene...",
  "Eksperimen sosial:...",
  "Review jujur...",
  "Apa yang terjadi jika...",
  "Jalan pintas untuk...",
  "Daftar wajib punya...",
  "Checklist sebelum...",
  "Hati-hati dengan...",
  "Bocoran tentang...",
  "Cara hack...",
  "Solusi malas untuk...",
  "Metode unik..."
];

export const IDEA_GOALS = [
  "agar mudah dipahami",
  "untuk pemula",
  "untuk meningkatkan hasil",
  "biar lebih efisien",
  "agar proses lebih cepat",
  "untuk inspirasi",
  "agar konten lebih menarik",
  "supaya tidak boncos",
  "agar lebih percaya diri",
  "biar nggak salah langkah",
  "untuk menghemat waktu",
  "supaya audiens lebih engage",
  "untuk omzet yang lebih tinggi",
  "biar langsung closing",
  "tanpa ribet",
  "walau gaptek",
  "biar terlihat profesional",
  "agar tidak menyesal",
  "untuk jangka panjang",
  "supaya viral",
  "agar lebih hemat budget",
  "tanpa pusing mikirin teknis",
  "biar kompetitor ketar-ketir",
  "untuk membangun personal branding",
  "biar tidak diremehkan",
  "agar hidup lebih tenang",
  "biar makin disayang pasangan",
  "supaya karir melesat",
  "untuk hasil yang konsisten",
  "biar gak boncos terus"
];

export const IDEA_ADDONS = [
  "lengkap dengan contoh",
  "plus template",
  "versi singkat",
  "disertai studi kasus",
  "tanpa modal besar",
  "cuma pakai HP",
  "dalam 5 menit",
  "untuk dicoba hari ini",
  "step-by-step",
  "versi low budget",
  "berdasarkan pengalaman pribadi",
  "data riset terbaru",
  "cocok untuk kaum rebahan",
  "versi update 2025",
  "dijamin work",
  "khusus pengguna Android/iOS",
  "metode ATM (Amati Tiru Modifikasi)",
  "tanpa perlu skill khusus",
  "bonus file PDF",
  "full praktek",
  "hanya modal kuota",
  "kurang dari 1 menit",
  "tanpa alat mahal",
  "versi anak sekolah/kuliah",
  "tanpa basa-basi"
];

export const VISUAL_GENRES = [
  "Photorealistic",
  "Cinematic",
  "Digital Art",
  "Semi-Realistic",
  "Anime",
  "3D Render",
  "Pixar-Style",
  "Game Character",
  "Illustration",
  "Vaporwave",
  "Synthwave",
  "Cyberpunk",
  "HUD Hologram",
  "Blueprint Style",
  "Oil Painting",
  "Watercolor",
  "Pencil Sketch",
  "Vintage Film",
  "Minimalist",
  "Abstract"
];

export const CAMERA_ANGLES = [
  "Close-up",
  "Medium Shot",
  "Long Shot",
  "Full Body",
  "Low Angle",
  "High Angle",
  "Top View / Drone",
  "Side Angle / Profile",
  "POV (Point of View)",
  "Isometric",
  "Dutch Angle",
  "Wide Angle",
  "Fisheye Lens",
  "Over-the-Shoulder"
];
