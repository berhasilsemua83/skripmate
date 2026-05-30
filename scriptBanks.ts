// scriptBanks.ts
// Semua item bank dipisah jadi array terstruktur.
// Gunakan pickSubset() untuk ambil N item acak sebelum dikirim ke model.

// ─── TIPE ────────────────────────────────────────────────────────────────────

export interface BankSection {
  label: string;
  items: string[];
}

export interface SelectedBanks {
  bahasPromo: BankSection[];   // subset dari BANK BAHAS PROMO
  perbandingan: BankSection[]; // subset dari BANK PERBANDINGAN
  cta: BankSection[];          // subset dari BANK CTA (selalu full, biar CTA tetap valid)
  bridging: string[]; 
}

// ─── ENUMERASI DINAMIS ───────────────────────────────────────────────────────
// Generate teks enumerasi sesuai qty produk, bukan hardcoded.

const ANGKA   = ['1','2','3','4','5','6','7','8','9','10'];
const HARI    = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
const BULAN   = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const WAKTU   = ['Pagi','Siang','Sore','Malem'];
const MINGGU  = ['Minggu 1','Minggu 2','Minggu 3','Minggu 4'];

export const BANK_BRIDGING: string[] = [
  "Makanya, mumpung lagi murah parah, ini saatnya kamu cobain buat ngatasin...",
  "Kapan lagi kan dapet harga segini tapi kualitasnya beneran ngebantu masalah...",
  "Jujur aja, dengan harga segitu dapet manfaat kayak gini tuh overvalue banget. Apalagi buat kamu yang...",
  "Daripada nyesel pas harganya naik, mending amankan sekarang. Lagian ini pas banget buat...",
  "Coba bayangin, dengan receh segitu kamu udah dapet solusi praktis buat...",
  "Makanya aku berani rekomen, karena selain murah, ini beneran ngefek buat...",
  "Nah, mumpung lagi ada penyesuaian harga, ini momen paling pas buat kamu yang pengen..."
];
/**
 * Buat item TEKNIK HITUNG dinamis sesuai qty.
 * qty = jumlah pcs produk yang sebenarnya.
 * Jika qty > panjang array referensi, fallback ke max array.
 */
function buildEnumerasiItems(qty: number): string[] {
  const q = Math.max(1, qty);

  // Angka: 1, 2, 3 — dapet Q pcs
  const angkaSlice  = ANGKA.slice(0, Math.min(q, ANGKA.length));
  const hariSlice   = HARI.slice(0, Math.min(q, HARI.length));
  const bulanSlice  = BULAN.slice(0, Math.min(q, BULAN.length));
  const waktuSlice  = WAKTU.slice(0, Math.min(q, WAKTU.length));
  const mingguSlice = MINGGU.slice(0, Math.min(q, MINGGU.length));

  const items: string[] = [];

  // Hanya tambahkan item yang relevan dengan qty
  if (q <= ANGKA.length) {
    items.push(
      `${angkaSlice.join(', ')} — dapet ${q} pcs semurah ini, kalau beli satuan udah habis [harga]!`
    );
  }

  if (q <= HARI.length) {
    items.push(
      `${hariSlice.join(', ')} — ${q} hari bisa ganti-ganti, harganya cuma [harga]!`
    );
  }

  if (q <= BULAN.length) {
    items.push(
      `${bulanSlice.join(', ')} — ${q} bulan pakai terus, modalnya cuma [harga] sekali bayar!`
    );
  }

  if (q <= WAKTU.length) {
    items.push(
      `${waktuSlice.join(', ')} — ${q}x pakai sehari, harganya nggak nyampe [harga]!`
    );
  }

  if (q <= MINGGU.length) {
    items.push(
      `${mingguSlice.join(', ')} — sebulan penuh cukup ${q} produk ini!`
    );
  }

  // Fallback kalau qty terlalu besar untuk semua enumerasi di atas
  if (items.length === 0) {
    items.push(`Dapet ${q} pcs semurah ini — kalau beli satuan udah habis [harga]!`);
  }

  return items;
}

/**
 * Buat item TEKNIK BAGI / PER UNIT dinamis sesuai qty.
 */
function buildPerUnitItems(qty: number): string[] {
  const q = Math.max(1, qty);
  return [
    `Ini ${q} pcs, dibagi ${q} — per satuannya cuma kena [harga per pcs]. Murah parah!`,
    `Harganya [total], isinya ${q} buah — berarti satu biji cuma [hasil bagi]. Nggak ada yang bisa ngalahin!`,
    `Kalau dihitung per hari, kamu cuma keluar [harga per hari] — lebih murah dari parkir!`,
    `Per bulan cuma [harga/bulan], itu lebih murah dari segelas kopi kekinian!`,
    `Dibagi 30 hari, per harinya cuma [harga] — bahkan receh pun bisa!`,
    `Ini isinya ${q} pcs, tiap hari ganti, awetnya sampai [X] minggu — bayarnya sekali saja!`,
  ];
}

/**
 * Buat item TEKNIK KELIPATAN / BUNDLE dinamis sesuai qty.
 */
function buildBundleItems(qty: number): string[] {
  const q = Math.max(1, qty);
  return [
    qty === 2
      ? `Beli 1 gratis 1 — berarti kamu bayar setengah harga!`
      : `Bundle isi ${q}, harga di bawah [harga] — kalau beli satuan udah [harga x${q}]. Selisihnya gede!`,
    `Ini paket ${q} in 1 — biasanya beli sendiri-sendiri abis [total harga], sekarang cuma [harga bundle]!`,
    `Dapet ${q} pcs dengan harga segitu — kalau dibagi, masing-masing cuma [harga per pcs]. Gila!`,
    `Isi ${q}, harga [harga] — satu set lengkap tanpa perlu mikir lagi berbulan-bulan!`,
  ];
}

// ─── BANK BAHAS PROMO ────────────────────────────────────────────────────────
// Section statis tidak bergantung qty — pakai const biasa.
// Section enumerasi/per-unit/bundle di-generate dinamis via buildBankBahasPromo(qty).

const BANK_BAHAS_PROMO_STATIC: BankSection[] = [
  {
    label: "URGENSI WAKTU",
    items: [
      "Mumpung lagi ada promo, diskon sampai [X]% — jangan sampai nyesel lewatin ini!",
      "Hari ini saja nih promonya, besok udah normal lagi harganya!",
      "sepertinya Promo ini nggak bakal balik lagi, sekarang atau nyesel selamanya!",
      "Tinggal [X] item lagi nih stoknya, siapa cepat dia yang dapat!",
      "Ini promo akhir bulan, bulan depan belum tentu ada lagi!",
      "aku kasih tau sekarang karena promonya bentar lagi habis — jangan tunda!",
      "Kalau nunggu gajian, bisa-bisa promonya udah keburu kelar duluan!",
    ],
  },
  {
    label: "KEJUTAN HARGA",
    items: [
      "Gila sih ini, harganya drop banget — dari [harga asli] jadi cuma [harga promo]!",
      "Nggak nyangka bisa dapet harga segini, biasanya mahal banget!",
      "Ini mah bukan diskon biasa, ini literally setengah harga!",
      "Duit [harga promo] dapet barang seharga [harga asli]? Ini namanya rejeki!",
      "Aku kira salah liat, tapi beneran nih harganya segitu — murah parah!",
      "Kalau dihitung-hitung, hemat [selisih harga] cuma dari satu klik!",
      "Ini harga pabrik atau gimana? Kok bisa semurah ini sih?!",
      "Jujur, harga segini bahkan lebih murah dari yang aku temuin di mana-mana!",
      "Diskonnya [X]% — itu udah setara beli [barang lain], gratis!",
    ],
  },
  {
    label: "RELATABLE / EMOSIONAL",
    items: [
      "Yang udah lama incarin ini, sekarang waktunya beli — promonya pas banget!",
      "Aku juga baru tau nih promonya, langsung share biar kalian nggak ketinggalan!",
      "Kalau aku sih nggak bakal nunggu lagi kalau udah ada promo kayak gini!",
      "Ini persis yang aku cari-cari dari dulu, kebetulan malah nemunya pas lagi promo!",
      "Siapa nih yang udah masukin ke wishlist dari bulan lalu? Saatnya checkout!",
      "Aku ngerti banget rasanya nahan beli karena mahal — nah sekarang udah nggak ada alasan!",
      "Kalian yang minta rekomen produk ini kemarin — ini jawabannya, dan lagi diskon pula!",
    ],
  },
  {
    label: "BUKTI SOSIAL",
    items: [
      "Ribuan orang udah beli ini, dan sekarang harganya lagi murah!",
      "Rating-nya 4.9, udah terjual ribuan — dan sekarang lagi promo!",
      "Temen aku udah beli ini duluan dan dia nyesel cuma beli satu — serius!",
      "Ini udah viral di mana-mana, dan ternyata emang worth it — apalagi pas lagi promo!",
      "Seller-nya udah jutaan transaksi, aman banget — plus lagi ada diskon gede!",
      "Ini produk [brand] yang udah dipercaya jutaan orang, sekarang harganya paling murah!",
      "Review-nya kompak bilang puas semua — dan sekarang harganya lebih murah dari biasanya!",
    ],
  },
  {
    label: "PERBANDINGAN PLATFORM",
    items: [
      "Udah aku cek di [platform lain], harganya beda jauh — Shopee yang paling murah sekarang!",
      "Di toko fisik harganya [harga toko], di sini cuma [harga Shopee] — belum termasuk ongkir gratis!",
      "Kemarin masih [harga lama], sekarang udah turun lagi — timing-nya pas banget!",
      "Ini harga Shopee vs harga normal: selisihnya bisa buat beli [barang lain] lagi!",
    ],
  },
  {
    label: "TEKNIK PERBANDINGAN BARANG SEHARI-HARI",
    items: [
      "Harganya sama kayak 2 bungkus mie instan — tapi dapetnya [produk] yang bisa dipake berbulan-bulan!",
      "Ini lebih murah dari ongkos ojek PP ke kampus — tapi yang kamu dapet bisa dipake tiap hari!",
      "Segelas boba harganya [harga boba], ini [produk] harganya [harga produk] — pilih mana?",
      "Lebih murah dari nasi padang, tapi manfaatnya bisa berasa sampai [X] bulan ke depan!",
      "Duit jajan sehari bisa dapet ini — dan ini bukan habis dimakan, tapi kepake terus!",
      "Biaya nongkrong sekali bisa buat beli [X] pcs ini — worth it mana coba?",
       "Harganya lebih murah dari biaya langganan Netflix sebulan, tapi ini kepakenya bertahun-tahun!",
      "Sama kayak jajan kopi susu kekinian 2 cup, bedanya yang ini bikin hidup kamu lebih gampang.",
      "Duit segini biasanya abis buat jajan seblak atau ongkir food delivery doang kan? Mending di-investasiin ke sini.",
      "Lebih murah dari harga kuota internet bulanan kamu, tapi manfaatnya berasa tiap hari.",
      "Bayangin, harganya setara sama uang tol PP sehari, tapi ini barangnya awet banget!",
      "Ini seharga tiket bioskop, tapi manfaatnya jauh lebih lama dari 2 jam film!",
    ],
  },
  {
    label: "TEKNIK VISUALISASI WAKTU",
    items: [
      "Senin sampai Minggu — 7 hari, 7 warna, harganya cuma [harga]. Komplit!",
      "Dari awal bulan sampai akhir bulan — satu beli cukup, nggak perlu keluar duit lagi!",
      "Pake tiap hari dari sekarang sampai akhir tahun — modalnya cuma sekali, [harga] saja!",
      "Liburan 3 hari 2 malem, bawa [X] pcs ini — totalnya masih di bawah [harga]. Efisien!",
      "Dari muda sampai tua ini masih kepake — dan harganya sekarang lagi paling murah!",
    ],
  },
  {
    label: "TEKNIK LOGIS / INVESTASI CERDAS (SOFT SELLING)",
    items: [
      "Kelihatannya sepele, tapi ini investasi kecil yang bakal ngebantu banget buat jangka panjang.",
      "Mumpung lagi ada penyesuaian harga, ini waktu paling logis buat upgrade barang kamu.",
      "Nggak perlu buru-buru, tapi sekadar info aja, harganya lagi turun jauh hari ini.",
      "Kalau kamu tipe yang mementingkan kualitas tapi tetap mau hemat, ini momen yang pas.",
      "Daripada beli barang murah tapi cepet rusak, mumpung yang original ini lagi turun harga, mending ambil yang pasti aja."
    ]
  },
  {
    label: "TEKNIK NARASI NGITUNG BARENG",
    items: [
      "Yuk kita hitung bareng — [harga total] dibagi [X] pcs, jadi per buah cuma [hasil]. Murah kan?",
      "Coba aku kasih liat dulu — normalnya [harga normal], sekarang jadi [harga promo]. Hemat [selisih]!",
      "Tunggu aku hitung dulu... [harga] buat [X] buah... itu artinya per pcs cuma [hasil]. Nggak salah tuh?",
      "Kalau kamu beli satuan: [harga satuan] x [jumlah] = [total]. Tapi kalau bundle sekarang: cuma [harga bundle]. Hemat [selisih]!",
    ],
  },
];

/**
 * Factory: gabungkan section statis + section dinamis (qty-aware) jadi satu bank lengkap.
 * Panggil ini sebagai pengganti BANK_BAHAS_PROMO langsung.
 */
export function buildBankBahasPromo(qty: number): BankSection[] {
  return [
    ...BANK_BAHAS_PROMO_STATIC,
    { label: "TEKNIK HITUNG / ENUMERASI", items: buildEnumerasiItems(qty) },
    { label: "TEKNIK BAGI / PER UNIT",    items: buildPerUnitItems(qty)   },
    { label: "TEKNIK KELIPATAN / BUNDLE", items: buildBundleItems(qty)    },
  ];
}

// ─── BANK PERBANDINGAN ───────────────────────────────────────────────────────

export const BANK_PERBANDINGAN: BankSection[] = [
  {
    label: "TEKNIK SANTAI / REBAHAN",
    items: [
      "Nggak perlu kemana-mana, duduk manis di rumah — barang nyampe sendiri ke depan pintu!",
      "Sambil rebahan, sambil scrolling, tiba-tiba ada ketukan pintu — paketnya dateng!",
      "Pesen dari kasur, bayar dari kasur, terima dari depan pintu — segampang itu!",
      "Nggak perlu panas-panasan, nggak perlu macet-macetan — tinggal klik, tunggu, dapet!",
      "Dari bangun tidur sampai makan siang, barangnya udah di tangan — tanpa keluar rumah!",
    ],
  },
  {
    label: "TEKNIK GRATIS ONGKIR",
    items: [
      "Barangnya murah, ongkirnya gratis — kamu bayar apaan lagi coba?",
      "Harga [harga] sampai depan rumah — nggak ada biaya tambahan, nggak ada kejutan!",
      "Gratis ongkir itu artinya harga yang kamu liat, itu yang kamu bayar. Titik.",
      "Biasanya ongkir bisa [harga ongkir] — nah itu udah gratis, jadi hemat dobel!",
      "Murah harganya, gratis ongkirnya — ini namanya menang di semua sisi!",
      "Kalau di toko kamu masih bayar bensin, parkir, tenaga — di sini? Gratis semua!",
      "Ongkir gratis itu bukan bonus, itu udah jadi alasan buat langsung checkout sekarang!",
    ],
  },
  {
    label: "TEKNIK PERBANDINGAN BELI OFFLINE",
    items: [
      "Kalau beli di toko: bayar bensin, bayar parkir, antri, capek — sampai rumah barang sama saja!",
      "Keluar rumah itu ada ongkosnya — bensin, parkir, makan di luar. Di sini? Nol rupiah tambahan!",
      "Di mall mungkin ada, tapi kamu harus ke sana dulu — di sini tinggal geser jari saja!",
      "Coba hitung: bensin PP [harga] + parkir [harga] + jajan [harga] — itu udah lebih mahal dari barangnya!",
      "Sama-sama dapet barang, tapi yang satu capek duluan — mending yang mana?",
    ],
  },
  {
    label: "TEKNIK VISUALISASI PENGIRIMAN",
    items: [
      "Pesen malem ini, besok pagi udah nongkrong di depan pintu — secepat itu!",
      "Kebayang nggak, lagi santai nonton, tiba-tiba notif 'paket tiba' — senyum sendiri deh!",
      "Dari kota seberang bisa nyampe dalam [X] hari — tanpa kamu harus pergi ke mana-mana!",
      "Pagi pesan, siang diproses, besok nyampe — ritme belanja yang paling enak!",
      "Bayangin: kamu masih tidur, kurirnya udah jalan duluan nganterin barang kamu!",
    ],
  },
  {
    label: "TEKNIK ANTI RAGU / RISK REVERSAL",
    items: [
      "Review jelek? Langsung retur aja. Seller-nya se-pede itu sama kualitas barangnya!",
      "Nggak perlu takut zonk, kalau dateng nggak sesuai ekspektasi, uang kamu aman.",
      "Banyak yang awalnya ragu, tapi pas barangnya dateng malah nyesel cuma checkout satu.",
      "Daripada penasaran dan kepikiran terus, mending buktiin sendiri. Toh harganya lagi murah banget.",
      "Toko ini garansinya jelas, ratingnya tinggi. Jadi kamu bisa tidur tenang nunggu paket dateng."
    ]
  },
  {
    label: "TEKNIK EMOSIONAL / RELATABLE",
    items: [
      "Ini buat yang males keluar tapi tetap mau tampil keren — solusinya ada di sini!",
      "Capek kerja seharian, nggak mau ribet — tinggal pesen, besok barangnya yang dateng duluan!",
      "Hujan di luar, kamu di dalem — barangnya tetap nyampe. Namanya belanja cerdas!",
      "Weekend nggak kemana-mana tapi tetap belanja? Bisa banget — ini buktinya!",
    ],
  },
];

// ─── BANK CTA ────────────────────────────────────────────────────────────────
// CTA selalu dikirim lengkap supaya model bisa enforce aturan {HARGA} dengan benar.
// Tapi kita tetap bisa shuffle urutan antar-kategori biar ada variasi mana yang "terlihat duluan".

export const BANK_CTA: BankSection[] = [
  {
    label: "CTA 1 — Harga & Promo",
    items: [
      "Ini lagi promo, tapi saya ga tau sampai kapan — cek dulu aja ya",
      "Harganya lagi turun, entah sampai kapan promonya — pastiin cek sekarang",
      "Lagi ada promo nih, saya ga bisa janji masih ada — langsung cek aja",
      "Ini harganya lagi spesial tapi ga tau sampai kapan, mending cek duluan",
      "Katanya lagi promo, saya juga ga tau detailnya — coba cek sendiri deh",
      "Ga tau ini promonya masih atau udah habis, cek sekarang biar ga nyesel",
      "Harganya lagi bagus sekarang, tapi saya ga bisa janji sampai kapan — cek aja",
      "Sempet liat lagi promo, tapi entah masih atau engga — mending langsung cek",
    ],
  },
  {
    label: "CTA 2 — Review",
    items: [
      "Review-reviewnya bagus, coba cek sendiri ya jangan percaya saya aja",
      "Lihat sendiri deh review-nya, saya ga mau pengaruhin",
      "Coba baca review-nya dulu, banyak yang udah coba — cek sendiri ya",
      "Reviewnya coba liat sendiri, saya ga bisa jelasin satu-satu",
      "Banyak yang udah review, cek sendiri biar lebih yakin",
      "Ga usah percaya saya, liat aja sendiri reviewnya udah berapa ribu",
      "Reviewnya bejibun, baca dulu sendiri biar ga penasaran",
      "Cek review-nya dulu deh, biar kamu yang nilai sendiri bagus atau engga",
    ],
  },
  {
    label: "CTA 3 — Harga Dulu vs Sekarang",
    items: [
      "Saya dulu beli {HARGA}, sekarang ga tau udah berapa — cek sendiri ya",
      "Waktu saya beli masih {HARGA}, harga sekarang coba cek deh",
      "Dulu saya dapet {HARGA}, entah sekarang masih segitu atau udah naik",
      "Saya belinya {HARGA}, tapi harga bisa berubah — pastiin cek dulu",
      "Ga tau sekarang harganya berapa, dulu sih saya {HARGA} — cek aja langsung",
      "Saya waktu itu {HARGA}, sekarang bisa lebih murah bisa lebih mahal — cek sendiri",
      "Dapet {HARGA} waktu itu, entah sekarang masih sama atau engga",
      "Saya kaget dulu cuma {HARGA}, sekarang ga tau — langsung cek aja",
    ],
  },
];

// ─── HELPER ──────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle — mutates and returns array */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Ambil N item acak dari sebuah BankSection.
 * Jika n >= items.length, kembalikan semua item (di-shuffle).
 */
function pickItemsFromSection(section: BankSection, n: number): BankSection {
  const shuffled = shuffle([...section.items]);
  return {
    label: section.label,
    items: shuffled.slice(0, Math.min(n, shuffled.length)),
  };
}

/**
 * Ambil M section acak dari bank, dan dari tiap section ambil N item acak.
 *
 * @param bank        - Array BankSection sumber
 * @param sections    - Berapa section yang dipilih (default: semua section, di-shuffle)
 * @param itemsPerSection - Berapa item per section (default: 3)
 */
function pickSubsetFromBank(
  bank: BankSection[],
  sections: number = bank.length,
  itemsPerSection: number = 3
): BankSection[] {
  const shuffledSections = shuffle([...bank]);
  return shuffledSections
    .slice(0, Math.min(sections, shuffledSections.length))
    .map((section) => pickItemsFromSection(section, itemsPerSection));
}

/**
 * Main export: ambil subset acak dari ketiga bank sekaligus.
 *
 * @param productQty - Jumlah pcs produk sebenarnya (default: 1).
 *   Dipakai untuk generate enumerasi yang akurat (1,2,3 / Senin,Selasa,dst).
 *
 * Strategi default (bisa di-override):
 * - BANK BAHAS PROMO  : 4 section acak, masing-masing 3 item
 * - BANK PERBANDINGAN : 3 section acak, masing-masing 3 item
 * - BANK CTA          : semua section, semua item (tapi urutan di-shuffle)
 */
export function pickRandomBanks(options?: {
  productQty?: number;
  promoSections?: number;
  promoItemsPerSection?: number;
  perbandinganSections?: number;
  perbandinganItemsPerSection?: number;
}): SelectedBanks {
  const {
    productQty = 1,
    promoSections = 3,
    promoItemsPerSection = 3,
    perbandinganSections = 2,
    perbandinganItemsPerSection = 3,
  } = options ?? {};

  // Bangun bank promo dengan enumerasi sesuai qty produk
  const bankBahasPromo = buildBankBahasPromo(productQty);

  return {
    bahasPromo: pickSubsetFromBank(bankBahasPromo, promoSections, promoItemsPerSection),
    perbandingan: pickSubsetFromBank(BANK_PERBANDINGAN, perbandinganSections, perbandinganItemsPerSection),
    // CTA tetap lengkap tapi urutan section-nya di-acak
    cta: shuffle([...BANK_CTA]).map((section) => ({
      ...section,
      items: shuffle([...section.items]),
    })),
     bridging: shuffle([...BANK_BRIDGING]).slice(0, 3) 
  };
}

// ─── SERIALIZER ──────────────────────────────────────────────────────────────

/**
 * Ubah SelectedBanks jadi string siap-inject ke dalam prompt.
 * Formatnya sama persis dengan format di SYSTEM_INSTRUCTION asli
 * sehingga model tidak perlu belajar format baru.
 */
export function serializeBanks(banks: SelectedBanks): string {
  const serializeSection = (section: BankSection) =>
    `=== ${section.label} ===\n` +
    section.items.map((item) => `- "${item}"`).join("\n");

  const bahasPromoText = banks.bahasPromo.map(serializeSection).join("\n\n");
  const perbandinganText = banks.perbandingan.map(serializeSection).join("\n\n");
  const ctaText = banks.cta.map(serializeSection).join("\n\n");
const bridgingText = banks.bridging.map((item) => `- "${item}"`).join("\n");
  return `
# PANDUAN MENGISI VARIABEL (SANGAT PENTING)
Jika Anda melihat tanda kurung siku seperti [harga], [X], [barang lain], [harga asli], Anda WAJIB menggantinya dengan nominal yang masuk akal dan sesuai konteks produk! 
Contoh: JANGAN tulis "[harga]", ubah menjadi "50 ribuan" atau "harga dua mangkok bakso".  
  
  # BANK BAHAS PROMO (PILIHAN HARI INI — gunakan dari sini saja)
${bahasPromoText}

# BANK BRIDGING / JEMBATAN TRANSISI (WAJIB DIGUNAKAN SALAH SATU)
${bridgingText}

# BANK PERBANDINGAN (PILIHAN HARI INI — gunakan dari sini saja)
${perbandinganText}

# BANK CTA (WAJIB PILIH SALAH SATU PERSIS)
${ctaText}`;
}
