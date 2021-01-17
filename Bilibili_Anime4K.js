// ==UserScript==
// @name                Bilibili_Anime4K
// @name:zh-CN          Bilibili Anime4K滤镜
// @description         Bring Anime4K to Bilibili's HTML5 player to clearify 2D anime.
// @description:zh-CN   通过Anime4K滤镜让Bilibili上的2D番剧更加清晰
// @namespace           http://net2cn.tk/
// @homepageURL         https://github.com/net2cn/Bilibili_Anime4K/
// @supportURL          https://github.com/net2cn/Bilibili_Anime4K/issues
// @version             0.4.4
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

// WebGL implementation by NeuroWhAI.
// https://github.com/bloc97/Anime4K/blob/master/web/main.js

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);

    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
    }

    return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
    var program = gl.createProgram();

    //console.log(fragmentSource)

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

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

function createTexture(gl, filter, data, width, height) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    if (data instanceof Uint8Array) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    } else {
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


const quadVert = `
precision mediump float;

attribute vec2 a_pos;
varying vec2 v_tex_pos;

void main() {
    v_tex_pos = a_pos;
    gl_Position = vec4(1.0 - 2.0 * a_pos, 0, 1);
}
`;

const scaleFrag = `
precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_size;
varying vec2 v_tex_pos;

vec4 interp(const vec2 uv) {
    vec2 px = 1.0 / u_size;
    vec2 vc = (floor(uv * u_size)) * px;
    vec2 f = fract(uv * u_size);
    vec4 tl = texture2D(u_texture, vc);
    vec4 tr = texture2D(u_texture, vc + vec2(px.x, 0));
    vec4 bl = texture2D(u_texture, vc + vec2(0, px.y));
    vec4 br = texture2D(u_texture, vc + px);
    return mix(mix(tl, tr, f.x), mix(bl, br, f.x), f.y);
}

void main() {
    gl_FragColor = interp(1.0 - v_tex_pos);
    //gl_FragColor = texture2D(u_texture, 1.0 - v_tex_pos);
}
`;

const thinLinesFrag = `
precision mediump float;

uniform sampler2D scaled_texture;
uniform float u_scale;
uniform vec2 u_pt;
varying vec2 v_tex_pos;

#define strength (min(u_scale / 6.0, 1.0))

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(scaled_texture, pos);
}

float getLum(vec4 rgb) {
	return (rgb.r + rgb.r + rgb.g + rgb.g + rgb.g + rgb.b) / 6.0;
}

vec4 getLargest(vec4 cc, vec4 lightestColor, vec4 a, vec4 b, vec4 c) {
	vec4 newColor = cc * (1.0 - strength) + ((a + b + c) / 3.0) * strength;
	if (newColor.a > lightestColor.a) {
		return newColor;
	}
	return lightestColor;
}

vec4 getRGBL(vec2 pos) {
    return vec4(HOOKED_tex(pos).rgb, getLum(HOOKED_tex(pos)));
}

float min3v(vec4 a, vec4 b, vec4 c) {
	return min(min(a.a, b.a), c.a);
}
float max3v(vec4 a, vec4 b, vec4 c) {
	return max(max(a.a, b.a), c.a);
}

void main() {
    vec2 HOOKED_pos = v_tex_pos;

	vec2 d = u_pt;

    vec4 cc = getRGBL(HOOKED_pos);
	vec4 t = getRGBL(HOOKED_pos + vec2(0.0, -d.y));
	vec4 tl = getRGBL(HOOKED_pos + vec2(-d.x, -d.y));
	vec4 tr = getRGBL(HOOKED_pos + vec2(d.x, -d.y));

	vec4 l = getRGBL(HOOKED_pos + vec2(-d.x, 0.0));
	vec4 r = getRGBL(HOOKED_pos + vec2(d.x, 0.0));

	vec4 b = getRGBL(HOOKED_pos + vec2(0.0, d.y));
	vec4 bl = getRGBL(HOOKED_pos + vec2(-d.x, d.y));
	vec4 br = getRGBL(HOOKED_pos + vec2(d.x, d.y));

	vec4 lightestColor = cc;

	//Kernel 0 and 4
	float maxDark = max3v(br, b, bl);
	float minLight = min3v(tl, t, tr);

	if (minLight > cc.a && minLight > maxDark) {
		lightestColor = getLargest(cc, lightestColor, tl, t, tr);
	} else {
		maxDark = max3v(tl, t, tr);
		minLight = min3v(br, b, bl);
		if (minLight > cc.a && minLight > maxDark) {
			lightestColor = getLargest(cc, lightestColor, br, b, bl);
		}
	}

	//Kernel 1 and 5
	maxDark = max3v(cc, l, b);
	minLight = min3v(r, t, tr);

	if (minLight > maxDark) {
		lightestColor = getLargest(cc, lightestColor, r, t, tr);
	} else {
		maxDark = max3v(cc, r, t);
		minLight = min3v(bl, l, b);
		if (minLight > maxDark) {
			lightestColor = getLargest(cc, lightestColor, bl, l, b);
		}
	}

	//Kernel 2 and 6
	maxDark = max3v(l, tl, bl);
	minLight = min3v(r, br, tr);

	if (minLight > cc.a && minLight > maxDark) {
		lightestColor = getLargest(cc, lightestColor, r, br, tr);
	} else {
		maxDark = max3v(r, br, tr);
		minLight = min3v(l, tl, bl);
		if (minLight > cc.a && minLight > maxDark) {
			lightestColor = getLargest(cc, lightestColor, l, tl, bl);
		}
	}

	//Kernel 3 and 7
	maxDark = max3v(cc, l, t);
	minLight = min3v(r, br, b);

	if (minLight > maxDark) {
		lightestColor = getLargest(cc, lightestColor, r, br, b);
	} else {
		maxDark = max3v(cc, r, b);
		minLight = min3v(t, l, tl);
		if (minLight > maxDark) {
			lightestColor = getLargest(cc, lightestColor, t, l, tl);
		}
    }

    gl_FragColor = lightestColor;
}
`;

const lumaFrag = `
precision mediump float;

uniform sampler2D scaled_texuture;
uniform sampler2D post_kernel_texture;
uniform vec2 u_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(scaled_texuture, pos);
}

float getLum(vec4 rgb) {
	return (rgb.r + rgb.r + rgb.g + rgb.g + rgb.g + rgb.b) / 6.0;
}

void main() { //Save lum on OUTPUT
    vec2 HOOKED_pos = v_tex_pos;

	vec4 rgb = HOOKED_tex(HOOKED_pos);
	float lum = getLum(rgb);
    gl_FragColor = vec4(lum);
}
`;

const lumaGausXFrag = `
precision mediump float;

uniform sampler2D scaled_texture;
uniform sampler2D post_kernel_texture;
uniform vec2 u_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(scaled_texture, pos);
}

vec4 LUMA_tex(vec2 pos){
    return texture2D(post_kernel_texture, pos);
}

float lumGaussian5(vec2 pos, vec2 d) {
	float g = LUMA_tex(pos - (d * 2.0)).x * 0.187691;
	g = g + LUMA_tex(pos - d).x * 0.206038;
	g = g + LUMA_tex(pos).x * 0.212543;
	g = g + LUMA_tex(pos + d).x * 0.206038;
	g = g + LUMA_tex(pos + (d * 2.0)).x * 0.187691;
	
	return clamp(g, 0.0, 1.0); //Clamp for sanity check
}


void main() {
    vec2 HOOKED_pos = v_tex_pos;
    vec2 HOOKED_pt = u_pt;

	float g = lumGaussian5(HOOKED_pos, vec2(HOOKED_pt.x, 0));
    gl_FragColor = vec4(LUMA_tex(HOOKED_pos).x, g, LUMA_tex(HOOKED_pos).zw);
}
`;

const lumaGausYFrag = `
precision mediump float;

uniform sampler2D scaled_texture;
uniform sampler2D post_kernel_texture;
uniform vec2 u_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(scaled_texture, pos);
}

vec4 LUMAG_tex(vec2 pos){
    return texture2D(post_kernel_texture, pos);
}

float lumGaussian5(vec2 pos, vec2 d) {
	float g = LUMAG_tex(pos - (d * 2.0)).x * 0.187691;
	g = g + LUMAG_tex(pos - d).x * 0.206038;
	g = g + LUMAG_tex(pos).x * 0.212543;
	g = g + LUMAG_tex(pos + d).x * 0.206038;
	g = g + LUMAG_tex(pos + (d * 2.0)).x * 0.187691;
	
	return clamp(g, 0.0, 1.0); //Clamp for sanity check
}

void main() {
    vec2 HOOKED_pos = v_tex_pos;
    vec2 HOOKED_pt = u_pt;

	float g = lumGaussian5(HOOKED_pos, vec2(0, HOOKED_pt.y));
    gl_FragColor = vec4(LUMAG_tex(HOOKED_pos).x, g, LUMAG_tex(HOOKED_pos).zw);
}
`;

const lineDetectFrag = `
precision mediump float;

uniform sampler2D scaled_texture;
uniform sampler2D post_kernel_texture;
uniform vec2 u_pt;
varying vec2 v_tex_pos;

#define BlendColorDodgef(base, blend) 	(((blend) == 1.0) ? (blend) : min((base) / (1.0 - (blend)), 1.0))
#define BlendColorDividef(top, bottom) 	(((bottom) == 1.0) ? (bottom) : min((top) / (bottom), 1.0))

// Component wise blending
#define Blend(base, blend, funcf) 		vec3(funcf(base.r, blend.r), funcf(base.g, blend.g), funcf(base.b, blend.b))
#define BlendColorDodge(base, blend) 	Blend(base, blend, BlendColorDodgef)

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(scaled_texture, pos);
}

vec4 POSTKERNEL_tex(vec2 pos){
    return texture2D(post_kernel_texture, pos);
}

void main() {
    vec2 HOOKED_pos = v_tex_pos;

	float lum = clamp(POSTKERNEL_tex(HOOKED_pos).x, 0.001, 0.999);
	float lumg = clamp(POSTKERNEL_tex(HOOKED_pos).y, 0.001, 0.999);

	float pseudolines = BlendColorDividef(lum, lumg);
	pseudolines = 1.0 - clamp(pseudolines - 0.05, 0.0, 1.0);

    gl_FragColor = vec4(pseudolines, 0, 0, 0);
}
`;

const lineGausXFrag = `
precision mediump float;

uniform sampler2D scaled_texture;
uniform sampler2D post_kernel_texture;
uniform vec2 u_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(scaled_texture, pos);
}

vec4 LUMAG_tex(vec2 pos){
    return texture2D(post_kernel_texture, pos);
}

float lumGaussian5(vec2 pos, vec2 d) {
	float g = LUMAG_tex(pos - (d * 2.0)).x * 0.187691;
	g = g + LUMAG_tex(pos - d).x * 0.206038;
	g = g + LUMAG_tex(pos).x * 0.212543;
	g = g + LUMAG_tex(pos + d).x * 0.206038;
	g = g + LUMAG_tex(pos + (d * 2.0)).x * 0.187691;
	
	return clamp(g, 0.0, 1.0); //Clamp for sanity check
}


void main() {
    vec2 HOOKED_pos = v_tex_pos;
    vec2 HOOKED_pt = u_pt;

	float g = lumGaussian5(HOOKED_pos, vec2(HOOKED_pt.x, 0.0));
    gl_FragColor = vec4(g, 0, 0, 0);
}
`;

const lineGausYFrag = `
precision mediump float;

uniform sampler2D scaled_texture;
uniform sampler2D post_kernel_texture;
uniform vec2 u_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(scaled_texture, pos);
}

vec4 LUMAG_tex(vec2 pos){
    return texture2D(post_kernel_texture, pos);
}

float lumGaussian5(vec2 pos, vec2 d) {
	float g = LUMAG_tex(pos - (d * 2.0)).x * 0.187691;
	g = g + LUMAG_tex(pos - d).x * 0.206038;
	g = g + LUMAG_tex(pos).x * 0.212543;
	g = g + LUMAG_tex(pos + d).x * 0.206038;
	g = g + LUMAG_tex(pos + (d * 2.0)).x * 0.187691;
	
	return clamp(g, 0.0, 1.0); //Clamp for sanity check
}

void main() {
    vec2 HOOKED_pos = v_tex_pos;
    vec2 HOOKED_pt = u_pt;

	float g = lumGaussian5(HOOKED_pos, vec2(0.0, HOOKED_pt.y));
    gl_FragColor = vec4(g, 0, 0, 0);
}
`;

const gradFrag = `
precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_textureTemp;
uniform vec2 u_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(u_texture, 1.0 - pos);
}

vec4 POSTKERNEL_tex(vec2 pos) {
    return texture2D(u_textureTemp, 1.0 - pos);
}

vec4 getRGBL(vec2 pos) {
    return vec4(HOOKED_tex(pos).rgb, POSTKERNEL_tex(pos).x);
}

void main() {
    vec2 HOOKED_pos = v_tex_pos;

	vec2 d = u_pt;

	//[tl  t tr]
	//[ l cc  r]
	//[bl  b br]
    vec4 cc = getRGBL(HOOKED_pos);
	vec4 t = getRGBL(HOOKED_pos + vec2(0.0, -d.y));
	vec4 tl = getRGBL(HOOKED_pos + vec2(-d.x, -d.y));
	vec4 tr = getRGBL(HOOKED_pos + vec2(d.x, -d.y));

	vec4 l = getRGBL(HOOKED_pos + vec2(-d.x, 0.0));
	vec4 r = getRGBL(HOOKED_pos + vec2(d.x, 0.0));

	vec4 b = getRGBL(HOOKED_pos + vec2(0.0, d.y));
	vec4 bl = getRGBL(HOOKED_pos + vec2(-d.x, d.y));
	vec4 br = getRGBL(HOOKED_pos + vec2(d.x, d.y));

	//Horizontal Gradient
	//[-1  0  1]
	//[-2  0  2]
	//[-1  0  1]
	float xgrad = (-tl.a + tr.a - l.a - l.a + r.a + r.a - bl.a + br.a);

	//Vertical Gradient
	//[-1 -2 -1]
	//[ 0  0  0]
	//[ 1  2  1]
    float ygrad = (-tl.a - t.a - t.a - tr.a + bl.a + b.a + b.a + br.a);

    gl_FragColor = vec4(1.0 - clamp(sqrt(xgrad * xgrad + ygrad * ygrad), 0.0, 1.0));
}
`;

const refineFrag = `
precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_textureTemp;
uniform vec2 u_pt;
uniform float u_scale;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(u_texture, vec2(pos.x, 1.0 - pos.y));
}

vec4 POSTKERNEL_tex(vec2 pos) {
    return texture2D(u_textureTemp, vec2(pos.x, 1.0 - pos.y));
}

#define LINE_DETECT_MUL 8.0
#define LINE_DETECT_THRESHOLD 0.2

#define strength (min(u_scale, 1.0))
#define lineprob (POSTKERNEL_tex(v_tex_pos).y)

vec4 getAverage(vec4 cc, vec4 a, vec4 b, vec4 c) {
	float prob = clamp(lineprob * LINE_DETECT_MUL, 0.0, 1.0);
	if (prob < LINE_DETECT_THRESHOLD) {
		prob = 0.0;
	}
	float realstrength = clamp(strength * prob, 0.0, 1.0);
	return cc * (1.0 - realstrength) + ((a + b + c) / 3.0) * realstrength;
}

vec4 getRGBL(vec2 pos) {
    return vec4(HOOKED_tex(pos).rgb, POSTKERNEL_tex(pos).z);
}

float min3v(vec4 a, vec4 b, vec4 c) {
	return min(min(a.a, b.a), c.a);
}
float max3v(vec4 a, vec4 b, vec4 c) {
	return max(max(a.a, b.a), c.a);
}

void main()  {
    vec2 HOOKED_pos = v_tex_pos;

	vec2 d = u_pt;

    vec4 cc = getRGBL(HOOKED_pos);
	vec4 t = getRGBL(HOOKED_pos + vec2(0.0, -d.y));
	vec4 tl = getRGBL(HOOKED_pos + vec2(-d.x, -d.y));
	vec4 tr = getRGBL(HOOKED_pos + vec2(d.x, -d.y));

	vec4 l = getRGBL(HOOKED_pos + vec2(-d.x, 0.0));
	vec4 r = getRGBL(HOOKED_pos + vec2(d.x, 0.0));

	vec4 b = getRGBL(HOOKED_pos + vec2(0.0, d.y));
	vec4 bl = getRGBL(HOOKED_pos + vec2(-d.x, d.y));
	vec4 br = getRGBL(HOOKED_pos + vec2(d.x, d.y));

	//Kernel 0 and 4
	float maxDark = max3v(br, b, bl);
	float minLight = min3v(tl, t, tr);

	if (minLight > cc.a && minLight > maxDark) {
        gl_FragColor = getAverage(cc, tl, t, tr);
        return;
	} else {
		maxDark = max3v(tl, t, tr);
		minLight = min3v(br, b, bl);
		if (minLight > cc.a && minLight > maxDark) {
            gl_FragColor = getAverage(cc, br, b, bl);
            return;
		}
	}

	//Kernel 1 and 5
	maxDark = max3v(cc, l, b);
	minLight = min3v(r, t, tr);

	if (minLight > maxDark) {
        gl_FragColor = getAverage(cc, r, t, tr);
        return;
	} else {
		maxDark = max3v(cc, r, t);
		minLight = min3v(bl, l, b);
		if (minLight > maxDark) {
            gl_FragColor = getAverage(cc, bl, l, b);
            return;
		}
	}

	//Kernel 2 and 6
	maxDark = max3v(l, tl, bl);
	minLight = min3v(r, br, tr);

	if (minLight > cc.a && minLight > maxDark) {
        gl_FragColor = getAverage(cc, r, br, tr);
        return;
	} else {
		maxDark = max3v(r, br, tr);
		minLight = min3v(l, tl, bl);
		if (minLight > cc.a && minLight > maxDark) {
            gl_FragColor = getAverage(cc, l, tl, bl);
            return;
		}
	}

	//Kernel 3 and 7
	maxDark = max3v(cc, l, t);
	minLight = min3v(r, br, b);

	if (minLight > maxDark) {
        gl_FragColor = getAverage(cc, r, br, b);
        return;
	} else {
		maxDark = max3v(cc, r, b);
		minLight = min3v(t, l, tl);
		if (minLight > maxDark) {
            gl_FragColor = getAverage(cc, t, l, tl);
            return;
		}
	}


	gl_FragColor = cc;
}
`;

const fxaaFrag = `
precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_textureTemp;
uniform vec2 u_pt;
uniform float u_scale;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(u_texture, vec2(pos.x, 1.0 - pos.y));
}

vec4 POSTKERNEL_tex(vec2 pos) {
    return texture2D(u_textureTemp, vec2(pos.x, 1.0 - pos.y));
}

#define FXAA_MIN (1.0 / 128.0)
#define FXAA_MUL (1.0 / 8.0)
#define FXAA_SPAN 8.0

#define LINE_DETECT_MUL 4.0
#define LINE_DETECT_THRESHOLD 0.2

#define strength (min(u_scale, 1.0))
#define lineprob (POSTKERNEL_tex(v_tex_pos).y)

vec4 getAverage(vec4 cc, vec4 xc) {
	float prob = clamp(lineprob * LINE_DETECT_MUL, 0.0, 1.0);
	if (prob < LINE_DETECT_THRESHOLD) {
		prob = 0.0;
	}
	float realstrength = clamp(strength * prob, 0.0, 1.0);
	return cc * (1.0 - realstrength) + xc * realstrength;
}

float getLum(vec4 rgb) {
	return (rgb.r + rgb.r + rgb.g + rgb.g + rgb.g + rgb.b) / 6.0;
}

void main()  {
    vec2 HOOKED_pos = v_tex_pos;

	vec2 d = u_pt;

    vec4 cc = HOOKED_tex(HOOKED_pos);
    vec4 xc = cc;

	float t = POSTKERNEL_tex(HOOKED_pos + vec2(0, -d.y)).x;
	float l = POSTKERNEL_tex(HOOKED_pos + vec2(-d.x, 0)).x;
	float r = POSTKERNEL_tex(HOOKED_pos + vec2(d.x, 0)).x;
	float b = POSTKERNEL_tex(HOOKED_pos + vec2(0, d.y)).x;

    float tl = POSTKERNEL_tex(HOOKED_pos + vec2(-d.x, -d.y)).x;
    float tr = POSTKERNEL_tex(HOOKED_pos + vec2(d.x, -d.y)).x;
    float bl = POSTKERNEL_tex(HOOKED_pos + vec2(-d.x, d.y)).x;
    float br = POSTKERNEL_tex(HOOKED_pos + vec2(d.x, d.y)).x;
    float cl  = POSTKERNEL_tex(HOOKED_pos).x;

    float minl = min(cl, min(min(tl, tr), min(bl, br)));
    float maxl = max(cl, max(max(tl, tr), max(bl, br)));

    vec2 dir = vec2(- tl - tr + bl + br, tl - tr + bl - br);

    float dirReduce = max((tl + tr + bl + br) *
                          (0.25 * FXAA_MUL), FXAA_MIN);

    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(FXAA_SPAN, FXAA_SPAN),
              max(vec2(-FXAA_SPAN, -FXAA_SPAN),
              dir * rcpDirMin)) * d;

    vec4 rgbA = 0.5 * (
        HOOKED_tex(HOOKED_pos + dir * -(1.0/6.0)) +
        HOOKED_tex(HOOKED_pos + dir * (1.0/6.0)));
    vec4 rgbB = rgbA * 0.5 + 0.25 * (
        HOOKED_tex(HOOKED_pos + dir * -0.5) +
        HOOKED_tex(HOOKED_pos + dir * 0.5));

    //vec4 luma = vec4(0.299, 0.587, 0.114, 0.0);
    //float lumb = dot(rgbB, luma);
    float lumb = getLum(rgbB);

    if ((lumb < minl) || (lumb > maxl)) {
        xc = rgbA;
    } else {
        xc = rgbB;
	}
    gl_FragColor = getAverage(cc, xc);
}
`;

const drawFrag = `
precision mediump float;

uniform sampler2D u_texture;
varying vec2 v_tex_pos;

void main() {
    vec4 color = texture2D(u_texture, vec2(v_tex_pos.x, 1.0 - v_tex_pos.y));
    gl_FragColor = color;
}
`;


function Scaler(gl) {
    this.gl = gl;

    this.inputTex = null;
    this.inputMov = null;
    this.inputWidth = 0;
    this.inputHeight = 0;

    this.loggedPaused = false;

    this.quadBuffer = createBuffer(gl, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]));
    this.framebuffer = gl.createFramebuffer();

    console.log('Compiling shaders...')
    this.scaleProgram = createProgram(gl, quadVert, scaleFrag);
    this.thinLinesProgram = createProgram(gl, quadVert, thinLinesFrag);
    this.lumaProgram = createProgram(gl, quadVert, lumaFrag);
    this.lumaGausXProgram = createProgram(gl, quadVert, lumaGausXFrag);
    this.lumaGausYProgram = createProgram(gl, quadVert, lumaGausYFrag);
    this.lineDetectProgram = createProgram(gl, quadVert, lineDetectFrag);
    this.lineGausXProgram = createProgram(gl, quadVert, lineGausXFrag);
    this.lineGausYProgram = createProgram(gl, quadVert, lineGausYFrag);
    this.gradProgram = createProgram(gl, quadVert, gradFrag);
    this.refineProgram = createProgram(gl, quadVert, refineFrag);
    this.fxaaProgram = createProgram(gl, quadVert, fxaaFrag);
    this.drawProgram = createProgram(gl, quadVert, drawFrag);

    this.postKernelTexture = null;
    this.postKernelTexture2 = null;

    this.scale = 1.0;
}

Scaler.prototype.inputImage = function (img) {
    const gl = this.gl;

    this.inputWidth = img.width;
    this.inputHeight = img.height;

    this.inputTex = createTexture(gl, gl.LINEAR, img);
    this.inputMov = null;
}

Scaler.prototype.inputVideo = function (mov) {
    const gl = this.gl;

    const width = mov.videoWidth;
    const height = mov.videoHeight;

    this.inputWidth = width;
    this.inputHeight = height;

    let emptyPixels = new Uint8Array(width * height * 4);
    this.inputTex = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    this.inputMov = mov;
}

Scaler.prototype.resize = function (scale) {
    const gl = this.gl;

    const width = Math.round(this.inputWidth * scale);
    const height = Math.round(this.inputHeight * scale);

    gl.canvas.width = width;
    gl.canvas.height = height;

    let emptyPixels = new Uint8Array(width * height * 4);
    this.scaleTexture = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    this.scaleTexture2 = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    this.postKernelTexture = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    this.postKernelTexture2 = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
}

Scaler.prototype.render = function () {
    if (!this.inputTex) {
        return;
    }

    const gl = this.gl;
    const scalePgm = this.scaleProgram;
    const thinLinesPgm = this.thinLinesProgram;
    const lumaPgm = this.lumaProgram;
    const lumaGausXPgm = this.lumaGausXProgram;
    const lumaGausYPgm = this.lumaGausYProgram;
    const lineDetectPgm = this.lineDetectProgram;
    const lineGausXPgm = this.lineGausXProgram;
    const lineGausYPgm = this.lineGausYProgram;
    const gradPgm = this.gradProgram;
    const refinePgm = this.refineProgram;
    const fxaaPgm = this.fxaaProgram;
    const drawPgm = this.drawProgram;
    const defaultRatio = 16/9

    // Nasty trick to fix video quailty changing bug.
    if (gl.getError() == gl.INVALID_VALUE) {
        console.log('glError detected! Fetching new viedo tag... (This may happen due to resolution change)')
        let newMov = getNewVideoTag()
        console.log("Video width: " + newMov.videoWidth)
        console.log("Video height: " + newMov.videoHeight)
        let newRatio = newMov.videoWidth/newMov.videoHeight
        console.log("Video Ratio: " + newRatio)
        if ((newRatio/defaultRatio - 1) < 0.001) {  // To prevent float precision caused problem.
            let w = newRatio/defaultRatio*100
            console.log("Setting new width ratio: " + w + "%")
            globalBoard.style.width = w + "%"
        }
        this.inputVideo(newMov)
    }

    // Check if video is paused.
    if (this.inputMov.paused){
        // If paused we stop rendering new frames.
        if(!this.loggedPaused){
            console.log("Video paused.")
            this.loggedPaused = true
        }
        return
    } else {
        // Else we continue rendering new frames.
        if(this.loggedPaused){
            console.log("Video continued.")
            this.loggedPaused = false
        }
    }

    if (this.inputMov) {
        updateTexture(gl, this.inputTex, this.inputMov);
    }

    // Automatic change scale according to original video resolution.
    // Upscaled to 1440p.
    let newScale = 1440 / this.inputMov.videoHeight;
    if (this.scale != newScale){
        this.scale = newScale;
        console.log('Setting scale to ' + this.scale);
    }

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.STENCIL_TEST);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


    // First upscaling with Bicubic interpolation.
    // Upscaling
    bindFramebuffer(gl, this.framebuffer, this.scaleTexture);

    gl.useProgram(scalePgm.program);

    bindAttribute(gl, this.quadBuffer, scalePgm.a_pos, 2);
    bindTexture(gl, this.inputTex, 0);
    gl.uniform1i(scalePgm.u_texture, 0);
    gl.uniform2f(scalePgm.u_size, this.inputWidth, this.inputHeight);

    gl.drawArrays(gl.TRIANGLES, 0, 6);


    // Scaled: scaleTexture

    // Thin Lines
    bindFramebuffer(gl, this.framebuffer, this.scaleTexture2);

    gl.useProgram(thinLinesPgm.program);

    bindAttribute(gl, this.quadBuffer, thinLinesPgm.a_pos, 2);
    bindTexture(gl, this.scaleTexture, 0);
    gl.uniform1i(thinLinesPgm.scaled_texture, 0);
    gl.uniform1f(thinLinesPgm.u_scale, this.scale);
    gl.uniform2f(thinLinesPgm.u_pt, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Scaled: scaleTexture2

    // Compute Luminance
    bindFramebuffer(gl, this.framebuffer, this.postKernelTexture);

    gl.useProgram(lumaPgm.program);

    bindAttribute(gl, this.quadBuffer, lumaPgm.a_pos, 2);
    bindTexture(gl, this.scaleTexture2, 0);
    gl.uniform1i(lumaPgm.scaled_texture, 0);
    gl.uniform2f(lumaPgm.u_pt, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Scaled: scaleTexture2 (unchanged)
    // PostKernel: postKernelTexture (luminance)

    // Compute Luminance Gaussian X
    bindFramebuffer(gl, this.framebuffer, this.postKernelTexture2);

    gl.useProgram(lumaGausXPgm.program);

    bindAttribute(gl, this.quadBuffer, lumaGausXPgm.a_pos, 2);
    bindTexture(gl, this.scaleTexture2, 0);
    bindTexture(gl, this.postKernelTexture, 1);
    gl.uniform1i(lumaGausXPgm.scaled_texture, 0);
    gl.uniform1i(lumaGausXPgm.post_kernel_texture, 1);
    gl.uniform2f(lumaGausXPgm.u_pt, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // PostKernel: postKernelTexture2

    // Compute Luminance Gaussian Y
    bindFramebuffer(gl, this.framebuffer, this.postKernelTexture);

    gl.useProgram(lumaGausYPgm.program);

    bindAttribute(gl, this.quadBuffer, lumaGausYPgm.a_pos, 2);
    bindTexture(gl, this.scaleTexture2, 0);
    bindTexture(gl, this.postKernelTexture2, 1);
    gl.uniform1i(lumaGausYPgm.scaled_texture, 0);
    gl.uniform1i(lumaGausYPgm.post_kernel_texture, 1);
    gl.uniform2f(lumaGausYPgm.u_pt, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // PostKernel: postKernelTexture

    // Line detect
    bindFramebuffer(gl, this.framebuffer, this.postKernelTexture2);

    gl.useProgram(lineDetectPgm.program);

    bindAttribute(gl, this.quadBuffer, lumaGausYPgm.a_pos, 2);
    bindTexture(gl, this.scaleTexture2, 0);
    bindTexture(gl, this.postKernelTexture, 1);
    gl.uniform1i(lineDetectPgm.scaled_texture, 0);
    gl.uniform1i(lineDetectPgm.post_kernel_texture, 1);
    gl.uniform2f(lineDetectPgm.u_pt, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // PostKernel: postKernelTexture2

    // Compute Line Gaussian X
    bindFramebuffer(gl, this.framebuffer, this.postKernelTexture);

    gl.useProgram(lineGausXPgm.program);

    bindAttribute(gl, this.quadBuffer, lineGausXPgm.a_pos, 2);
    bindTexture(gl, this.scaleTexture2, 0);
    bindTexture(gl, this.postKernelTexture2, 1);
    gl.uniform1i(lineGausXPgm.scaled_texture, 0);
    gl.uniform1i(lineGausXPgm.post_kernel_texture, 1);
    gl.uniform2f(lineGausXPgm.u_pt, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // PostKernel: postKernelTexture

    // Compute Line Gaussian Y
    bindFramebuffer(gl, this.framebuffer, this.postKernelTexture2);

    gl.useProgram(lineGausYPgm.program);

    bindAttribute(gl, this.quadBuffer, lineGausYPgm.a_pos, 2);
    bindTexture(gl, this.scaleTexture2, 0);
    bindTexture(gl, this.postKernelTexture, 1);
    gl.uniform1i(lineGausYPgm.scaled_texture, 0);
    gl.uniform1i(lineGausYPgm.post_kernel_texture, 1);
    gl.uniform2f(lineGausYPgm.u_pt, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // PostKernel: postKernelTexture2

    // Compute Gradient
    bindFramebuffer(gl, this.framebuffer, this.postKernelTexture);

    gl.useProgram(gradPgm.program);

    bindAttribute(gl, this.quadBuffer, gradPgm.a_pos, 2);
    bindTexture(gl, this.scaleTexture2, 0);
    bindTexture(gl, this.postKernelTexture2, 1);
    gl.uniform1i(gradPgm.scaleFrag, 0);
    gl.uniform1i(gradPgm.post_kernel_texture, 1);
    gl.uniform2f(gradPgm.u_pt, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // PostKernel: postKernelTexture

    // Refine
    bindFramebuffer(gl, this.framebuffer, this.scaleTexture);

    gl.useProgram(refinePgm.program);

    bindAttribute(gl, this.quadBuffer, refinePgm.a_pos, 2);
    bindTexture(gl, this.scaleTexture2, 0);
    bindTexture(gl, this.postKernelTexture, 1);
    gl.uniform1i(refinePgm.u_texture, 0);
    gl.uniform1i(refinePgm.u_textureTemp, 1);
    gl.uniform1f(refinePgm.u_scale, this.scale);
    gl.uniform2f(refinePgm.u_pt, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // PostKernel: scaleTexture

    // FXAA
    bindFramebuffer(gl, this.framebuffer, this.scaleTexture2);

    gl.useProgram(fxaaPgm.program);

    bindAttribute(gl, this.quadBuffer, fxaaPgm.a_pos, 2);
    bindTexture(gl, this.scaleTexture, 0);
    bindTexture(gl, this.postKernelTexture, 1);
    gl.uniform1i(fxaaPgm.u_texture, 0);
    gl.uniform1i(fxaaPgm.u_textureTemp, 1);
    gl.uniform1f(fxaaPgm.u_scale, this.scale);
    gl.uniform2f(fxaaPgm.u_pt, 1.0 / gl.canvas.width, 1.0 / gl.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // PostKernel: scaleTexture2

    // Draw
    bindFramebuffer(gl, null);

    gl.useProgram(drawPgm.program);

    bindAttribute(gl, this.quadBuffer, drawPgm.a_pos, 2);
    bindTexture(gl, this.scaleTexture2, 0);
    gl.uniform1i(drawPgm.u_texture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// Parameters.
let globalScaler = null;
let globalMovOrig = null;
let globalBoard = null;
let globalScale = 2.0;

async function injectCanvas() {
    console.log('Injecting canvas...')

    // Create a canvas (since video tag do not support WebGL).
    globalMovOrig = await getVideoTag()
    console.log(globalMovOrig)

    let div = globalMovOrig.parentElement

    globalBoard = document.createElement('canvas');
    // Make it visually fill the positioned parent
    globalBoard.style.width = '100%';
    globalBoard.style.height = '100%';
    // ...then set the internal size to match
    globalBoard.width = globalBoard.offsetWidth;
    globalBoard.height = globalBoard.offsetHeight;
    // Add it back to the div where contains the video tag we use as input.
    div.appendChild(globalBoard)

    // Hide original video tag, we don't need it to be displayed.
    globalMovOrig.style.display = 'none'
}

async function getVideoTag() {
    while(document.getElementsByTagName("video").length <= 0) {
        await new Promise(r => setTimeout(r, 500));
    }

    return document.getElementsByTagName("video")[0]
}

function getNewVideoTag() {
    // Get video tag.
    globalMovOrig = document.getElementsByTagName("video")[0]

    // Hide it, we don't need it to be displayed.
    globalMovOrig.style.display = 'none'

    globalScaler.scale = globalScale;

    return globalMovOrig
}

function doFilter() {
    // Setting our parameters for filtering.
    // scale: multipliers that we need to zoom in.
    // Here's the fun part. We create a pixel shader for our canvas
    console.log('Enabling filter...')

    const gl = globalBoard.getContext('webgl');

    globalMovOrig.addEventListener('loadedmetadata', function () {
        globalScaler = new Scaler(gl);
        globalScaler.inputVideo(globalMovOrig);
        globalScaler.resize(globalScale);
        globalScaler.scale = globalScale;
    }, true);
    globalMovOrig.addEventListener('error', function () {
        alert("Can't get video, sorry.");
    }, true);

    // Do it! Filter it! Profit!
    function render() {
        if (globalScaler) {
            globalScaler.render();
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

(async function () {
    console.log('Bilibili_Anime4K starting...')
    await injectCanvas()
    doFilter()
})();