if (process.argv.length < 3) {
	console.error("Usage:\n\timage-tj.js <image.png>");
	process.exit(1);
}

const image = process.argv[2];

const fs = require('fs');
const { format } = require('path/posix');
const PNG = require('pngjs').PNG;

const png = PNG.sync.read(fs.readFileSync(image));

//read a PNG file, reassign the colors to BWRG
//B:car0; W:car1; R:car2; G:car3

let outColors = [ [0, 0, 0], [255, 255, 255], [255, 0, 0], [0, 255, 0] ];
let readColors = new Set();

for (let i = 0; i < png.data.length; i += 4) {
    readColors.add(`${png.data[i]},${png.data[i+1]},${png.data[i+2]}`);
}

if (readColors.size > outColors.length) {
    console.error("PNG should only use 2, 3, or 4 colors!");
    process.exit(1);
}

const num = readColors.size;

let colorMap = new Map();
let i = 0;
for (let color of readColors) {
    colorMap.set(color, outColors[i++]);
}

for (let i = 0; i < png.data.length; i += 4) {
    let colorKey = `${png.data[i]},${png.data[i+1]},${png.data[i+2]}`;
    let newColor = colorMap.get(colorKey);
    png.data[i]   = newColor[0]; // R value
    png.data[i+1] = newColor[1]; // G value
    png.data[i+2] = newColor[2]; // B value
    png.data[i+3] = 255;
}

fs.writeFileSync('output.png', PNG.sync.write(png));

console.log(";!knitout-2");
console.log(";;Carriers: 1 2 3 4 5 6 7 8 9 10");
console.log("x-stitch-number 105"); 

const Width = png.width;
const Height = png.height;
const rawCar = [3,4,5,6];

//output an array of [a,b,c,d] to check whether each color is T or F
let knitPattern = [];
for (let i = 0; i < Width * Height; i++) {
    knitPattern.push(new Array(num).fill(false)); 
}


for (let h = 0; h < Height; h++) {
for (let w = 0; w < Width; w++) {
    let col = {
        r:png.data[4*(Width*(Height-1-h)+w)+0],
        g:png.data[4*(Width*(Height-1-h)+w)+1],
        b:png.data[4*(Width*(Height-1-h)+w)+2]
    };
    let index = h*Width+w;
    if (col.r === 0 && col.g === 0) {
        knitPattern[index][0] = true; 
    } else if (col.r === 255 && col.g === 255) {
        knitPattern[index][1] = true;
    } else if (col.r === 255 && col.g === 0) {
        knitPattern[index][2] = true;
    }else if (col.r === 0 && col.g === 255) {
        knitPattern[index][3] = true;
    }
}
}

// console.log(knitPattern.join("\n"));

const offsetCar = [0,1,2,3];
const carMap = new Map;
for (let n = 0; n < num; n++) {
    carMap.set(rawCar[n],offsetCar[n]);
}

caston();
console.log("rack 0.25");

//knit the pattern
for (let h = 0; h < Height; h++) {
    if (h%2 == 0) {
        for (let [car, offset] of carMap) {
            let fr = Array.from(carMap.keys()).indexOf(car);
            for (let w = Width-1; w > 0; w --) {
                if (w%num == offset) {
                    console.log(`knit - b${w} ${car}`);
                }
                if (knitPattern[h*Width+w][fr]){
                    console.log(`knit - f${w} ${car}`);
                }
            }
            console.log(`miss - b-1 ${car}`);
        }
    } else if (h%2 == 1) {
        for (let [car, offset] of carMap) {
            let fr = Array.from(carMap.keys()).indexOf(car);
            for (let w = 0; w < Width; w ++) {
                if (knitPattern[h*Width+w][fr]){
                    console.log(`knit + f${w} ${car}`);
                }
                if (w%num == offset) {
                    console.log(`knit + b${w} ${car}`);
                }
            }
            console.log(`miss + b${Width} ${car}`);
        }
    }
    movecar(num-1);
}


//back bed offset
function movecar(offset) {
    const keys = Array.from(carMap.keys());
    const values = keys.map(key => carMap.get(key));

    keys.forEach((key, index) => {
        const newIndex = (index + offset) % keys.length;
        carMap.set(keys[newIndex], values[index]);
    });
}

//cast on
function caston () {
    const min = 0;
    const max = Width-1;
    const car = Array.from(carMap.keys());
    const f = max%2;
    for (let k = 0; k <= car.length-1; k++) {
        console.log(`inhook ${car[k]}`);
        for (let n = max; n >= min; n--) {
            if ((n%2) == f) {
               console.log(`knit - f${n} ${car[k]}`);
            } else {
               console.log(`knit - b${n} ${car[k]}`); 
            }
        }
        for (let n = min; n <= max; n++) {
            if ((n%2) == f) {
               console.log(`knit + b${n} ${car[k]}`);
            } else {
               console.log(`knit + f${n} ${car[k]}`); 
            }
        }
        console.log(`releasehook ${car[k]}`);
    }
}


//bind off
function bindoff() {
    const min = 0;
    const max = Width-1;
    const car = Array.from(carMap.keys());
    const f = (max-1)%2;

    if (Height%2 == 1) {
        console.log("rack 0");
        for (let k = 1; k <= car.length - 1; k++) {
            for (let n = min; n <= max; n++) {
                if ((n%2) == f) {
                   console.log(`knit + b${n} ${car[k]}`);
                } else {
                   console.log(`knit + f${n} ${car[k]}`); 
                }
            }
            for (let n = max; n >= min; n--) {
                if ((n%2) == f) {
                   console.log(`knit - f${n} ${car[k]}`);
                } else {
                   console.log(`knit - b${n} ${car[k]}`); 
                }
            }
            console.log(`outhook ${car[k]}`);
        }
		console.log("rack 0.25");
        for (let n = min; n <= max; n++) {
			console.log(`knit + f${n} ${car[0]}`);
			console.log("rack 0");
			console.log(`xfer f${n} b${n}`);
			console.log(`knit - b${n} ${car[0]}`);
			if (n != max) {
				console.log("rack 1");
				console.log(`xfer b${n} f${n+1}`);
			} else {
				console.log(`xfer b${n} f${n}`);
			}
		}
        knitChart("+", car[0], max, max+4, [
			"#####",
			"#####",
			"#####",
			"#####",
			"#####",
			"#####",
			"#### ",
			"#### ",
			"###  ",
			"###  ",
			"##   ",
			"##   ",
			"#    ",
		]);

    } else {
        console.log("rack 0");
        for (let k = 1; k <= car.length - 1; k++) {
            for (let n = max; n >= min; n--) {
                if ((n%2) == f) {
                   console.log(`knit - f${n} ${car[k]}`);
                } else {
                   console.log(`knit - b${n} ${car[k]}`); 
                }
            }
            for (let n = min; n <= max; n++) {
                if ((n%2) == f) {
                   console.log(`knit + b${n} ${car[k]}`);
                } else {
                   console.log(`knit + f${n} ${car[k]}`); 
                }
            }
            console.log(`outhook ${car[k]}`);
        }
        console.log("rack 0.25");
        for (let n = max; n >= min; n--) {
			console.log(`knit - b${n} ${car[0]}`);
			console.log("rack 0");
			console.log(`xfer b${n} f${n}`);
			console.log(`knit + f${n} ${car[0]}`);
			if (n != min) {
				console.log("rack 1");
				console.log(`xfer f${n} b${n-1}`);
			}
		}
		knitChart("-", car[0], min-4, min, [
			"#####",
			"#####",
			"#####",
			"#####",
			"#####",
			"#####",
			" ####",
			" ####",
			"  ###",
			"  ###",
			"   ##",
			"   ##",
			"    #",
		]);
    }
    console.log("rack 0");
    console.log(`outhook ${car[0]}`);
        for (let n = min-4; n <= max+4; ++n) {
	console.log(`drop f${n}`);
    }
    for (let n = min-4; n <= max+4; ++n) {
	console.log(`drop b${n}`);
}
}

bindoff();

function knitChart(dir,carrier,min,max,chart) {
	for (let row = chart.length-1; row >= 0; --row) {
		const line = chart[row];
		console.assert(line.length == (max-min+1),"chart size should be correct");
		if (dir === '+') {
			for (let n = min; n <= max; ++n) {
				if (line[n-min] === ' ') {
					//do nothing.
				} else if (line[n-min] === '#') {
					console.log("knit + f" + n + " " + carrier);
				} else {
					throw new Error("Invalid symbol '" + line[n-min] + "' in chart.");
				}
			}
			
			dir = '-';
		} else {
			for (let n = max; n >= min; --n) {
				if (line[n-min] === ' ') {
					//do nothing.
				} else if (line[n-min] === '#') {
					console.log("knit - f" + n + " " + carrier);
				} else {
					throw new Error("Invalid symbol '" + line[n-min] + "' in chart.");
				}
			}

			dir = '+';
		}
	}
	return dir;
}

