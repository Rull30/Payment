# Walkthrough: Perbaikan Dark Mode Halaman Profile & Fitur Cicilan H-3

Sistem telah berhasil diperbaiki dan ditingkatkan dengan dua kapabilitas utama:
1. **Perbaikan Total Dark Mode pada Halaman Profile**: Menghilangkan kartu putih yang kontras salah, memperbaiki warna judul, label, tombol, dan modal konfirmasi.
2. **Implementasi Sistem Cicilan / Tenor Bertahap & Pengingat WhatsApp H-3**: Otomatisasi pembagian cicilan rata per bulan, deteksi jatuh tempo 3 hari sebelumnya (H-3), dan pengiriman WhatsApp 1-klik langsung ke klien.

---

## 1. Perbaikan Bug Dark Mode di Halaman Profile

### Permasalahan Sebelumnya
- Kontainer card profile pada `resources/js/Pages/Profile/Edit.jsx` menggunakan `bg-white` polos tanpa kelas `dark:bg-zinc-900` dan `dark:border-zinc-800`. Akibatnya, pada mode gelap latar belakang card tetap putih sedangkan input di dalamnya berwarna gelap.
- Komponen `InputLabel` dan heading teks menggunakan `text-gray-700` dan `text-gray-900` tanpa adaptasi dark mode.
- `SecondaryButton` dan `Modal` belum memiliki kelas pendukung dark mode.

### Perbaikan yang Diterapkan
- **`Profile/Edit.jsx`**: Diperbarui menjadi `bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-5 sm:p-6 transition-colors`.
- **`InputLabel.jsx`**: Diperbarui dengan `text-zinc-700 dark:text-zinc-300`.
- **`SecondaryButton.jsx`**: Diperbarui dengan warna zinc utilitarian dan adaptif light/dark.
- **`DangerButton.jsx`**: Diperbarui dengan palet rose utilitarian yang selaras di kedua tema.
- **`Modal.jsx`**: Backdrop diperbarui dengan `bg-zinc-900/60 dark:bg-black/70` dan panel card dengan `dark:bg-zinc-900 dark:border-zinc-800`.
- **Partials Profile**: `UpdateProfileInformationForm`, `UpdatePasswordForm`, dan `DeleteUserForm` telah diperbarui dan diharmonisasi secara visual dengan dukungan bahasa Indonesia yang rapi.

---

## 2. Fitur Cicilan / Tenor Bertahap & Pengingat WhatsApp H-3

### Backend & Database
- **Migration & Model `InvoiceInstallment`**:
  - Menyimpan `invoice_id`, `installment_number`, `total_installments`, `amount`, `due_date`, `status` (`pending`, `paid`, `overdue`), `reminder_sent_at`, dan `paid_at`.
  - Dilengkapi scope `scopeDueInDays($query, 3)` dan `scopeOverdue($query)`.
- **Relasi & Sinkronisasi Otomatis pada `Invoice`**:
  - `installments(): HasMany`
  - `syncInstallmentStatus()`: Menyesuaikan status invoice menjadi `paid` saat seluruh tenor cicilan telah lunas.
- **Scheduler & Command `php artisan invoices:check-reminders`**:
  - Memindai seluruh cicilan yang jatuh tempo dalam 3 hari ke depan (H-3) dan otomatis memperbarui status cicilan yang lewat tempo.
  - Dijadwalkan otomatis setiap hari pukul 09:00 WIB via `routes/console.php`.

### Frontend & WhatsApp Integration
- **`Invoices/Create.jsx` & `Invoices/Edit.jsx`**:
  - Tombol toggle: **Bayar Penuh (1x)** vs **Cicilan / Tenor Bertahap**.
  - Pilihan preset tenor cepat: 2x, 3x, 4x, 6x, 12x (atau kustom).
  - Pembagian nominal rata otomatis ke masing-masing bulan beserta tanggal jatuh temponya.
  - Validasi selisih agar total cicilan selalu cocok 100% dengan total invoice.
- **Widget Pengingat Cicilan Mendatang (H-3) pada `Dashboard.jsx`**:
  - Muncul di atas tabel invoice saat ada tenor cicilan klien yang jatuh tempo dalam 3 hari ke depan.
  - Menampilkan nama klien, nomor WhatsApp, nomor invoice, "Cicilan X dari Y", nominal, dan sisa hari.
  - Tombol **Kirim WhatsApp H-3** membuka modal WhatsApp dengan pesan terformat rapi yang memuat rincian cicilan tersebut.
  - Tombol cepat **Tandai Lunas** untuk melunasi cicilan langsung dari dasbor.
- **Halaman Publik Invoice (`Invoices/PublicShow.jsx`)**:
  - Menampilkan tabel rincian jadwal cicilan beserta status pembayaran masing-masing tenor untuk kenyamanan klien saat mencetak atau melihat secara daring.

---

## 3. Hasil Pengujian & Verifikasi

1. **Feature Test Suite**:
   ```bash
   php artisan test --compact
   ```
   **Hasil**: 33 tests passed, 121 assertions, 0 errors.

2. **Pint Code Formatting**:
   ```bash
   vendor\bin\pint --format agent
   ```
   **Hasil**: Semua berkas PHP terformat sesuai standar PSR-12 / Laravel.

3. **Frontend Production Build**:
   ```bash
   npm.cmd run build
   ```
   **Hasil**: Berhasil di-*bundle* oleh Vite tanpa ada galat sintaks atau aset yang hilang.
