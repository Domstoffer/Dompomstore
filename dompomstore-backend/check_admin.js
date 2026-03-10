const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'store.db');
const db = new sqlite3.Database(dbPath);
const bcrypt = require('bcrypt');

db.all("SELECT * FROM admins", [], (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Admins:");
    console.log(rows);

    if (rows.length > 0) {
        const isMatch = bcrypt.compareSync('alexspritzttesto0807', rows[0].password);
        console.log("Login attempt: domstoffer - matches hash:", isMatch);
    } else {
        console.log("No admins found in DB!");
    }
});
