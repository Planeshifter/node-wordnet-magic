var wordNet = require("../src/index.js");

wordNet.morph("better","a").then(console.log);

wordNet.morph("denied","v").then(console.log);

wordNet.morph("churches","n").then(console.log);

wordNet.morph("structures","n").then(console.log);

wordNet.morph("buldings","n").then(console.log);

wordNet.morph("taught","v").then(console.log);