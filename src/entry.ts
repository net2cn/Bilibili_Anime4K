import {Scaler} from "./scaler/scaler"

// Parameters.
let movOrig: HTMLVideoElement;
let div: HTMLElement;
let board: HTMLCanvasElement;

async function injectCanvas() {
    console.log('Injecting canvas...')

    // Create a canvas (since video tag do not support WebGL).
    movOrig = await getVideoTag()
    console.log(movOrig)

    if (!movOrig){
        console.log("An error has occurred when fetching video tag.")
    }

    div = movOrig.parentElement!

    board = document.createElement('canvas');
    // Make it visually fill the positioned parent
    board.style.width = '100%';
    board.style.height = '100%';
    // ...then set the internal size to match
    board.width = board.offsetWidth;
    board.height = board.offsetHeight;
    // Add it back to the div where contains the video tag we use as input.
    div.appendChild(board)

    // Hide original video tag, we don't need it to be displayed.
    movOrig.style.display = 'none'
}

async function getVideoTag() {
    while(document.getElementsByTagName("video").length <= 0) {
        await new Promise(r => setTimeout(r, 500));
    }

    return document.getElementsByTagName("video")[0]
}

function doFilter() {
    // Setting our parameters for filtering.
    // scale: multipliers that we need to zoom in.
    // Here's the fun part. We create a pixel shader for our canvas
    console.log('Enabling filter...')

    let gl = board.getContext('webgl');

    console.log(board)

    if(!gl){
        throw new Error("An error has occurred when trying to get WebGLRenderingContext")
    }
    
    let scaler = new Scaler(gl);

    movOrig.addEventListener('loadedmetadata', function () {
        scaler.input(movOrig);
    }, true);
    movOrig.addEventListener('error', function () {
        throw new Error("An error has occurred when trying to do filter.")
    }, true);
    board.addEventListener('error', function (){
        throw new Error("An error has occurred in canvas.")
    }, true)

    // Do it! Filter it! Profit!
    function render() {
        if (scaler) {
            scaler.scale;
            scaler.render();
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

(async function () {
    console.log('Initializing Bilibili_Anime4K...')
    await injectCanvas()
    doFilter()
})();