const { parseBimaMasterWithDebug } = require("../dist/index.js");
const formatB = `SISTEM INFORMASI 124210023 Pengantar Sistem Informasi SI-A 3 45 Senin 10:00-12:30 Patt.III-3B`;
console.log("Testing Format B...");
try {
    const resultB = parseBimaMasterWithDebug(formatB);
    console.log("Format B Result:", JSON.stringify(resultB, null, 2));
} catch (err) {
    console.error("FATAL ERROR:", err);
}
