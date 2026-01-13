const { parseBimaMasterWithDebug } = require("../dist/index.js");

const formatA = `SISTEM INFORMASI	124210001	Basic Programming	3	SI-A	45	Senin 07:00-09:30	Patt.III-1A`;
const formatB = `SISTEM INFORMASI 124210023 Pengantar Sistem Informasi SI-A 3 45 Senin 10:00-12:30 Patt.III-3B`;
const multiLine = `SISTEM INFORMASI	124210001	Basic Programming	3	SI-A	45	Senin 07:00-09:30	Patt.III-1A
Lecturer name here
Another Lecturer
SISTEM INFORMASI 124210023 Pengantar Sistem Informasi SI-A 3 45 Senin 10:00-12:30 Patt.III-3B
Special Lecturer`;

console.log("Testing Format A...");
const resultA = parseBimaMasterWithDebug(formatA);
console.log("Format A Result:", JSON.stringify(resultA.debug, null, 2));
console.log("SKS (should be 3):", resultA.subjects[0].sks);

console.log("\nTesting Format B...");
const resultB = parseBimaMasterWithDebug(formatB);
console.log("Format B Result:", JSON.stringify(resultB.debug, null, 2));
console.log("SKS (should be 3):", resultB.subjects[0].sks);
console.log("Class (should be SI-A):", resultB.subjects[0].classes[0].className);
console.log("Capacity (should be 45):", resultB.subjects[0].classes[0].capacity);

console.log("\nTesting Multi-line & Multi-format...");
const resultMulti = parseBimaMasterWithDebug(multiLine);
console.log("Multi Result Debug:", JSON.stringify(resultMulti.debug, null, 2));
console.log("Total Subjects:", resultMulti.subjects.length);
console.log("Lecturers (Subj 1):", resultMulti.subjects[0].classes[0].lecturers);
console.log("Lecturers (Subj 2):", resultMulti.subjects[1].classes[0].lecturers);
