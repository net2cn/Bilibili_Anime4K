// ==UserScript==
// @name                Bilibili_Anime4K
// @name:zh-CN          Bilibili Anime4K滤镜
// @description         Bring Anime4K to Bilibili's HTML5 player to clearify 2D anime.
// @description:zh-CN   通过Anime4K滤镜让Bilibili上的2D番剧更加清晰
// @namespace           http://net2cn.tk/
// @homepageURL         https://github.com/net2cn/Bilibili_Anime4K/
// @supportURL          https://github.com/net2cn/Bilibili_Anime4K/issues
// @version             1.0.0
// @author              net2cn
// @copyright           bloc97, DextroseRe, NeuroWhAI, and all contributors of Anime4K
// @match               *://www.bilibili.com/video/av*
// @match               *://www.bilibili.com/bangumi/play/ep*
// @match               *://www.bilibili.com/bangumi/play/ss*
// @match               *://www.bilibili.com/video/BV*
// @grant               none
// @license             MIT License
// @run-at              document-idle
// ==/UserScript==
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/entry.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/entry.ts":
/*!**********************!*\
  !*** ./src/entry.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var scaler_1 = __webpack_require__(/*! ./scaler/scaler */ "./src/scaler/scaler.ts");
// Parameters.
var movOrig;
var div;
var board;
function injectCanvas() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Injecting canvas...');
                    return [4 /*yield*/, getVideoTag()];
                case 1:
                    // Create a canvas (since video tag do not support WebGL).
                    movOrig = _a.sent();
                    console.log(movOrig);
                    if (!movOrig) {
                        console.log("An error has occurred when fetching video tag.");
                    }
                    div = movOrig.parentElement;
                    board = document.createElement('canvas');
                    // Make it visually fill the positioned parent
                    board.style.width = '100%';
                    board.style.height = '100%';
                    // ...then set the internal size to match
                    board.width = board.offsetWidth;
                    board.height = board.offsetHeight;
                    // Add it back to the div where contains the video tag we use as input.
                    div.appendChild(board);
                    // Hide original video tag, we don't need it to be displayed.
                    movOrig.style.display = 'none';
                    return [2 /*return*/];
            }
        });
    });
}
function getVideoTag() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(document.getElementsByTagName("video").length <= 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 0];
                case 2: return [2 /*return*/, document.getElementsByTagName("video")[0]];
            }
        });
    });
}
function doFilter() {
    // Setting our parameters for filtering.
    // scale: multipliers that we need to zoom in.
    // Here's the fun part. We create a pixel shader for our canvas
    console.log('Enabling filter...');
    var gl = board.getContext('webgl');
    console.log(board);
    if (!gl) {
        throw new Error("An error has occurred when trying to get WebGLRenderingContext");
    }
    var scaler = new scaler_1.Scaler(gl);
    movOrig.addEventListener('loadedmetadata', function () {
        scaler.input(movOrig);
    }, true);
    movOrig.addEventListener('error', function () {
        throw new Error("An error has occurred when trying to do filter.");
    }, true);
    board.addEventListener('error', function () {
        throw new Error("An error has occurred in canvas.");
    }, true);
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
(function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Initializing Bilibili_Anime4K...');
                    return [4 /*yield*/, injectCanvas()];
                case 1:
                    _a.sent();
                    doFilter();
                    return [2 /*return*/];
            }
        });
    });
})();


/***/ }),

/***/ "./src/scaler/scaler.ts":
/*!******************************!*\
  !*** ./src/scaler/scaler.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var shader_1 = __webpack_require__(/*! ./shader */ "./src/scaler/shader.ts");
function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    if (shader) {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader));
        }
        return shader;
    }
    else {
        throw new Error("An error has occurred when creating WebGL shader.");
    }
}
function createProgram(gl, vertexSource, fragmentSource) {
    var program = gl.createProgram();
    //console.log(fragmentSource)
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (program && vertexShader && fragmentShader) {
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program));
        }
        var wrapper = { program: program };
        var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (var i = 0; i < numAttributes; i++) {
            var attribute = gl.getActiveAttrib(program, i);
            wrapper[attribute.name] = gl.getAttribLocation(program, attribute.name);
        }
        var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (var i$1 = 0; i$1 < numUniforms; i$1++) {
            var uniform = gl.getActiveUniform(program, i$1);
            wrapper[uniform.name] = gl.getUniformLocation(program, uniform.name);
        }
        return wrapper;
    }
    else {
        throw new Error("An error has occurred when creating WebGL program.");
    }
}
function createTexture(gl, filter, data, width, height) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    if (data instanceof Uint8Array) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }
    else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}
function bindTexture(gl, texture, unit) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
}
function updateTexture(gl, texture, src) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
}
function createBuffer(gl, data) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
}
function bindAttribute(gl, buffer, attribute, numComponents) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, numComponents, gl.FLOAT, false, 0, 0);
}
function bindFramebuffer(gl, framebuffer, texture) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    if (texture) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }
}
var Scaler = /** @class */ (function () {
    function Scaler(gl) {
        this.scale = 1.0;
        this.shader = new shader_1.Shaders();
        this.gl = gl;
        console.log('Compiling shaders...');
        this.quadBuffer = createBuffer(this.gl, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]));
        this.framebuffer = this.gl.createFramebuffer();
        this.scaleProgram = createProgram(this.gl, this.shader.quadVert, this.shader.scaleFrag);
        this.thinLinesProgram = createProgram(this.gl, this.shader.quadVert, this.shader.thinLinesFrag);
        this.lumaProgram = createProgram(this.gl, this.shader.quadVert, this.shader.lumaFrag);
        this.lumaGausXProgram = createProgram(this.gl, this.shader.quadVert, this.shader.lumaGausXFrag);
        this.lumaGausYProgram = createProgram(this.gl, this.shader.quadVert, this.shader.lumaGausYFrag);
        this.lineDetectProgram = createProgram(this.gl, this.shader.quadVert, this.shader.lineDetectFrag);
        this.lineGausXProgram = createProgram(this.gl, this.shader.quadVert, this.shader.lineGausXFrag);
        this.lineGausYProgram = createProgram(this.gl, this.shader.quadVert, this.shader.lineGausYFrag);
        this.gradProgram = createProgram(this.gl, this.shader.quadVert, this.shader.gradFrag);
        this.refineProgram = createProgram(this.gl, this.shader.quadVert, this.shader.refineFrag);
        this.fxaaProgram = createProgram(this.gl, this.shader.quadVert, this.shader.fxaaFrag);
        this.drawProgram = createProgram(this.gl, this.shader.quadVert, this.shader.drawFrag);
    }
    Scaler.prototype.input = function (mov) {
        var width = mov.videoWidth;
        var height = mov.videoHeight;
        this.inputWidth = width;
        this.inputHeight = height;
        var emptyPixels = new Uint8Array(width * height * 4);
        this.inputTex = createTexture(this.gl, this.gl.LINEAR, emptyPixels, width, height);
        this.inputMov = mov;
    };
    Scaler.prototype.resize = function (scale) {
        var width = Math.round(this.inputWidth * scale);
        var height = Math.round(this.inputHeight * scale);
        this.gl.canvas.width = width;
        this.gl.canvas.height = height;
        var emptyPixels = new Uint8Array(width * height * 4);
        this.scaleTexture = createTexture(this.gl, this.gl.LINEAR, emptyPixels, width, height);
        this.scaleTexture2 = createTexture(this.gl, this.gl.LINEAR, emptyPixels, width, height);
        this.postKernelTexture = createTexture(this.gl, this.gl.LINEAR, emptyPixels, width, height);
        this.postKernelTexture2 = createTexture(this.gl, this.gl.LINEAR, emptyPixels, width, height);
    };
    Scaler.prototype.render = function () {
        if (!this.inputTex) {
            return;
        }
        var scalePgm = this.scaleProgram;
        var thinLinesPgm = this.thinLinesProgram;
        var lumaPgm = this.lumaProgram;
        var lumaGausXPgm = this.lumaGausXProgram;
        var lumaGausYPgm = this.lumaGausYProgram;
        var lineDetectPgm = this.lineDetectProgram;
        var lineGausXPgm = this.lineGausXProgram;
        var lineGausYPgm = this.lineGausYProgram;
        var gradPgm = this.gradProgram;
        var refinePgm = this.refineProgram;
        var fxaaPgm = this.fxaaProgram;
        var drawPgm = this.drawProgram;
        // Nasty trick to fix video quailty changing bug.
        if (this.gl.getError() == this.gl.INVALID_VALUE) {
            console.log('glError detected! Fetching new viedo tag... (This may happen due to resolution change)');
            var newMov = document.getElementsByTagName("video")[0];
            this.input(newMov);
        }
        if (this.inputMov) {
            updateTexture(this.gl, this.inputTex, this.inputMov);
        }
        // Automatic change scale according to original video resolution.
        if (this.inputMov.videoHeight > 0) {
            var newScale = 1440 / this.inputMov.videoHeight;
            if (this.scale != newScale) {
                this.scale = newScale;
                console.log('Setting scale to ' + this.scale);
            }
        }
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.STENCIL_TEST);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        // First upscaling with Bicubic interpolation.
        // Upscaling
        bindFramebuffer(this.gl, this.framebuffer, this.scaleTexture);
        this.gl.useProgram(scalePgm.program);
        bindAttribute(this.gl, this.quadBuffer, scalePgm.a_pos, 2);
        bindTexture(this.gl, this.inputTex, 0);
        this.gl.uniform1i(scalePgm.u_texture, 0);
        this.gl.uniform2f(scalePgm.u_size, this.inputWidth, this.inputHeight);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // Scaled: scaleTexture
        // Thin Lines
        bindFramebuffer(this.gl, this.framebuffer, this.scaleTexture2);
        this.gl.useProgram(thinLinesPgm.program);
        bindAttribute(this.gl, this.quadBuffer, thinLinesPgm.a_pos, 2);
        bindTexture(this.gl, this.scaleTexture, 0);
        this.gl.uniform1i(thinLinesPgm.scaled_texture, 0);
        this.gl.uniform1f(thinLinesPgm.u_scale, this.scale);
        this.gl.uniform2f(thinLinesPgm.u_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // Scaled: scaleTexture2
        // Compute Luminance
        bindFramebuffer(this.gl, this.framebuffer, this.postKernelTexture);
        this.gl.useProgram(lumaPgm.program);
        bindAttribute(this.gl, this.quadBuffer, lumaPgm.a_pos, 2);
        bindTexture(this.gl, this.scaleTexture2, 0);
        this.gl.uniform1i(lumaPgm.scaled_texture, 0);
        this.gl.uniform2f(lumaPgm.u_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // Scaled: scaleTexture2 (unchanged)
        // PostKernel: postKernelTexture (luminance)
        // Compute Luminance Gaussian X
        bindFramebuffer(this.gl, this.framebuffer, this.postKernelTexture2);
        this.gl.useProgram(lumaGausXPgm.program);
        bindAttribute(this.gl, this.quadBuffer, lumaGausXPgm.a_pos, 2);
        bindTexture(this.gl, this.scaleTexture2, 0);
        bindTexture(this.gl, this.postKernelTexture, 1);
        this.gl.uniform1i(lumaGausXPgm.scaled_texture, 0);
        this.gl.uniform1i(lumaGausXPgm.post_kernel_texture, 1);
        this.gl.uniform2f(lumaGausXPgm.u_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // PostKernel: postKernelTexture2
        // Compute Luminance Gaussian Y
        bindFramebuffer(this.gl, this.framebuffer, this.postKernelTexture);
        this.gl.useProgram(lumaGausYPgm.program);
        bindAttribute(this.gl, this.quadBuffer, lumaGausYPgm.a_pos, 2);
        bindTexture(this.gl, this.scaleTexture2, 0);
        bindTexture(this.gl, this.postKernelTexture2, 1);
        this.gl.uniform1i(lumaGausYPgm.scaled_texture, 0);
        this.gl.uniform1i(lumaGausYPgm.post_kernel_texture, 1);
        this.gl.uniform2f(lumaGausYPgm.u_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // PostKernel: postKernelTexture
        // Line detect
        bindFramebuffer(this.gl, this.framebuffer, this.postKernelTexture2);
        this.gl.useProgram(lineDetectPgm.program);
        bindAttribute(this.gl, this.quadBuffer, lumaGausYPgm.a_pos, 2);
        bindTexture(this.gl, this.scaleTexture2, 0);
        bindTexture(this.gl, this.postKernelTexture, 1);
        this.gl.uniform1i(lineDetectPgm.scaled_texture, 0);
        this.gl.uniform1i(lineDetectPgm.post_kernel_texture, 1);
        this.gl.uniform2f(lineDetectPgm.u_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // PostKernel: postKernelTexture2
        // Compute Line Gaussian X
        bindFramebuffer(this.gl, this.framebuffer, this.postKernelTexture);
        this.gl.useProgram(lineGausXPgm.program);
        bindAttribute(this.gl, this.quadBuffer, lineGausXPgm.a_pos, 2);
        bindTexture(this.gl, this.scaleTexture2, 0);
        bindTexture(this.gl, this.postKernelTexture2, 1);
        this.gl.uniform1i(lineGausXPgm.scaled_texture, 0);
        this.gl.uniform1i(lineGausXPgm.post_kernel_texture, 1);
        this.gl.uniform2f(lineGausXPgm.u_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // PostKernel: postKernelTexture
        // Compute Line Gaussian Y
        bindFramebuffer(this.gl, this.framebuffer, this.postKernelTexture2);
        this.gl.useProgram(lineGausYPgm.program);
        bindAttribute(this.gl, this.quadBuffer, lineGausYPgm.a_pos, 2);
        bindTexture(this.gl, this.scaleTexture2, 0);
        bindTexture(this.gl, this.postKernelTexture, 1);
        this.gl.uniform1i(lineGausYPgm.scaled_texture, 0);
        this.gl.uniform1i(lineGausYPgm.post_kernel_texture, 1);
        this.gl.uniform2f(lineGausYPgm.u_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // PostKernel: postKernelTexture2
        // Compute Gradient
        bindFramebuffer(this.gl, this.framebuffer, this.postKernelTexture);
        this.gl.useProgram(gradPgm.program);
        bindAttribute(this.gl, this.quadBuffer, gradPgm.a_pos, 2);
        bindTexture(this.gl, this.scaleTexture2, 0);
        bindTexture(this.gl, this.postKernelTexture2, 1);
        this.gl.uniform1i(gradPgm.scaleFrag, 0);
        this.gl.uniform1i(gradPgm.post_kernel_texture, 1);
        this.gl.uniform2f(gradPgm.u_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // PostKernel: postKernelTexture
        // Refine
        bindFramebuffer(this.gl, this.framebuffer, this.scaleTexture);
        this.gl.useProgram(refinePgm.program);
        bindAttribute(this.gl, this.quadBuffer, refinePgm.a_pos, 2);
        bindTexture(this.gl, this.scaleTexture2, 0);
        bindTexture(this.gl, this.postKernelTexture, 1);
        this.gl.uniform1i(refinePgm.u_texture, 0);
        this.gl.uniform1i(refinePgm.u_textureTemp, 1);
        this.gl.uniform1f(refinePgm.u_scale, this.scale);
        this.gl.uniform2f(refinePgm.u_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // PostKernel: scaleTexture
        // FXAA
        bindFramebuffer(this.gl, this.framebuffer, this.scaleTexture2);
        this.gl.useProgram(fxaaPgm.program);
        bindAttribute(this.gl, this.quadBuffer, fxaaPgm.a_pos, 2);
        bindTexture(this.gl, this.scaleTexture, 0);
        bindTexture(this.gl, this.postKernelTexture, 1);
        this.gl.uniform1i(fxaaPgm.u_texture, 0);
        this.gl.uniform1i(fxaaPgm.u_textureTemp, 1);
        this.gl.uniform1f(fxaaPgm.u_scale, this.scale);
        this.gl.uniform2f(fxaaPgm.u_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        // PostKernel: scaleTexture2
        // Draw
        bindFramebuffer(this.gl, null, null);
        this.gl.useProgram(drawPgm.program);
        bindAttribute(this.gl, this.quadBuffer, drawPgm.a_pos, 2);
        bindTexture(this.gl, this.scaleTexture2, 0);
        this.gl.uniform1i(drawPgm.u_texture, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    };
    return Scaler;
}());
exports.Scaler = Scaler;


/***/ }),

/***/ "./src/scaler/shader.ts":
/*!******************************!*\
  !*** ./src/scaler/shader.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Original WebGL implementation by NeuroWhAI.
// 1.0RC2 by net2cn
// https://github.com/bloc97/Anime4K/blob/master/web/main.js
exports.__esModule = true;
var Shaders = /** @class */ (function () {
    function Shaders() {
        this.quadVert = "\n        precision mediump float;\n\n        attribute vec2 a_pos;\n        varying vec2 v_tex_pos;\n\n        void main() {\n            v_tex_pos = a_pos;\n            gl_Position = vec4(1.0 - 2.0 * a_pos, 0, 1);\n        }\n        ";
        this.scaleFrag = "\n        precision mediump float;\n\n        uniform sampler2D u_texture;\n        uniform vec2 u_size;\n        varying vec2 v_tex_pos;\n\n        vec4 interp(const vec2 uv) {\n            vec2 px = 1.0 / u_size;\n            vec2 vc = (floor(uv * u_size)) * px;\n            vec2 f = fract(uv * u_size);\n            vec4 tl = texture2D(u_texture, vc);\n            vec4 tr = texture2D(u_texture, vc + vec2(px.x, 0));\n            vec4 bl = texture2D(u_texture, vc + vec2(0, px.y));\n            vec4 br = texture2D(u_texture, vc + px);\n            return mix(mix(tl, tr, f.x), mix(bl, br, f.x), f.y);\n        }\n\n        void main() {\n            gl_FragColor = interp(1.0 - v_tex_pos);\n            //gl_FragColor = texture2D(u_texture, 1.0 - v_tex_pos);\n        }\n        ";
        this.thinLinesFrag = "\n        precision mediump float;\n\n        uniform sampler2D scaled_texture;\n        uniform float u_scale;\n        uniform vec2 u_pt;\n        varying vec2 v_tex_pos;\n\n        #define strength (min(u_scale / 6.0, 1.0))\n\n        vec4 HOOKED_tex(vec2 pos) {\n            return texture2D(scaled_texture, pos);\n        }\n\n        float getLum(vec4 rgb) {\n            return (rgb.r + rgb.r + rgb.g + rgb.g + rgb.g + rgb.b) / 6.0;\n        }\n\n        vec4 getLargest(vec4 cc, vec4 lightestColor, vec4 a, vec4 b, vec4 c) {\n            vec4 newColor = cc * (1.0 - strength) + ((a + b + c) / 3.0) * strength;\n            if (newColor.a > lightestColor.a) {\n                return newColor;\n            }\n            return lightestColor;\n        }\n\n        vec4 getRGBL(vec2 pos) {\n            return vec4(HOOKED_tex(pos).rgb, getLum(HOOKED_tex(pos)));\n        }\n\n        float min3v(vec4 a, vec4 b, vec4 c) {\n            return min(min(a.a, b.a), c.a);\n        }\n        float max3v(vec4 a, vec4 b, vec4 c) {\n            return max(max(a.a, b.a), c.a);\n        }\n\n        void main() {\n            vec2 HOOKED_pos = v_tex_pos;\n\n            vec2 d = u_pt;\n\n            vec4 cc = getRGBL(HOOKED_pos);\n            vec4 t = getRGBL(HOOKED_pos + vec2(0.0, -d.y));\n            vec4 tl = getRGBL(HOOKED_pos + vec2(-d.x, -d.y));\n            vec4 tr = getRGBL(HOOKED_pos + vec2(d.x, -d.y));\n\n            vec4 l = getRGBL(HOOKED_pos + vec2(-d.x, 0.0));\n            vec4 r = getRGBL(HOOKED_pos + vec2(d.x, 0.0));\n\n            vec4 b = getRGBL(HOOKED_pos + vec2(0.0, d.y));\n            vec4 bl = getRGBL(HOOKED_pos + vec2(-d.x, d.y));\n            vec4 br = getRGBL(HOOKED_pos + vec2(d.x, d.y));\n\n            vec4 lightestColor = cc;\n\n            //Kernel 0 and 4\n            float maxDark = max3v(br, b, bl);\n            float minLight = min3v(tl, t, tr);\n\n            if (minLight > cc.a && minLight > maxDark) {\n                lightestColor = getLargest(cc, lightestColor, tl, t, tr);\n            } else {\n                maxDark = max3v(tl, t, tr);\n                minLight = min3v(br, b, bl);\n                if (minLight > cc.a && minLight > maxDark) {\n                    lightestColor = getLargest(cc, lightestColor, br, b, bl);\n                }\n            }\n\n            //Kernel 1 and 5\n            maxDark = max3v(cc, l, b);\n            minLight = min3v(r, t, tr);\n\n            if (minLight > maxDark) {\n                lightestColor = getLargest(cc, lightestColor, r, t, tr);\n            } else {\n                maxDark = max3v(cc, r, t);\n                minLight = min3v(bl, l, b);\n                if (minLight > maxDark) {\n                    lightestColor = getLargest(cc, lightestColor, bl, l, b);\n                }\n            }\n\n            //Kernel 2 and 6\n            maxDark = max3v(l, tl, bl);\n            minLight = min3v(r, br, tr);\n\n            if (minLight > cc.a && minLight > maxDark) {\n                lightestColor = getLargest(cc, lightestColor, r, br, tr);\n            } else {\n                maxDark = max3v(r, br, tr);\n                minLight = min3v(l, tl, bl);\n                if (minLight > cc.a && minLight > maxDark) {\n                    lightestColor = getLargest(cc, lightestColor, l, tl, bl);\n                }\n            }\n\n            //Kernel 3 and 7\n            maxDark = max3v(cc, l, t);\n            minLight = min3v(r, br, b);\n\n            if (minLight > maxDark) {\n                lightestColor = getLargest(cc, lightestColor, r, br, b);\n            } else {\n                maxDark = max3v(cc, r, b);\n                minLight = min3v(t, l, tl);\n                if (minLight > maxDark) {\n                    lightestColor = getLargest(cc, lightestColor, t, l, tl);\n                }\n            }\n\n            gl_FragColor = lightestColor;\n        }\n        ";
        this.lumaFrag = "\n        precision mediump float;\n\n        uniform sampler2D scaled_texuture;\n        uniform sampler2D post_kernel_texture;\n        uniform vec2 u_pt;\n        varying vec2 v_tex_pos;\n\n        vec4 HOOKED_tex(vec2 pos) {\n            return texture2D(scaled_texuture, pos);\n        }\n\n        float getLum(vec4 rgb) {\n            return (rgb.r + rgb.r + rgb.g + rgb.g + rgb.g + rgb.b) / 6.0;\n        }\n\n        void main() { //Save lum on OUTPUT\n            vec2 HOOKED_pos = v_tex_pos;\n\n            vec4 rgb = HOOKED_tex(HOOKED_pos);\n            float lum = getLum(rgb);\n            gl_FragColor = vec4(lum);\n        }\n        ";
        this.lumaGausXFrag = "\n        precision mediump float;\n\n        uniform sampler2D scaled_texture;\n        uniform sampler2D post_kernel_texture;\n        uniform vec2 u_pt;\n        varying vec2 v_tex_pos;\n\n        vec4 HOOKED_tex(vec2 pos) {\n            return texture2D(scaled_texture, pos);\n        }\n\n        vec4 LUMA_tex(vec2 pos){\n            return texture2D(post_kernel_texture, pos);\n        }\n\n        float lumGaussian5(vec2 pos, vec2 d) {\n            float g = LUMA_tex(pos - (d * 2.0)).x * 0.187691;\n            g = g + LUMA_tex(pos - d).x * 0.206038;\n            g = g + LUMA_tex(pos).x * 0.212543;\n            g = g + LUMA_tex(pos + d).x * 0.206038;\n            g = g + LUMA_tex(pos + (d * 2.0)).x * 0.187691;\n            \n            return clamp(g, 0.0, 1.0); //Clamp for sanity check\n        }\n\n\n        void main() {\n            vec2 HOOKED_pos = v_tex_pos;\n            vec2 HOOKED_pt = u_pt;\n\n            float g = lumGaussian5(HOOKED_pos, vec2(HOOKED_pt.x, 0));\n            gl_FragColor = vec4(LUMA_tex(HOOKED_pos).x, g, LUMA_tex(HOOKED_pos).zw);\n        }\n        ";
        this.lumaGausYFrag = "\n        precision mediump float;\n\n        uniform sampler2D scaled_texture;\n        uniform sampler2D post_kernel_texture;\n        uniform vec2 u_pt;\n        varying vec2 v_tex_pos;\n\n        vec4 HOOKED_tex(vec2 pos) {\n            return texture2D(scaled_texture, pos);\n        }\n\n        vec4 LUMAG_tex(vec2 pos){\n            return texture2D(post_kernel_texture, pos);\n        }\n\n        float lumGaussian5(vec2 pos, vec2 d) {\n            float g = LUMAG_tex(pos - (d * 2.0)).x * 0.187691;\n            g = g + LUMAG_tex(pos - d).x * 0.206038;\n            g = g + LUMAG_tex(pos).x * 0.212543;\n            g = g + LUMAG_tex(pos + d).x * 0.206038;\n            g = g + LUMAG_tex(pos + (d * 2.0)).x * 0.187691;\n            \n            return clamp(g, 0.0, 1.0); //Clamp for sanity check\n        }\n\n        void main() {\n            vec2 HOOKED_pos = v_tex_pos;\n            vec2 HOOKED_pt = u_pt;\n\n            float g = lumGaussian5(HOOKED_pos, vec2(0, HOOKED_pt.y));\n            gl_FragColor = vec4(LUMAG_tex(HOOKED_pos).x, g, LUMAG_tex(HOOKED_pos).zw);\n        }\n        ";
        this.lineDetectFrag = "\n        precision mediump float;\n\n        uniform sampler2D scaled_texture;\n        uniform sampler2D post_kernel_texture;\n        uniform vec2 u_pt;\n        varying vec2 v_tex_pos;\n\n        #define BlendColorDodgef(base, blend) \t(((blend) == 1.0) ? (blend) : min((base) / (1.0 - (blend)), 1.0))\n        #define BlendColorDividef(top, bottom) \t(((bottom) == 1.0) ? (bottom) : min((top) / (bottom), 1.0))\n\n        // Component wise blending\n        #define Blend(base, blend, funcf) \t\tvec3(funcf(base.r, blend.r), funcf(base.g, blend.g), funcf(base.b, blend.b))\n        #define BlendColorDodge(base, blend) \tBlend(base, blend, BlendColorDodgef)\n\n        vec4 HOOKED_tex(vec2 pos) {\n            return texture2D(scaled_texture, pos);\n        }\n\n        vec4 POSTKERNEL_tex(vec2 pos){\n            return texture2D(post_kernel_texture, pos);\n        }\n\n        void main() {\n            vec2 HOOKED_pos = v_tex_pos;\n\n            float lum = clamp(POSTKERNEL_tex(HOOKED_pos).x, 0.001, 0.999);\n            float lumg = clamp(POSTKERNEL_tex(HOOKED_pos).y, 0.001, 0.999);\n\n            float pseudolines = BlendColorDividef(lum, lumg);\n            pseudolines = 1.0 - clamp(pseudolines - 0.05, 0.0, 1.0);\n\n            gl_FragColor = vec4(pseudolines, 0, 0, 0);\n        }\n        ";
        this.lineGausXFrag = "\n        precision mediump float;\n\n        uniform sampler2D scaled_texture;\n        uniform sampler2D post_kernel_texture;\n        uniform vec2 u_pt;\n        varying vec2 v_tex_pos;\n\n        vec4 HOOKED_tex(vec2 pos) {\n            return texture2D(scaled_texture, pos);\n        }\n\n        vec4 LUMAG_tex(vec2 pos){\n            return texture2D(post_kernel_texture, pos);\n        }\n\n        float lumGaussian5(vec2 pos, vec2 d) {\n            float g = LUMAG_tex(pos - (d * 2.0)).x * 0.187691;\n            g = g + LUMAG_tex(pos - d).x * 0.206038;\n            g = g + LUMAG_tex(pos).x * 0.212543;\n            g = g + LUMAG_tex(pos + d).x * 0.206038;\n            g = g + LUMAG_tex(pos + (d * 2.0)).x * 0.187691;\n            \n            return clamp(g, 0.0, 1.0); //Clamp for sanity check\n        }\n\n        void main() {\n            vec2 HOOKED_pos = v_tex_pos;\n            vec2 HOOKED_pt = u_pt;\n\n            float g = lumGaussian5(HOOKED_pos, vec2(HOOKED_pt.x, 0.0));\n            gl_FragColor = vec4(g, 0, 0, 0);\n        }\n        ";
        this.lineGausYFrag = "\n        precision mediump float;\n\n        uniform sampler2D scaled_texture;\n        uniform sampler2D post_kernel_texture;\n        uniform vec2 u_pt;\n        varying vec2 v_tex_pos;\n\n        vec4 HOOKED_tex(vec2 pos) {\n            return texture2D(scaled_texture, pos);\n        }\n\n        vec4 LUMAG_tex(vec2 pos){\n            return texture2D(post_kernel_texture, pos);\n        }\n\n        float lumGaussian5(vec2 pos, vec2 d) {\n            float g = LUMAG_tex(pos - (d * 2.0)).x * 0.187691;\n            g = g + LUMAG_tex(pos - d).x * 0.206038;\n            g = g + LUMAG_tex(pos).x * 0.212543;\n            g = g + LUMAG_tex(pos + d).x * 0.206038;\n            g = g + LUMAG_tex(pos + (d * 2.0)).x * 0.187691;\n            \n            return clamp(g, 0.0, 1.0); //Clamp for sanity check\n        }\n\n        void main() {\n            vec2 HOOKED_pos = v_tex_pos;\n            vec2 HOOKED_pt = u_pt;\n\n            float g = lumGaussian5(HOOKED_pos, vec2(0.0, HOOKED_pt.y));\n            gl_FragColor = vec4(g, 0, 0, 0);\n        }\n        ";
        this.gradFrag = "\n        precision mediump float;\n\n        uniform sampler2D u_texture;\n        uniform sampler2D u_textureTemp;\n        uniform vec2 u_pt;\n        varying vec2 v_tex_pos;\n\n        vec4 HOOKED_tex(vec2 pos) {\n            return texture2D(u_texture, 1.0 - pos);\n        }\n\n        vec4 POSTKERNEL_tex(vec2 pos) {\n            return texture2D(u_textureTemp, 1.0 - pos);\n        }\n\n        vec4 getRGBL(vec2 pos) {\n            return vec4(HOOKED_tex(pos).rgb, POSTKERNEL_tex(pos).x);\n        }\n\n        void main() {\n            vec2 HOOKED_pos = v_tex_pos;\n\n            vec2 d = u_pt;\n\n            //[tl  t tr]\n            //[ l cc  r]\n            //[bl  b br]\n            vec4 cc = getRGBL(HOOKED_pos);\n            vec4 t = getRGBL(HOOKED_pos + vec2(0.0, -d.y));\n            vec4 tl = getRGBL(HOOKED_pos + vec2(-d.x, -d.y));\n            vec4 tr = getRGBL(HOOKED_pos + vec2(d.x, -d.y));\n\n            vec4 l = getRGBL(HOOKED_pos + vec2(-d.x, 0.0));\n            vec4 r = getRGBL(HOOKED_pos + vec2(d.x, 0.0));\n\n            vec4 b = getRGBL(HOOKED_pos + vec2(0.0, d.y));\n            vec4 bl = getRGBL(HOOKED_pos + vec2(-d.x, d.y));\n            vec4 br = getRGBL(HOOKED_pos + vec2(d.x, d.y));\n\n            //Horizontal Gradient\n            //[-1  0  1]\n            //[-2  0  2]\n            //[-1  0  1]\n            float xgrad = (-tl.a + tr.a - l.a - l.a + r.a + r.a - bl.a + br.a);\n\n            //Vertical Gradient\n            //[-1 -2 -1]\n            //[ 0  0  0]\n            //[ 1  2  1]\n            float ygrad = (-tl.a - t.a - t.a - tr.a + bl.a + b.a + b.a + br.a);\n\n            gl_FragColor = vec4(1.0 - clamp(sqrt(xgrad * xgrad + ygrad * ygrad), 0.0, 1.0));\n        }\n        ";
        this.refineFrag = "\n        precision mediump float;\n\n        uniform sampler2D u_texture;\n        uniform sampler2D u_textureTemp;\n        uniform vec2 u_pt;\n        uniform float u_scale;\n        varying vec2 v_tex_pos;\n\n        vec4 HOOKED_tex(vec2 pos) {\n            return texture2D(u_texture, vec2(pos.x, 1.0 - pos.y));\n        }\n\n        vec4 POSTKERNEL_tex(vec2 pos) {\n            return texture2D(u_textureTemp, vec2(pos.x, 1.0 - pos.y));\n        }\n\n        #define LINE_DETECT_MUL 8.0\n        #define LINE_DETECT_THRESHOLD 0.2\n\n        #define strength (min(u_scale, 1.0))\n        #define lineprob (POSTKERNEL_tex(v_tex_pos).y)\n\n        vec4 getAverage(vec4 cc, vec4 a, vec4 b, vec4 c) {\n            float prob = clamp(lineprob * LINE_DETECT_MUL, 0.0, 1.0);\n            if (prob < LINE_DETECT_THRESHOLD) {\n                prob = 0.0;\n            }\n            float realstrength = clamp(strength * prob, 0.0, 1.0);\n            return cc * (1.0 - realstrength) + ((a + b + c) / 3.0) * realstrength;\n        }\n\n        vec4 getRGBL(vec2 pos) {\n            return vec4(HOOKED_tex(pos).rgb, POSTKERNEL_tex(pos).z);\n        }\n\n        float min3v(vec4 a, vec4 b, vec4 c) {\n            return min(min(a.a, b.a), c.a);\n        }\n        float max3v(vec4 a, vec4 b, vec4 c) {\n            return max(max(a.a, b.a), c.a);\n        }\n\n        void main()  {\n            vec2 HOOKED_pos = v_tex_pos;\n\n            vec2 d = u_pt;\n\n            vec4 cc = getRGBL(HOOKED_pos);\n            vec4 t = getRGBL(HOOKED_pos + vec2(0.0, -d.y));\n            vec4 tl = getRGBL(HOOKED_pos + vec2(-d.x, -d.y));\n            vec4 tr = getRGBL(HOOKED_pos + vec2(d.x, -d.y));\n\n            vec4 l = getRGBL(HOOKED_pos + vec2(-d.x, 0.0));\n            vec4 r = getRGBL(HOOKED_pos + vec2(d.x, 0.0));\n\n            vec4 b = getRGBL(HOOKED_pos + vec2(0.0, d.y));\n            vec4 bl = getRGBL(HOOKED_pos + vec2(-d.x, d.y));\n            vec4 br = getRGBL(HOOKED_pos + vec2(d.x, d.y));\n\n            //Kernel 0 and 4\n            float maxDark = max3v(br, b, bl);\n            float minLight = min3v(tl, t, tr);\n\n            if (minLight > cc.a && minLight > maxDark) {\n                gl_FragColor = getAverage(cc, tl, t, tr);\n                return;\n            } else {\n                maxDark = max3v(tl, t, tr);\n                minLight = min3v(br, b, bl);\n                if (minLight > cc.a && minLight > maxDark) {\n                    gl_FragColor = getAverage(cc, br, b, bl);\n                    return;\n                }\n            }\n\n            //Kernel 1 and 5\n            maxDark = max3v(cc, l, b);\n            minLight = min3v(r, t, tr);\n\n            if (minLight > maxDark) {\n                gl_FragColor = getAverage(cc, r, t, tr);\n                return;\n            } else {\n                maxDark = max3v(cc, r, t);\n                minLight = min3v(bl, l, b);\n                if (minLight > maxDark) {\n                    gl_FragColor = getAverage(cc, bl, l, b);\n                    return;\n                }\n            }\n\n            //Kernel 2 and 6\n            maxDark = max3v(l, tl, bl);\n            minLight = min3v(r, br, tr);\n\n            if (minLight > cc.a && minLight > maxDark) {\n                gl_FragColor = getAverage(cc, r, br, tr);\n                return;\n            } else {\n                maxDark = max3v(r, br, tr);\n                minLight = min3v(l, tl, bl);\n                if (minLight > cc.a && minLight > maxDark) {\n                    gl_FragColor = getAverage(cc, l, tl, bl);\n                    return;\n                }\n            }\n\n            //Kernel 3 and 7\n            maxDark = max3v(cc, l, t);\n            minLight = min3v(r, br, b);\n\n            if (minLight > maxDark) {\n                gl_FragColor = getAverage(cc, r, br, b);\n                return;\n            } else {\n                maxDark = max3v(cc, r, b);\n                minLight = min3v(t, l, tl);\n                if (minLight > maxDark) {\n                    gl_FragColor = getAverage(cc, t, l, tl);\n                    return;\n                }\n            }\n\n\n            gl_FragColor = cc;\n        }\n        ";
        this.fxaaFrag = "\n        precision mediump float;\n\n        uniform sampler2D u_texture;\n        uniform sampler2D u_textureTemp;\n        uniform vec2 u_pt;\n        uniform float u_scale;\n        varying vec2 v_tex_pos;\n\n        vec4 HOOKED_tex(vec2 pos) {\n            return texture2D(u_texture, vec2(pos.x, 1.0 - pos.y));\n        }\n\n        vec4 POSTKERNEL_tex(vec2 pos) {\n            return texture2D(u_textureTemp, vec2(pos.x, 1.0 - pos.y));\n        }\n\n        #define FXAA_MIN (1.0 / 128.0)\n        #define FXAA_MUL (1.0 / 8.0)\n        #define FXAA_SPAN 8.0\n\n        #define LINE_DETECT_MUL 4.0\n        #define LINE_DETECT_THRESHOLD 0.2\n\n        #define strength (min(u_scale, 1.0))\n        #define lineprob (POSTKERNEL_tex(v_tex_pos).y)\n\n        vec4 getAverage(vec4 cc, vec4 xc) {\n            float prob = clamp(lineprob * LINE_DETECT_MUL, 0.0, 1.0);\n            if (prob < LINE_DETECT_THRESHOLD) {\n                prob = 0.0;\n            }\n            float realstrength = clamp(strength * prob, 0.0, 1.0);\n            return cc * (1.0 - realstrength) + xc * realstrength;\n        }\n\n        float getLum(vec4 rgb) {\n            return (rgb.r + rgb.r + rgb.g + rgb.g + rgb.g + rgb.b) / 6.0;\n        }\n\n        void main()  {\n            vec2 HOOKED_pos = v_tex_pos;\n\n            vec2 d = u_pt;\n\n            vec4 cc = HOOKED_tex(HOOKED_pos);\n            vec4 xc = cc;\n\n            float t = POSTKERNEL_tex(HOOKED_pos + vec2(0, -d.y)).x;\n            float l = POSTKERNEL_tex(HOOKED_pos + vec2(-d.x, 0)).x;\n            float r = POSTKERNEL_tex(HOOKED_pos + vec2(d.x, 0)).x;\n            float b = POSTKERNEL_tex(HOOKED_pos + vec2(0, d.y)).x;\n\n            float tl = POSTKERNEL_tex(HOOKED_pos + vec2(-d.x, -d.y)).x;\n            float tr = POSTKERNEL_tex(HOOKED_pos + vec2(d.x, -d.y)).x;\n            float bl = POSTKERNEL_tex(HOOKED_pos + vec2(-d.x, d.y)).x;\n            float br = POSTKERNEL_tex(HOOKED_pos + vec2(d.x, d.y)).x;\n            float cl  = POSTKERNEL_tex(HOOKED_pos).x;\n\n            float minl = min(cl, min(min(tl, tr), min(bl, br)));\n            float maxl = max(cl, max(max(tl, tr), max(bl, br)));\n\n            vec2 dir = vec2(- tl - tr + bl + br, tl - tr + bl - br);\n\n            float dirReduce = max((tl + tr + bl + br) *\n                                (0.25 * FXAA_MUL), FXAA_MIN);\n\n            float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n            dir = min(vec2(FXAA_SPAN, FXAA_SPAN),\n                    max(vec2(-FXAA_SPAN, -FXAA_SPAN),\n                    dir * rcpDirMin)) * d;\n\n            vec4 rgbA = 0.5 * (\n                HOOKED_tex(HOOKED_pos + dir * -(1.0/6.0)) +\n                HOOKED_tex(HOOKED_pos + dir * (1.0/6.0)));\n            vec4 rgbB = rgbA * 0.5 + 0.25 * (\n                HOOKED_tex(HOOKED_pos + dir * -0.5) +\n                HOOKED_tex(HOOKED_pos + dir * 0.5));\n\n            //vec4 luma = vec4(0.299, 0.587, 0.114, 0.0);\n            //float lumb = dot(rgbB, luma);\n            float lumb = getLum(rgbB);\n\n            if ((lumb < minl) || (lumb > maxl)) {\n                xc = rgbA;\n            } else {\n                xc = rgbB;\n            }\n            gl_FragColor = getAverage(cc, xc);\n        }\n        ";
        this.drawFrag = "\n        precision mediump float;\n\n        uniform sampler2D u_texture;\n        varying vec2 v_tex_pos;\n\n        void main() {\n            vec4 color = texture2D(u_texture, vec2(v_tex_pos.x, 1.0 - v_tex_pos.y));\n            gl_FragColor = color;\n        }\n        ";
    }
    return Shaders;
}());
exports.Shaders = Shaders;


/***/ })

/******/ });