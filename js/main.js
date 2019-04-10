/*
* IndexedDB
* */
createDatabase();
function createDatabase() {
    if (!('indexedDB' in window)){
        console.log('Web Browser tidak mendukung Indexed DB');
        return;
    }
    var request = window.indexedDB.open('latihan-pwa',1);
    request.onerror = errordbHandle;
    request.onupgradeneeded = (e)=>{
        var db = e.target.result;
        db.onerror = errordbHandle;
        var objectStore = db.createObjectStore('produk',
            {keyPath: 'kode_produk'});
        console.log('Object store produk berhasil dibuat');
    }
    request.onsuccess = (e) => {
        db = e.target.result;
        db.error = errordbHandle;
        console.log('Berhasil melakukan koneksi ke database lokal');
        // lakukan sesuatu ...
        bacaDariDB();
    }
}

function errordbHandle(e) {
    console.log('Error DB : '+e.target.errorCode);
}

var tabel = document.getElementById('tabel-produk'),
    kode_produk = document.getElementById('kode_produk'),
    nama_produk = document.getElementById('nama_produk'),
    jumlah_produk = document.getElementById('jumlah_produk'),
    form = document.getElementById('form-tambah');

form.addEventListener('submit',tambahBaris);
tabel.addEventListener('click',hapusBaris);

function tambahBaris(e){
    // cek nim apakah sudah ada
    if (tabel.rows.namedItem(kode_produk.value)){
        alert('Error: Kode Produk sudah terdaftar');
        e.preventDefault();
        return;
    }
    // masukkan data ke database
    tambahKeDB({
        kode_produk : kode_produk.value,
        nama_produk : nama_produk.value,
        jumlah_produk : jumlah_produk.value
    });

    // append baris baru dari data form
    var baris = tabel.insertRow();
    baris.id = kode_produk.value;
    baris.insertCell().appendChild(document.createTextNode(kode_produk.value));
    baris.insertCell().appendChild(document.createTextNode(nama_produk.value));
    baris.insertCell().appendChild(document.createTextNode(jumlah_produk.value));

    // tambah bagian button delete
    var btn = document.createElement('input');
    btn.type = 'button';
    btn.value = 'Hapus';
    btn.id = kode_produk.value;
    btn.className = 'btn btn-sm btn-danger';
    baris.insertCell().appendChild(btn);
    e.preventDefault();
}

function tambahKeDB(produk) {
    var objectStore = buatTransaksi().objectStore('produk');
    var request = objectStore.add(produk);
    request.onerror = errordbHandle;
    request.onsuccess = console.log('produk ['+produk.kode_produk+'] '
        +'berhasil di tambahkan')
}

function buatTransaksi() {
    var transaction = db.transaction(['produk'],'readwrite');
    transaction.onerror = errordbHandle;
    transaction.complete = console.log('Transaksi selesai');

    return transaction;
}

function bacaDariDB() {
    var objectStore = buatTransaksi().objectStore('produk');
    objectStore.openCursor().onsuccess = (e) => {
        var result = e.target.result;
        if (result){
            console.log('Membaca [' + result.value.kode_produk +'] dari DB');
            // append baris dari database
            var baris = tabel.insertRow();
            baris.id = kode_produk.value;
            baris.insertCell().appendChild(document.createTextNode(result.value.kode_produk));
            baris.insertCell().appendChild(document.createTextNode(result.value.nama_produk));
            baris.insertCell().appendChild(document.createTextNode(result.value.jumlah_produk));

            // append tombol hapus
            var btn = document.createElement('input');
            btn.type = 'button';
            btn.value = 'Hapus';
            btn.id = result.value.kode_produk;
            btn.className = 'btn btn-sm btn-danger';
            baris.insertCell().appendChild(btn);
            result.continue();
        }
    }
}

function hapusBaris(e) {
    if (e.target.type ==='button'){
        var hapus = confirm('Apakah yakin menghapus data?');
        if (hapus){
            tabel.deleteRow(tabel.rows.namedItem(e.target.id).sectionRowIndex);
            hapusDariDB(e.target.id);
        }
    }
}

function hapusDariDB(kode_produk) {
    var objectStore = buatTransaksi().objectStore('produk');
    var request = objectStore.delete(kode_produk);
    request.onerror = errordbHandle;
    request.onsuccess = console.log('Produk ['+kode_produk+'] terhapus');
}