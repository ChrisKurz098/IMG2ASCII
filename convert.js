const Jimp = require('jimp');
const fs = require('fs');

let luminaceArr = [];
let imgWidth = 10;
let size = parseInt(process.argv.slice(3).pop());
const file = process.argv.slice(2, 3).pop();
//if user doesnt input a width, default to 64
if (isNaN(size)) { console.log("\nWidth not defined. Default 64 characters"); size = 64 };
if (size>500) {console.log('\nWARNING: A width greater than 500 can cause issues with the output file!')};
(file === undefined) ? console.log("\nenter a file name") : startProgram();
console.log("\nFile name: ",file, "      Output width: ",size);

const asciiRamp = [' $', ' @', ' B', ' %', ' 8', ' &', ' W', ' M', ' #', ' *', ' o', ' a', ' h', ' k', ' b', ' d', ' p', ' q', ' w', ' m', ' Z', ' O', ' 0', ' Q', ' L', ' C', ' J', ' U', ' Y', ' X', ' z', ' c', ' v', ' u', ' n', ' x', ' r', ' j', ' f', ' t', ' /', ' ;', ' |', ' (', ' )', ' 1', ' {', ' }', ' [', ' ]', ' ?', ' -', ' _', ' +', ' ~', ' i', ' !', ' l', ' I', ' ;', ' !', ' :', ' >', ' "', ' ^', ' `', ' "', ' .', '  '];

let newFile = '';

//read file then resize and csave new file
function startProgram() {
    Jimp.read(file)
        .then(image => {
            newFile = 'new_name.' + image.getExtension();


            image
                .grayscale()
                .resize(size, Jimp.AUTO) //resize image based off new width. Allows image to fit on page
                .write(newFile, generateASCII) //save new file then run function to generate ASCII art
        });
}
//takes the new file and processes it
function generateASCII() {
    Jimp.read(newFile)
        .then(image => {
            //save image width to global variable. Needed for makeASCII function
            imgWidth = image.bitmap.width;

            image
            //runs through eveey pixle in the image and allows me to extrapolate the RGB value
                .scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                    // x, y is the position of this pixel on the image
                    // idx is the position start position of this rgba tuple in the bitmap Buffer
                    // this is the image

                    const red = this.bitmap.data[idx + 0];
                    const green = this.bitmap.data[idx + 1];
                    const blue = this.bitmap.data[idx + 2];
                    let lum = (red + green + blue) / 3;
                    // console.log(red,blue,green,lum);
                    lum = Math.ceil(lum / 3.75)
                    luminaceArr.push(lum);

                    // rgba values run from 0 - 255
                    // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel
                });
        }).then(e => {
            makeAsciiFile(luminaceArr);
        }).catch(err => {
            console.log('Error', err);
        });
}

function makeAsciiFile(arr) {
    //create string variabel and a timer to work along with the for loop
    let string = ``;
    //the timer keeps track of how many characters are in each row
    let timer = 0;
    //run for loop for length of ascii array
    for (let i = 0; i < arr.length; i++) {
        //if the row of characters is less than the needed width
        if (timer < imgWidth) {
            let e = arr[i];
            //add the current character to the string and increase the timer
            string += asciiRamp[e];
            timer += 1
        }
        else {
            //else create a new line
            string +=
                `
`
            //reset the timer
            timer = 0;
            //and repeat the instance of i so we can write it to the string
            i--;
        }

    }
    //create the text file with the ascii art
    fs.writeFile(file.split('.')[0] + '.txt', string, (err) => {
        if (err)
            console.log(err);
        console.log('\nText File Created!')
        //delete the smaller version of the original image
        fs.unlink(newFile, () => { console.log("\nDone.") });
    });
}
