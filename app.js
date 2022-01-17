const Jimp = require('jimp');
const fs = require('fs');

let luminaceArr = [];
let imgWidth = 10;
const file = process.argv.pop();
console.log(file);
const lumConv = [' $', ' @', ' B', ' %', ' 8', ' &', ' W', ' M', ' #', ' *', ' o', ' a', ' h', ' k', ' b', ' d', ' p', ' q', ' w', ' m', ' Z', ' O', ' 0', ' Q', ' L', ' C', ' J', ' U', ' Y', ' X', ' z', ' c', ' v', ' u', ' n', ' x', ' r', ' j', ' f', ' t', ' /', ' ;', ' |', ' (', ' )', ' 1', ' {', ' }', ' [', ' ]', ' ?', ' -', ' _', ' +', ' ~', ' i', ' !', ' l', ' I', ' ;', ' !', ' :', ' >', ' "', ' ^', ' `', ' "', ' .', ' .']
let newFile = ''

//read file then resize and csave new file
Jimp.read(file)
    .then(image => {
        newFile = 'new_name.' + image.getExtension();
   

        image
            .resize(64, Jimp.AUTO) //resize image based off new width. Allows image to fit on page
            .write(newFile, generateASCII)
    });

    //takes the new file and processes it
function generateASCII() {
    Jimp.read(newFile)
        .then(image => {

            imgWidth = image.bitmap.width;

            image
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
    let string = ``;
    let timer = 0;
    for (let i = 0; i < arr.length; i++) {
        if (timer < imgWidth) {
            let e = arr[i];
            string += lumConv[e];
            timer += 1
        }
        else {
            string +=
                `
`
            timer = 0;
            i--;
        }

    }
    console.log(string);
    fs.writeFile(file.split('.')[0]+'.txt', string, (err) => {
        if (err)
          console.log(err);
    console.log('File Created!')
    });
}
