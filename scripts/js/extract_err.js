const fs = require('fs');
const t = fs.readFileSync('seed_err4.txt', 'utf16le');
const match = t.match(/ERR_MSG_207_TRACK: .+/);
if (match) {
    console.log(match[0].substring(0, 500));
} else {
    console.log("Not found.");
}
