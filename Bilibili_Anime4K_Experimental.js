// ==UserScript==
// @name                Bilibili_Anime4K_Experimental
// @name:zh-CN          Bilibili Anime4K滤镜(实验性)
// @description         Bring Anime4K to Bilibili and ACFun's HTML5 player to clearify 2D anime.
// @description:zh-CN   通过Anime4K滤镜让Bilibili和ACFun上的2D番剧更加清晰
// @namespace           http://net2cn.tk/
// @homepageURL         https://github.com/net2cn/Bilibili_Anime4K/
// @supportURL          https://github.com/net2cn/Bilibili_Anime4K/issues
// @version             0.5.3
// @author              net2cn
// @copyright           bloc97, DextroseRe, NeuroWhAI, and all contributors of Anime4K
// @match               *://www.bilibili.com/video/av*
// @match               *://www.bilibili.com/bangumi/play/ep*
// @match               *://www.bilibili.com/bangumi/play/ss*
// @match               *://www.bilibili.com/video/BV*
// @match               *://www.acfun.cn/bangumi/aa*
// @grant               none
// @license             MIT License
// @run-at              document-idle
// ==/UserScript==

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

const frag0 = `
precision mediump float;

uniform sampler2D HOOKED;
uniform vec2 HOOKED_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(HOOKED, pos);
}

void main() {
    vec2 dp = HOOKED_pt;
    vec2 HOOKED_pos = v_tex_pos;
	float a = HOOKED_tex(HOOKED_pos + vec2(-dp.x, -dp.y)).x;
	float b = HOOKED_tex(HOOKED_pos + vec2(-dp.x, 0)).x;
	float c = HOOKED_tex(HOOKED_pos + vec2(-dp.x, dp.y)).x;
	float d = HOOKED_tex(HOOKED_pos + vec2(0, -dp.y)).x;
	float e = HOOKED_tex(HOOKED_pos + vec2(0, 0)).x;
	float f = HOOKED_tex(HOOKED_pos + vec2(0, dp.y)).x;
	float g = HOOKED_tex(HOOKED_pos + vec2(dp.x, -dp.y)).x;
	float h = HOOKED_tex(HOOKED_pos + vec2(dp.x, 0)).x;
	float i = HOOKED_tex(HOOKED_pos + vec2(dp.x, dp.y)).x;

	float s = -0.09440448*a + 0.49120164*b + -0.022703001*c + -0.016553257*d + 0.6272513*e + -0.97632706*f + 0.10815585*g + -0.21898738*h + 0.09604159*i;
	float o = s+0.00028890301;
	s = 0.061990097*a + -0.87003845*b + -0.037461795*c + 0.13172528*d + 0.87585527*e + -0.13609451*f + -0.070119604*g + -0.051131595*h + 0.09209152*i;
	float p = s+-0.017290013;
	s = 0.45264956*a + -1.1240269*b + 0.07975403*c + 0.6734861*d + -0.05388544*e + 0.007570164*f + -0.06987841*g + 0.012247365*h + 0.034949988*i;
	float q = s+-0.0145500265;
	s = -0.035659406*a + 0.043313805*b + -0.056556296*c + 0.08745333*d + 0.6312519*e + -0.24501355*f + -0.13407958*g + -0.18634492*h + -0.08149098*i;
	float r = s+-0.009025143;

	gl_FragColor = vec4(o, p, q, r);
}
`;

const frag1 = `
precision mediump float;

uniform sampler2D HOOKED;
uniform sampler2D LUMAN0;
uniform sampler2D NATIVE;
uniform vec2 HOOKED_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(HOOKED, pos);
}
vec4 LUMAN0_tex(vec2 pos) {
    return texture2D(LUMAN0, pos);
}
vec4 NATIVE_tex(vec2 pos) {
    return texture2D(NATIVE, pos);
}

void main() {
    vec2 dp = HOOKED_pt;
    vec2 HOOKED_pos = v_tex_pos;
	vec4 a = LUMAN0_tex(HOOKED_pos + vec2(-dp.x, -dp.y));
	vec4 b = LUMAN0_tex(HOOKED_pos + vec2(-dp.x, 0));
	vec4 c = LUMAN0_tex(HOOKED_pos + vec2(-dp.x, dp.y));
	vec4 d = LUMAN0_tex(HOOKED_pos + vec2(0, -dp.y));
	vec4 e = LUMAN0_tex(HOOKED_pos + vec2(0, 0));
	vec4 f = LUMAN0_tex(HOOKED_pos + vec2(0, dp.y));
	vec4 g = LUMAN0_tex(HOOKED_pos + vec2(dp.x, -dp.y));
	vec4 h = LUMAN0_tex(HOOKED_pos + vec2(dp.x, 0));
	vec4 i = LUMAN0_tex(HOOKED_pos + vec2(dp.x, dp.y));
	
	vec4 na = -min(a, vec4(0));
	vec4 nb = -min(b, vec4(0));
	vec4 nc = -min(c, vec4(0));
	vec4 nd = -min(d, vec4(0));
	vec4 ne = -min(e, vec4(0));
	vec4 nf = -min(f, vec4(0));
	vec4 ng = -min(g, vec4(0));
	vec4 nh = -min(h, vec4(0));
	vec4 ni = -min(i, vec4(0));
	
	a = max(a, vec4(0));
	b = max(b, vec4(0));
	c = max(c, vec4(0));
	d = max(d, vec4(0));
	e = max(e, vec4(0));
	f = max(f, vec4(0));
	g = max(g, vec4(0));
	h = max(h, vec4(0));
	i = max(i, vec4(0));
	
	float s = -0.05327107*a.x + -0.07160779*b.x + -0.053545203*c.x + 0.30653647*d.x + -0.623205*e.x + -0.25135925*f.x + -0.18046309*g.x + 0.5326353*h.x + -0.09099461*i.x;
	float t = -0.16687301*a.y + 0.29383695*b.y + -0.15116534*c.y + 0.013435781*d.y + -0.3595954*e.y + 0.3222953*f.y + 0.20127103*g.y + 1.1504021*h.y + 0.6521217*i.y;
	float u = -0.0015649797*a.z + -0.18814865*b.z + 0.061695296*c.z + 0.013806492*d.z + 0.12745698*e.z + -0.30406427*f.z + -0.05947408*g.z + 0.33141926*h.z + -0.20066342*i.z;
	float v = 0.30095318*a.w + 0.36586058*b.w + 0.22645043*c.w + 0.1612967*d.w + -0.37834042*e.w + -0.08229078*f.w + -0.64827895*g.w + 0.04798959*h.w + 0.50426966*i.w;
	float w = 0.126555*na.x + 0.079004966*nb.x + -0.06367056*nc.x + -0.16546968*nd.x + 0.50795466*ne.x + 0.18011826*nf.x + 0.16996312*ng.x + -0.51605004*nh.x + 0.10505295*ni.x;
	float x = 0.1540833*na.y + -0.26913214*nb.y + 0.13605806*nc.y + -0.12155722*nd.y + 0.21405062*ne.y + -0.27972937*nf.y + -0.41382065*ng.y + -1.7224138*nh.y + -0.60294384*ni.y;
	float y = 0.00970452*na.z + 0.20325865*nb.z + 0.0015745827*nc.z + -0.107312985*nd.z + 0.009980262*ne.z + 0.2720558*nf.z + 0.15321876*ng.z + -0.036781967*nh.z + 0.051229585*ni.z;
	float z = -0.27454868*na.w + -0.4432009*nb.w + -0.003881375*nc.w + 0.18336153*nd.w + 0.19950926*ne.w + 0.045014136*nf.w + 0.6243142*ng.w + -0.16252244*nh.w + -0.42274413*ni.w;
	float o = s+t+u+v+w+x+y+z+0.039423503;
	s = -0.10775202*a.x + -0.031339962*b.x + 0.0060642078*c.x + -0.10545187*d.x + 0.12458454*e.x + 0.0021231163*f.x + 0.07905482*g.x + 0.08223747*h.x + 0.04828753*i.x;
	t = 0.13271476*a.y + -0.40485632*b.y + 0.054641176*c.y + -0.4327063*d.y + -0.19545476*e.y + 0.09262824*f.y + -0.36247733*g.y + 0.12627794*h.y + -0.075792745*i.y;
	u = -0.09226349*a.z + 0.24326*b.z + -0.021355193*c.z + 0.1444612*d.z + -0.102547936*e.z + 0.05568293*f.z + 0.013875915*g.z + 0.19688046*h.z + 0.0154764345*i.z;
	v = -0.1431215*a.w + -0.26233566*b.w + -0.020626735*c.w + 0.019540034*d.w + 0.18164286*e.w + -0.16356231*f.w + 0.17014627*g.w + -0.27788106*h.w + 0.0718594*i.w;
	w = 0.20348297*na.x + 0.10994786*nb.x + 0.014990544*nc.x + 1.033602*nd.x + 0.024537617*ne.x + 0.009609228*nf.x + 0.12779616*ng.x + 0.06813842*nh.x + -0.04269685*ni.x;
	x = -0.2430749*na.y + 0.37466663*nb.y + -0.06150604*nc.y + 0.28204092*nd.y + 0.22226551*ne.y + -0.19715464*nf.y + 0.003657579*ng.y + -0.30363604*nh.y + 0.0542432*ni.y;
	y = 0.1447509*na.z + -0.28650913*nb.z + -0.058723953*nc.z + -0.092879236*nd.z + 0.26428574*ne.z + -0.104749136*nf.z + -0.070094705*ng.z + 0.047571726*nh.z + -0.010061374*ni.z;
	z = 0.0438258*na.w + 0.34031448*nb.w + -0.013600149*nc.w + 0.28250962*nd.w + -0.73591596*ne.w + 0.21241076*nf.w + -0.27542746*ng.w + 0.14023423*nh.w + -0.10678145*ni.w;
	float p = s+t+u+v+w+x+y+z+-0.021502364;
	s = 0.032163877*a.x + -0.66642886*b.x + 0.044751197*c.x + 0.05605561*d.x + 0.6945027*e.x + -0.07645503*f.x + -0.04662916*g.x + -0.2509118*h.x + 0.098923184*i.x;
	t = 0.03268785*a.y + 0.2343848*b.y + -0.058907576*c.y + -0.6397386*d.y + -0.15121439*e.y + 0.15354797*f.y + -0.3191564*g.y + -0.24138322*h.y + -0.71516746*i.y;
	u = -0.069602974*a.z + -0.4111596*b.z + 0.021718252*c.z + 0.2399502*d.z + 0.64263207*e.z + 0.3311527*f.z + -0.2513218*g.z + -0.48004037*h.z + 0.78069997*i.z;
	v = -0.6631432*a.w + 0.15360248*b.w + 0.012449814*c.w + -0.9210798*d.w + 0.77063346*e.w + 0.10402895*f.w + 0.26728597*g.w + -0.3063174*h.w + 0.07107563*i.w;
	w = -0.22910015*na.x + 0.60668314*nb.x + -0.07472177*nc.x + -0.2976557*nd.x + -0.31179214*ne.x + 0.17979208*nf.x + -0.059973676*ng.x + 0.48262063*nh.x + 0.10012325*ni.x;
	x = -0.008694405*na.y + -0.19812866*nb.y + 0.024916848*nc.y + 0.57730144*nd.y + 0.20505147*ne.y + -0.22297408*nf.y + 0.09352177*ng.y + -0.548608*nh.y + 0.56032515*ni.y;
	y = 0.05522713*na.z + 0.3843459*nb.z + -0.017952677*nc.z + -0.24958606*nd.z + -0.641729*ne.z + -0.13842992*nf.z + 0.20486256*ng.z + 0.24058507*nh.z + -0.53553283*ni.z;
	z = 0.7243502*na.w + -0.16880396*nb.w + 0.11347028*nc.w + 0.98730826*nd.w + -0.4131502*ne.w + -0.605653*nf.w + -0.20231946*ng.w + 0.268739*nh.w + -0.25494024*ni.w;
	float q = s+t+u+v+w+x+y+z+-0.011375127;
	s = 0.004939782*a.x + 0.04961287*b.x + -0.022315059*c.x + -0.36721465*d.x + 0.02673542*e.x + -0.055127766*f.x + -0.3139398*g.x + 0.011177372*h.x + -0.002486109*i.x;
	t = 0.0029139163*a.y + -0.018279694*b.y + 0.23850645*c.y + -0.053427566*d.y + -0.19388364*e.y + 0.25149515*f.y + -0.15969065*g.y + 0.003607878*h.y + 0.47864768*i.y;
	u = 0.018587857*a.z + 0.04256821*b.z + -0.084889054*c.z + -0.10649675*d.z + 0.1413508*e.z + -0.014863062*f.z + 0.046072394*g.z + 0.044705987*h.z + -0.3495728*i.z;
	v = -0.25952607*a.w + -0.37138674*b.w + -0.31769684*c.w + -0.47086135*d.w + 0.4518305*e.w + 0.23906761*f.w + 0.37785494*g.w + -0.12342203*h.w + -0.18958518*i.w;
	w = -0.0987012*na.x + -0.23680592*nb.x + -0.038128883*nc.x + 0.021003952*nd.x + -0.21279961*ne.x + 0.02450331*nf.x + 0.22508678*ng.x + -0.050619982*nh.x + -0.12929344*ni.x;
	x = 0.024458453*na.y + 0.07273773*nb.y + -0.26048952*nc.y + 0.18460196*nd.y + 0.4304707*ne.y + -0.17272879*nf.y + 0.28351468*ng.y + 1.3116083*nh.y + -0.29540524*ni.y;
	y = -0.041094407*na.z + 0.024719454*nb.z + 0.19896787*nc.z + 0.07664201*nd.z + -0.25621203*ne.z + 0.10749328*nf.z + -0.067182586*ng.z + 0.06065049*nh.z + 0.47074008*ni.z;
	z = 0.13518347*na.w + 0.20488833*nb.w + 0.24956091*nc.w + 0.07386013*nd.w + -0.9938687*ne.w + -0.15375653*nf.w + -0.55804706*ng.w + -0.0036114866*nh.w + 0.3378182*ni.w;
	float r = s+t+u+v+w+x+y+z+-0.047199935;

	gl_FragColor = vec4(o, p, q, r);
}
`;

const frag2 = `
precision mediump float;

uniform sampler2D HOOKED;
uniform sampler2D LUMAN1;
uniform sampler2D NATIVE;
uniform vec2 HOOKED_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(HOOKED, pos);
}
vec4 LUMAN1_tex(vec2 pos) {
    return texture2D(LUMAN1, pos);
}
vec4 NATIVE_tex(vec2 pos) {
    return texture2D(NATIVE, pos);
}

void main() {
    vec2 dp = HOOKED_pt;
    vec2 HOOKED_pos = v_tex_pos;
	vec4 a = LUMAN1_tex(HOOKED_pos + vec2(-dp.x, -dp.y));
	vec4 b = LUMAN1_tex(HOOKED_pos + vec2(-dp.x, 0));
	vec4 c = LUMAN1_tex(HOOKED_pos + vec2(-dp.x, dp.y));
	vec4 d = LUMAN1_tex(HOOKED_pos + vec2(0, -dp.y));
	vec4 e = LUMAN1_tex(HOOKED_pos + vec2(0, 0));
	vec4 f = LUMAN1_tex(HOOKED_pos + vec2(0, dp.y));
	vec4 g = LUMAN1_tex(HOOKED_pos + vec2(dp.x, -dp.y));
	vec4 h = LUMAN1_tex(HOOKED_pos + vec2(dp.x, 0));
	vec4 i = LUMAN1_tex(HOOKED_pos + vec2(dp.x, dp.y));
	
	vec4 na = -min(a, vec4(0));
	vec4 nb = -min(b, vec4(0));
	vec4 nc = -min(c, vec4(0));
	vec4 nd = -min(d, vec4(0));
	vec4 ne = -min(e, vec4(0));
	vec4 nf = -min(f, vec4(0));
	vec4 ng = -min(g, vec4(0));
	vec4 nh = -min(h, vec4(0));
	vec4 ni = -min(i, vec4(0));
	
	a = max(a, vec4(0));
	b = max(b, vec4(0));
	c = max(c, vec4(0));
	d = max(d, vec4(0));
	e = max(e, vec4(0));
	f = max(f, vec4(0));
	g = max(g, vec4(0));
	h = max(h, vec4(0));
	i = max(i, vec4(0));

	float s = 0.062563986*a.x + 0.7022818*b.x + -0.011810557*c.x + 0.25277942*d.x + -0.2097257*e.x + 0.17233184*f.x + -0.28609228*g.x + -0.32957354*h.x + -0.11091415*i.x;
	float t = 0.0074290223*a.y + 0.25707433*b.y + 0.02356039*c.y + -0.0033311683*d.y + 0.78796846*e.y + -0.8613285*f.y + 0.020431397*g.y + -0.014993784*h.y + -0.5224642*i.y;
	float u = -0.099318005*a.z + 0.096692294*b.z + -0.081225544*c.z + 0.4837614*d.z + 0.40215006*e.z + 0.06631713*f.z + -0.28298393*g.z + -0.15690443*h.z + -0.11722153*i.z;
	float v = -0.20104708*a.w + 0.29773432*b.w + -0.059524678*c.w + 0.672484*d.w + 0.58850944*e.w + 0.19088581*f.w + 0.085560724*g.w + -0.3429526*h.w + -0.01970963*i.w;
	float w = 0.2530852*na.x + -0.26206517*nb.x + -0.0087517025*nc.x + -0.33815455*nd.x + -0.00843703*ne.x + -0.22927909*nf.x + -0.062886484*ng.x + 0.17524554*nh.x + -0.008373106*ni.x;
	float x = 0.17741594*na.y + -0.52788115*nb.y + -0.10984838*nc.y + -0.13678722*nd.y + -0.28618953*ne.y + 0.1595905*nf.y + -0.04411071*ng.y + -0.3234863*nh.y + 0.4967709*ni.y;
	float y = 0.042347442*na.z + 0.08541207*nb.z + -0.15857157*nc.z + -0.30902776*nd.z + -0.8957161*ne.z + -0.29276812*nf.z + 0.47053015*ng.z + 0.6092259*nh.z + 0.31623343*ni.z;
	float z = 0.17963913*na.w + -0.30821583*nb.w + 0.15316938*nc.w + -0.37125722*nd.w + -0.5975526*ne.w + -0.07182377*nf.w + 0.069451295*ng.w + 0.61750644*nh.w + 0.07411387*ni.w;
	float o = s+t+u+v+w+x+y+z+0.025282431;
	s = 0.15042752*a.x + 0.76578605*b.x + 0.15916896*c.x + 0.062038895*d.x + 0.90041196*e.x + 0.44829968*f.x + -0.1525204*g.x + -0.0769386*h.x + -0.017208606*i.x;
	t = -0.24956173*a.y + -0.4890138*b.y + -0.5667875*c.y + -0.04361386*d.y + -1.2683009*e.y + 0.49874577*f.y + -0.023511255*g.y + -0.44963378*h.y + -0.44784302*i.y;
	u = -0.4755887*a.z + 0.5499969*b.z + -0.40806842*c.z + 0.18438272*d.z + -0.24848352*e.z + -0.6397795*f.z + -0.26359263*g.z + 0.48188695*h.z + 0.4296102*i.z;
	v = -0.42948166*a.w + 0.47963342*b.w + 0.2660744*c.w + 0.009006623*d.w + -0.20249301*e.w + 0.3191499*f.w + -0.009933394*g.w + 0.022085298*h.w + -0.05937115*i.w;
	w = 0.39071006*na.x + 0.96707124*nb.x + 0.5870382*nc.x + -0.0009634084*nd.x + -0.60501117*ne.x + -0.26205206*nf.x + 0.0022803913*ng.x + 0.19914602*nh.x + -0.0075327456*ni.x;
	x = 0.6501524*na.y + -0.6191325*nb.y + 0.033584982*nc.y + -0.23792362*nd.y + 0.28443542*ne.y + 0.7995467*nf.y + 0.61443925*ng.y + -0.2151685*nh.y + -0.64213204*ni.y;
	y = -0.028933166*na.z + -0.8038524*nb.z + -0.89384586*nc.z + -0.5202012*nd.z + 0.2658711*ne.z + -0.9662124*nf.z + 0.16669375*ng.z + 0.00071032986*nh.z + -0.15632267*ni.z;
	z = 0.04982121*na.w + 0.3209018*nb.w + -0.18828197*nc.w + 0.09291354*nd.w + -0.17046586*ne.w + -0.34567246*nf.w + -0.30839518*ng.w + 0.10585062*nh.w + 0.21802926*ni.w;
	float p = s+t+u+v+w+x+y+z+-0.038783036;
	s = -0.0086537115*a.x + 0.29274273*b.x + -0.14299169*c.x + 0.24355909*d.x + 0.44158313*e.x + 0.3856316*f.x + 0.1826302*g.x + 0.0468175*h.x + 0.08368182*i.x;
	t = -0.0030031276*a.y + -0.25766936*b.y + -0.16684678*c.y + -0.07155021*d.y + 0.49751604*e.y + 0.51993954*f.y + -0.055723842*g.y + -0.20152062*h.y + -0.3310546*i.y;
	u = -0.19360077*a.z + 0.29092705*b.z + -0.14313088*c.z + -0.12219053*d.z + 0.3336699*e.z + 0.19800198*f.z + 0.12873465*g.z + 0.16162138*h.z + 0.05346552*i.z;
	v = -0.12214463*a.w + -0.32187235*b.w + -0.4942458*c.w + 0.047901243*d.w + 0.1315279*e.w + 0.25730842*f.w + -0.03230636*g.w + -0.35371637*h.w + -0.16514161*i.w;
	w = 0.06874291*na.x + -0.19512849*nb.x + 0.4657543*nc.x + -0.031914163*nd.x + 0.37405568*ne.x + 0.15239602*nf.x + -0.023567*ng.x + 0.31183028*nh.x + 0.0394527*ni.x;
	x = -0.07513823*na.y + 0.041872643*nb.y + 0.35610527*nc.y + -0.1445567*nd.y + -1.024163*ne.y + -0.6282327*nf.y + 0.06843732*ng.y + 0.009273292*nh.y + -0.23500894*ni.y;
	y = 0.10864135*na.z + -0.25950822*nb.z + -0.27286842*nc.z + -0.0922535*nd.z + -0.49195388*ne.z + -0.9883521*nf.z + -0.16378482*ng.z + -0.44275576*nh.z + -0.19259977*ni.z;
	z = -0.07329517*na.w + 0.73912215*nb.w + -0.27922824*nc.w + -0.19892885*nd.w + -0.029165866*ne.w + -0.64475375*nf.w + -0.1735304*ng.w + 0.030360926*nh.w + 0.023611842*ni.w;
	float q = s+t+u+v+w+x+y+z+0.0059805913;
	s = 0.0520063*a.x + 0.32099065*b.x + 0.10096528*c.x + -0.3286558*d.x + 0.21782263*e.x + -0.16726571*f.x + -0.0061505553*g.x + -0.006116407*h.x + 0.04923024*i.x;
	t = -0.0034328692*a.y + -0.093817174*b.y + -0.16234896*c.y + 0.070740886*d.y + 0.09283234*e.y + -0.5086407*f.y + 0.14033465*g.y + 0.2656622*h.y + -0.069810264*i.y;
	u = 0.0036944423*a.z + -0.12574191*b.z + -0.05118089*c.z + -0.57802665*d.z + 0.7782018*e.z + -0.50453955*f.z + 0.020464642*g.z + 0.036232006*h.z + 0.07828021*i.z;
	v = 0.14491023*a.w + -0.08246158*b.w + 0.0048284433*c.w + -0.41679582*d.w + -0.37185597*e.w + -0.5086088*f.w + -0.101141416*g.w + 0.021782609*h.w + 0.024443237*i.w;
	w = -0.09724159*na.x + -0.13913961*nb.x + 0.13188085*nc.x + 0.4496926*nd.x + -0.2343041*ne.x + 0.30554664*nf.x + 0.10852492*ng.x + 0.09672956*nh.x + 0.06470584*ni.x;
	x = -0.22092621*na.y + -0.17034335*nb.y + -0.46865875*nc.y + -0.16638382*nd.y + -0.36817726*ne.y + 2.8126082*nf.y + 0.20136675*ng.y + -0.028155493*nh.y + -0.6738389*ni.y;
	y = 0.08178478*na.z + -0.13104321*nb.z + -0.0031215427*nc.z + 0.25492746*nd.z + -0.6011733*ne.z + 1.2705562*nf.z + -0.053312294*ng.z + 0.04038377*nh.z + -0.21168794*ni.z;
	z = -0.26104185*na.w + 0.24431077*nb.w + 0.44925603*nc.w + 0.23646158*nd.w + 0.45555523*ne.w + 0.9546111*nf.w + -0.24485165*ng.w + -0.13658847*nh.w + 0.033205047*ni.w;
	float r = s+t+u+v+w+x+y+z+-0.039946888;
	
	gl_FragColor = vec4(o, p, q, r);
}
`;

const frag3 = `
precision mediump float;

uniform sampler2D HOOKED;
uniform sampler2D LUMAN2;
uniform sampler2D NATIVE;
uniform vec2 HOOKED_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(HOOKED, pos);
}
vec4 LUMAN2_tex(vec2 pos) {
    return texture2D(LUMAN2, pos);
}
vec4 NATIVE_tex(vec2 pos) {
    return texture2D(NATIVE, pos);
}

void main() {
    vec2 dp = HOOKED_pt;
    vec2 HOOKED_pos = v_tex_pos;
	vec4 a = LUMAN2_tex(HOOKED_pos + vec2(-dp.x, -dp.y));
	vec4 b = LUMAN2_tex(HOOKED_pos + vec2(-dp.x, 0));
	vec4 c = LUMAN2_tex(HOOKED_pos + vec2(-dp.x, dp.y));
	vec4 d = LUMAN2_tex(HOOKED_pos + vec2(0, -dp.y));
	vec4 e = LUMAN2_tex(HOOKED_pos + vec2(0, 0));
	vec4 f = LUMAN2_tex(HOOKED_pos + vec2(0, dp.y));
	vec4 g = LUMAN2_tex(HOOKED_pos + vec2(dp.x, -dp.y));
	vec4 h = LUMAN2_tex(HOOKED_pos + vec2(dp.x, 0));
	vec4 i = LUMAN2_tex(HOOKED_pos + vec2(dp.x, dp.y));
	
	vec4 na = -min(a, vec4(0));
	vec4 nb = -min(b, vec4(0));
	vec4 nc = -min(c, vec4(0));
	vec4 nd = -min(d, vec4(0));
	vec4 ne = -min(e, vec4(0));
	vec4 nf = -min(f, vec4(0));
	vec4 ng = -min(g, vec4(0));
	vec4 nh = -min(h, vec4(0));
	vec4 ni = -min(i, vec4(0));
	
	a = max(a, vec4(0));
	b = max(b, vec4(0));
	c = max(c, vec4(0));
	d = max(d, vec4(0));
	e = max(e, vec4(0));
	f = max(f, vec4(0));
	g = max(g, vec4(0));
	h = max(h, vec4(0));
	i = max(i, vec4(0));

	float s = -0.10675473*a.x + -0.0054621263*b.x + 0.04762056*c.x + -0.09147545*d.x + -0.37308994*e.x + 0.293996*f.x + -0.089725204*g.x + 0.33136362*h.x + -0.052014586*i.x;
	float t = 0.02504269*a.y + -0.06090801*b.y + -1.0442187e-05*c.y + 0.06697992*d.y + -0.029154606*e.y + -0.0022566947*f.y + -0.00791601*g.y + 0.09337469*h.y + -0.040103186*i.y;
	float u = 0.21693788*a.z + -0.055160753*b.z + -0.009791719*c.z + -0.333904*d.z + 0.27527252*e.z + -0.12840816*f.z + -0.18639135*g.z + -0.13602877*h.z + 0.06346381*i.z;
	float v = -0.03963725*a.w + -0.26795068*b.w + 0.012137692*c.w + -0.17869234*d.w + -0.06644175*e.w + 0.010630859*f.w + -0.07681673*g.w + -0.0041983854*h.w + -0.026523955*i.w;
	float w = 0.13531718*na.x + 0.12938923*nb.x + -0.050681178*nc.x + 0.062877566*nd.x + -0.08772176*ne.x + 0.006759793*nf.x + 0.15809533*ng.x + -0.08294619*nh.x + 0.06690071*ni.x;
	float x = 0.018558182*na.y + -0.16493246*nb.y + 0.02380415*nc.y + 0.08744932*nd.y + -0.021898141*ne.y + 0.026684938*nf.y + 0.032703754*ng.y + 0.052364938*nh.y + 0.056927126*ni.y;
	float y = -0.0901643*na.z + -0.09282382*nb.z + 0.07358982*nc.z + 0.3232882*nd.z + -1.0591649*ne.z + 0.17128727*nf.z + 0.22159135*ng.z + -0.3007047*nh.z + -0.05238468*ni.z;
	float z = -0.06714734*na.w + 0.04850284*nb.w + -0.011960667*nc.w + -0.18101339*nd.w + -0.34727672*ne.w + 0.030268785*nf.w + -0.09629506*ng.w + -0.28136835*nh.w + -0.13334738*ni.w;
	float o = s+t+u+v+w+x+y+z+0.006057905;
	s = 0.018881252*a.x + 0.06384664*b.x + -0.011764481*c.x + 0.15501355*d.x + -0.2185426*e.x + -0.07557788*f.x + 0.025938602*g.x + -0.14496502*h.x + 0.024891714*i.x;
	t = -0.01996556*a.y + -0.00053282635*b.y + 0.00061660836*c.y + 0.024429671*d.y + 0.054617107*e.y + -0.021867601*f.y + 0.032060657*g.y + 0.0031433336*h.y + -0.012301998*i.y;
	u = -0.070778325*a.z + -0.19530736*b.z + 0.011512594*c.z + -0.27479392*d.z + -0.013253852*e.z + -0.022542335*f.z + 0.05682861*g.z + 0.0012437729*h.z + -0.0150462305*i.z;
	v = 0.066125244*a.w + 0.020368045*b.w + -0.03502752*c.w + 0.1109599*d.w + -0.060857326*e.w + 0.06733562*f.w + 0.012108426*g.w + 0.0063430844*h.w + -0.004283166*i.w;
	w = -0.06497726*na.x + -0.17359954*nb.x + -0.011175394*nc.x + -0.18982106*nd.x + 0.5939919*ne.x + -0.021145599*nf.x + -0.064499505*ng.x + -0.014329371*nh.x + -0.015423945*ni.x;
	x = -0.03674411*na.y + -0.0043503637*nb.y + 0.010304639*nc.y + -0.0012494766*nd.y + -0.13278799*ne.y + 0.032555994*nf.y + -0.052385017*ng.y + 0.010176496*nh.y + -0.0026763906*ni.y;
	y = 0.06123568*na.z + 0.14374596*nb.z + 0.056109104*nc.z + 0.019599102*nd.z + 0.18616806*ne.z + -0.03179762*nf.z + 0.036342375*ng.z + 0.029431945*nh.z + 0.043751024*ni.z;
	z = 0.12073644*na.w + 0.0733359*nb.w + 0.08390864*nc.w + -0.11528834*nd.w + 0.3467376*ne.w + -0.033535313*nf.w + 0.041739017*ng.w + 0.058267288*nh.w + 0.08858209*ni.w;
	float p = s+t+u+v+w+x+y+z+-0.0028000006;
	s = -0.09027117*a.x + -0.14622006*b.x + -0.16810851*c.x + -0.24796103*d.x + 0.2572285*e.x + 0.47094887*f.x + 0.032027613*g.x + 0.11410892*h.x + 0.1613444*i.x;
	t = -0.0012083473*a.y + 0.17305928*b.y + -0.05621104*c.y + 0.036259834*d.y + -0.03851184*e.y + -0.0055326805*f.y + -0.012463582*g.y + 0.35876498*h.y + 0.1724837*i.y;
	u = 0.40897495*a.z + 0.17421961*b.z + 0.28644145*c.z + -0.25477505*d.z + -0.4277018*e.z + -0.18726684*f.z + 0.13615106*g.z + 0.026969131*h.z + -0.15176998*i.z;
	v = 0.04463327*a.w + -0.04876386*b.w + -0.031818386*c.w + 0.03954202*d.w + 0.09516337*e.w + 0.052471045*f.w + -0.13383369*g.w + -0.21776986*h.w + 0.015097585*i.w;
	w = 0.2092236*na.x + 0.48777798*nb.x + 0.2956695*nc.x + 0.23978968*nd.x + -0.59248745*ne.x + -0.13063201*nf.x + 0.061278455*ng.x + -0.10234516*nh.x + 0.002134229*ni.x;
	x = 0.07130507*na.y + 0.121942736*nb.y + -0.01583503*nc.y + 0.14037956*nd.y + -0.37520966*ne.y + -0.067429096*nf.y + 0.05821935*ng.y + -0.35461438*nh.y + -0.07123769*ni.y;
	y = -0.468684*na.z + -0.30739802*nb.z + -0.38813922*nc.z + -0.33846653*nd.z + -0.08206715*ne.z + 0.15765728*nf.z + -0.16559663*ng.z + -0.055957757*nh.z + -0.11368465*ni.z;
	z = -0.4303523*na.w + -0.84991306*nb.w + -0.2505638*nc.w + 0.35179257*nd.w + 1.0163839*ne.w + 0.23950848*nf.w + 0.08583142*ng.w + -0.2591442*nh.w + -0.045323353*ni.w;
	float q = s+t+u+v+w+x+y+z+0.017286068;
	s = 0.101637*a.x + -0.23477565*b.x + -0.03157821*c.x + -0.20734964*d.x + -0.16431263*e.x + 0.2424383*f.x + -0.11075752*g.x + 0.16768074*h.x + -0.418383*i.x;
	t = 0.006255804*a.y + 0.042100485*b.y + 0.0036014041*c.y + -0.08597467*d.y + 0.048351593*e.y + -0.13372381*f.y + -0.061134014*g.y + -0.33137617*h.y + 0.019631254*i.y;
	u = 0.18377675*a.z + 0.58994883*b.z + 0.2991301*c.z + 0.74260485*d.z + -0.1369073*e.z + 0.24632849*f.z + -0.03240025*g.z + 0.2981277*h.z + 0.3513618*i.z;
	v = -0.04465667*a.w + -0.15135704*b.w + 0.13290188*c.w + -0.049763512*d.w + -0.6689857*e.w + -0.28756517*f.w + 0.04422787*g.w + 0.14173377*h.w + -0.027095031*i.w;
	w = 0.010524522*na.x + 0.2286293*nb.x + -0.15575987*nc.x + 0.19659552*nd.x + 0.2584596*ne.x + 0.53996265*nf.x + 0.1819511*ng.x + 0.20248987*nh.x + 0.08608274*ni.x;
	x = 0.054287046*na.y + 0.04735612*nb.y + 0.0861212*nc.y + -0.028863167*nd.y + 0.20381325*ne.y + -0.109093554*nf.y + 0.010826272*ng.y + 0.23420005*nh.y + -0.022509871*ni.y;
	y = 0.1786933*na.z + 0.126716*nb.z + 0.046265166*nc.z + 0.071686745*nd.z + 0.323193*ne.z + 0.42820987*nf.z + 0.062808044*ng.z + 0.13638002*nh.z + 0.29570308*ni.z;
	z = -0.31819153*na.w + -0.4878216*nb.w + -0.33641538*nc.w + -0.43968466*nd.w + -0.588631*ne.w + 0.06131746*nf.w + -0.28163537*ng.w + -0.49008766*nh.w + -0.5446552*ni.w;
	float r = s+t+u+v+w+x+y+z+0.020686742;
	
	gl_FragColor = vec4(o, p, q, r);
}
`;

const frag4 = `
precision mediump float;

uniform sampler2D HOOKED;
uniform sampler2D LUMAN3;
uniform sampler2D NATIVE;
uniform vec2 HOOKED_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(HOOKED, pos);
}
vec4 LUMAN3_tex(vec2 pos) {
    return texture2D(LUMAN3, pos);
}
vec4 NATIVE_tex(vec2 pos) {
    return texture2D(NATIVE, pos);
}

void main() {
    vec2 dp = HOOKED_pt;
    vec2 HOOKED_pos = v_tex_pos;
	vec4 a = LUMAN3_tex(HOOKED_pos + vec2(-dp.x, -dp.y));
	vec4 b = LUMAN3_tex(HOOKED_pos + vec2(-dp.x, 0));
	vec4 c = LUMAN3_tex(HOOKED_pos + vec2(-dp.x, dp.y));
	vec4 d = LUMAN3_tex(HOOKED_pos + vec2(0, -dp.y));
	vec4 e = LUMAN3_tex(HOOKED_pos + vec2(0, 0));
	vec4 f = LUMAN3_tex(HOOKED_pos + vec2(0, dp.y));
	vec4 g = LUMAN3_tex(HOOKED_pos + vec2(dp.x, -dp.y));
	vec4 h = LUMAN3_tex(HOOKED_pos + vec2(dp.x, 0));
	vec4 i = LUMAN3_tex(HOOKED_pos + vec2(dp.x, dp.y));
	
	vec4 na = -min(a, vec4(0));
	vec4 nb = -min(b, vec4(0));
	vec4 nc = -min(c, vec4(0));
	vec4 nd = -min(d, vec4(0));
	vec4 ne = -min(e, vec4(0));
	vec4 nf = -min(f, vec4(0));
	vec4 ng = -min(g, vec4(0));
	vec4 nh = -min(h, vec4(0));
	vec4 ni = -min(i, vec4(0));
	
	a = max(a, vec4(0));
	b = max(b, vec4(0));
	c = max(c, vec4(0));
	d = max(d, vec4(0));
	e = max(e, vec4(0));
	f = max(f, vec4(0));
	g = max(g, vec4(0));
	h = max(h, vec4(0));
	i = max(i, vec4(0));
	
	float s = -0.23822114*a.x + -0.49224076*b.x + -0.2603839*c.x + -0.22270115*d.x + -0.23199631*e.x + -0.08860003*f.x + -0.11150333*g.x + -0.31895813*h.x + -0.035482813*i.x;
	float t = 0.06318636*a.y + -0.53629327*b.y + -0.10155968*c.y + -0.06471427*d.y + 0.5817465*e.y + -0.13474646*f.y + 0.0058701304*g.y + 0.1711669*h.y + 0.08656512*i.y;
	float u = -0.06168478*a.z + -0.014518998*b.z + -0.038895532*c.z + -0.18411076*d.z + 0.06959173*e.z + -0.03780323*f.z + -0.054073177*g.z + 0.05846756*h.z + 0.0526453*i.z;
	float v = 0.1637899*a.w + -0.17392571*b.w + -0.044026185*c.w + -0.36689785*d.w + 0.14791447*e.w + -0.03293263*f.w + -0.13484396*g.w + 0.025672594*h.w + 0.0018860486*i.w;
	float w = 0.00056899054*na.x + -0.018397113*nb.x + 0.092683315*nc.x + 0.15637913*nd.x + -0.093613446*ne.x + -0.12215183*nf.x + -0.01812064*ng.x + 0.052842487*nh.x + 0.024374953*ni.x;
	float x = -0.18763757*na.y + 0.30196622*nb.y + 0.08883403*nc.y + -0.054503135*nd.y + -0.6387117*ne.y + -0.051367637*nf.y + 0.062047742*ng.y + -0.25852874*nh.y + -0.16576186*ni.y;
	float y = 0.13587122*na.z + 0.08522579*nb.z + 0.03095689*nc.z + 0.25446168*nd.z + -0.1795436*ne.z + 0.12887624*nf.z + 0.16522995*ng.z + -0.12371819*nh.z + 0.018461064*ni.z;
	float z = 0.33695576*na.w + 0.27555978*nb.w + 0.12422293*nc.w + 0.4810716*nd.w + 0.24170946*ne.w + 0.109018564*nf.w + 0.1475024*ng.w + 0.008883083*nh.w + -0.06614558*ni.w;
	float o = s+t+u+v+w+x+y+z+-0.009210918;
	s = 0.011271452*a.x + -0.42887446*b.x + -0.16086382*c.x + -0.2105586*d.x + 0.24786222*e.x + -0.13847941*f.x + -0.18258463*g.x + -0.32100454*h.x + 0.014219074*i.x;
	t = 0.023105236*a.y + -0.01578845*b.y + -0.050536994*c.y + 0.039284714*d.y + 0.16437066*e.y + 0.0356428*f.y + -0.062688194*g.y + 0.07783894*h.y + 0.009747119*i.y;
	u = 0.030821703*a.z + 0.06083882*b.z + 0.025873283*c.z + 0.017223293*d.z + 0.08845148*e.z + 0.061377097*f.z + 0.06515027*g.z + 0.0019544929*h.z + 0.017247573*i.z;
	v = 0.012934576*a.w + 0.07368678*b.w + -0.040340308*c.w + 0.067247815*d.w + -0.08931617*e.w + 0.031227414*f.w + -0.06303663*g.w + 0.03044627*h.w + 0.012112707*i.w;
	w = -0.024660507*na.x + -0.009060651*nb.x + -0.0035039044*nc.x + 0.06341225*nd.x + -0.52527195*ne.x + -0.005501108*nf.x + 0.0588685*ng.x + 0.09516038*nh.x + 0.04720441*ni.x;
	x = -0.063695304*na.y + -0.067882225*nb.y + 0.009680431*nc.y + 0.11614084*nd.y + 0.07604306*ne.y + -0.2850213*nf.y + 0.06081603*ng.y + -0.078130275*nh.y + 0.010210937*ni.y;
	y = 0.020847162*na.z + 0.08855373*nb.z + 0.0023585085*nc.z + 0.046964426*nd.z + 0.029082319*ne.z + -0.010446979*nf.z + 0.069331944*ng.z + -0.1097909*nh.z + 0.0066273385*ni.z;
	z = 0.07595761*na.w + 0.21096602*nb.w + -0.0016103018*nc.w + 0.01423776*nd.w + 0.39817473*ne.w + 0.017830608*nf.w + 0.10896886*ng.w + 0.05775906*nh.w + -0.008378969*ni.w;
	float p = s+t+u+v+w+x+y+z+0.007218698;
	s = 0.034728855*a.x + -0.24261177*b.x + 0.28377128*c.x + -0.07902698*d.x + 0.53327984*e.x + 0.25865844*f.x + -0.0034399142*g.x + -0.43674976*h.x + 0.032661323*i.x;
	t = -0.07738957*a.y + 0.057249602*b.y + 0.2050702*c.y + 0.17566027*d.y + 0.011081271*e.y + -0.23351799*f.y + -0.09890139*g.y + 0.018036745*h.y + 0.047635887*i.y;
	u = -0.020469286*a.z + 0.047594436*b.z + -0.002022923*c.z + -0.20256907*d.z + -0.78263223*e.z + 0.0072576823*f.z + -0.0490066*g.z + 0.029040253*h.z + 0.017826209*i.z;
	v = -0.020083593*a.w + 0.06858024*b.w + 0.06368863*c.w + 0.20496108*d.w + -0.16528691*e.w + -0.10180708*f.w + -0.16950546*g.w + 0.10020681*h.w + 0.012377215*i.w;
	w = -0.03253046*na.x + 0.066873014*nb.x + -0.068452045*nc.x + -0.010155748*nd.x + -0.46329933*ne.x + -0.1307425*nf.x + 0.048001047*ng.x + 0.123704046*nh.x + 0.074856944*ni.x;
	x = 0.062060773*na.y + 0.13428265*nb.y + -0.24431407*nc.y + -0.072135694*nd.y + 0.9167748*ne.y + 0.23750597*nf.y + 0.04223396*ng.y + -0.39293385*nh.y + -0.2623536*ni.y;
	y = 0.021315947*na.z + 0.09439878*nb.z + 0.015211157*nc.z + 0.2038265*nd.z + 0.69010055*ne.z + 0.042161886*nf.z + 0.0677661*ng.z + -0.023256699*nh.z + 0.014574618*ni.z;
	z = -0.04407271*na.w + 0.11794614*nb.w + 0.03630912*nc.w + 0.7663727*nd.w + 0.39717525*ne.w + 0.22002636*nf.w + -0.010754877*ng.w + -0.051768698*nh.w + -0.010918847*ni.w;
	float q = s+t+u+v+w+x+y+z+0.024105644;
	s = 0.030766528*a.x + 0.16373588*b.x + 0.21841961*c.x + 0.10914003*d.x + 0.05621998*e.x + 0.25531125*f.x + 0.058601663*g.x + -0.029884653*h.x + -0.03693911*i.x;
	t = -0.045011982*a.y + 0.093240164*b.y + 0.09846852*c.y + 0.06726326*d.y + 0.628559*e.y + -0.02637863*f.y + 0.0064472784*g.y + 0.042976446*h.y + 0.0080402335*i.y;
	u = -0.017018517*a.z + -0.0002487334*b.z + 0.051482406*c.z + 0.09698756*d.z + -0.06515222*e.z + 0.020085098*f.z + 0.049856555*g.z + 0.09850702*h.z + 0.06601598*i.z;
	v = 0.0029910787*a.w + 0.027113425*b.w + 0.056177218*c.w + 0.1544931*d.w + 0.28678927*e.w + -0.031562537*f.w + -0.015119418*g.w + 0.059966877*h.w + 0.009752991*i.w;
	w = -0.06231565*na.x + -0.03341734*nb.x + -0.072572425*nc.x + -0.04877089*nd.x + -0.047237467*ne.x + -0.10683365*nf.x + -0.002816312*ng.x + -0.05710042*nh.x + -0.01591127*ni.x;
	x = 0.025939502*na.y + 0.10218501*nb.y + -0.10536432*nc.y + -0.071161434*nd.y + -0.3066342*ne.y + 0.061602294*nf.y + 0.03169828*ng.y + 0.005768011*nh.y + -0.18946463*ni.y;
	y = -0.013577987*na.z + -0.025278145*nb.z + 0.00625481*nc.z + -0.08724931*nd.z + 0.15522881*ne.z + -0.015623531*nf.z + -0.040420238*ng.z + 0.07587788*nh.z + -0.026974916*ni.z;
	z = 0.05199736*na.w + -0.046465985*nb.w + 0.020043945*nc.w + -0.1230899*nd.w + -0.26674423*ne.w + 0.039947394*nf.w + -0.039006326*ng.w + -0.08176985*nh.w + 0.030418074*ni.w;
	float r = s+t+u+v+w+x+y+z+-0.012540265;
	
	gl_FragColor = vec4(o, p, q, r);
}
`;

const frag5 = `
precision mediump float;

uniform sampler2D HOOKED;
uniform sampler2D LUMAN4;
uniform sampler2D NATIVE;
uniform vec2 HOOKED_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(HOOKED, pos);
}
vec4 LUMAN4_tex(vec2 pos) {
    return texture2D(LUMAN4, pos);
}
vec4 NATIVE_tex(vec2 pos) {
    return texture2D(NATIVE, pos);
}

void main() {
    vec2 dp = HOOKED_pt;
    vec2 HOOKED_pos = v_tex_pos;
	vec4 a = LUMAN4_tex(HOOKED_pos + vec2(-dp.x, -dp.y));
	vec4 b = LUMAN4_tex(HOOKED_pos + vec2(-dp.x, 0));
	vec4 c = LUMAN4_tex(HOOKED_pos + vec2(-dp.x, dp.y));
	vec4 d = LUMAN4_tex(HOOKED_pos + vec2(0, -dp.y));
	vec4 e = LUMAN4_tex(HOOKED_pos + vec2(0, 0));
	vec4 f = LUMAN4_tex(HOOKED_pos + vec2(0, dp.y));
	vec4 g = LUMAN4_tex(HOOKED_pos + vec2(dp.x, -dp.y));
	vec4 h = LUMAN4_tex(HOOKED_pos + vec2(dp.x, 0));
	vec4 i = LUMAN4_tex(HOOKED_pos + vec2(dp.x, dp.y));
	
	vec4 na = -min(a, vec4(0));
	vec4 nb = -min(b, vec4(0));
	vec4 nc = -min(c, vec4(0));
	vec4 nd = -min(d, vec4(0));
	vec4 ne = -min(e, vec4(0));
	vec4 nf = -min(f, vec4(0));
	vec4 ng = -min(g, vec4(0));
	vec4 nh = -min(h, vec4(0));
	vec4 ni = -min(i, vec4(0));
	
	a = max(a, vec4(0));
	b = max(b, vec4(0));
	c = max(c, vec4(0));
	d = max(d, vec4(0));
	e = max(e, vec4(0));
	f = max(f, vec4(0));
	g = max(g, vec4(0));
	h = max(h, vec4(0));
	i = max(i, vec4(0));
	
	float s = 0.00025631802*a.x + 0.057320878*b.x + -0.041412644*c.x + 0.16791897*d.x + 0.16617729*e.x + -0.48703465*f.x + -0.12931561*g.x + 0.4140343*h.x + -0.33470672*i.x;
	float t = 0.03830889*a.y + -0.051282525*b.y + 0.09902938*c.y + 0.051170327*d.y + -1.0059495*e.y + 0.3998207*f.y + -0.026771523*g.y + -0.23292333*h.y + 0.23323184*i.y;
	float u = 0.033804324*a.z + -0.16789144*b.z + 0.11551676*c.z + 0.2096383*d.z + -0.5732962*e.z + 0.37778842*f.z + -0.035116088*g.z + 0.089063995*h.z + 0.070677355*i.z;
	float v = 0.22857346*a.w + -0.079091504*b.w + -0.31563935*c.w + 0.5057771*d.w + -1.3217461*e.w + -0.12721835*f.w + 0.16177909*g.w + -0.2629097*h.w + -0.0029459773*i.w;
	float w = -0.030586343*na.x + -0.13376898*nb.x + 0.13974473*nc.x + -0.24266301*nd.x + -0.11947399*ne.x + 0.19367288*nf.x + -0.34237102*ng.x + 0.3096073*nh.x + 0.043135814*ni.x;
	float x = -0.14012407*na.y + 0.016800448*nb.y + 0.1570266*nc.y + 0.7430246*nd.y + -0.005562219*ne.y + 0.26139715*nf.y + 0.64244574*ng.y + -0.51432157*nh.y + -0.114942044*ni.y;
	float y = -0.10178008*na.z + 0.23307206*nb.z + -0.29321644*nc.z + 0.24498452*nd.z + -1.1282628*ne.z + 0.022412058*nf.z + -0.16838956*ng.z + 0.40056717*nh.z + -0.21463306*ni.z;
	float z = -1.005476*na.w + 0.8050052*nb.w + 0.12235334*nc.w + -0.6732282*nd.w + 0.3369146*ne.w + 0.06454999*nf.w + -0.17765191*ng.w + 0.10384625*nh.w + -0.11302512*ni.w;
	float o = s+t+u+v+w+x+y+z+-0.061198946;
	s = 0.08390676*a.x + -0.011123063*b.x + -0.03269317*c.x + -0.19219291*d.x + -0.050676446*e.x + 0.07472215*f.x + 0.085977115*g.x + 0.11578824*h.x + -0.28158212*i.x;
	t = -0.02405043*a.y + -0.13468283*b.y + 0.014654289*c.y + 0.28977296*d.y + 0.6254546*e.y + 0.16947387*f.y + -0.026750885*g.y + 0.037516773*h.y + 0.29321685*i.y;
	u = 0.017659916*a.z + -0.0513346*b.z + 0.014308151*c.z + -0.07032843*d.z + -0.124652594*e.z + 0.027099187*f.z + -0.042692557*g.z + -0.32160884*h.z + -0.124402575*i.z;
	v = 0.173668*a.w + 0.16868736*b.w + 0.105285004*c.w + -0.27488157*d.w + -0.62909824*e.w + -0.28937566*f.w + 0.021574946*g.w + 0.090454094*h.w + 0.088722266*i.w;
	w = 0.011426444*na.x + -0.16358133*nb.x + -0.24628234*nc.x + -0.12582813*nd.x + 0.37491634*ne.x + 0.66146225*nf.x + 0.17739972*ng.x + -0.24103446*nh.x + -0.12512414*ni.x;
	x = 0.049656067*na.y + 0.35043705*nb.y + -0.06541586*nc.y + 0.036384188*nd.y + -0.88243604*ne.y + 0.15085825*nf.y + 0.01566454*ng.y + 0.26099333*nh.y + -0.23653607*ni.y;
	y = -0.05713696*na.z + 0.31915048*nb.z + 0.09413395*nc.z + -0.056367278*nd.z + 0.500199*ne.z + -0.10129501*nf.z + 0.22792955*ng.z + 0.27008235*nh.z + 0.11766709*ni.z;
	z = -0.30272278*na.w + -0.032818265*nb.w + -0.0091206925*nc.w + 0.7295555*nd.w + 0.078978635*ne.w + -0.036731187*nf.w + -0.04899552*ng.w + -0.23233992*nh.w + 0.120634325*ni.w;
	float p = s+t+u+v+w+x+y+z+-0.006999369;
	s = -0.021856444*a.x + -0.0006963466*b.x + 0.02784665*c.x + -0.1285126*d.x + -0.47980213*e.x + 0.3816084*f.x + 0.11308428*g.x + -0.43742862*h.x + 0.43896514*i.x;
	t = -0.053421438*a.y + 0.0963073*b.y + -0.13441114*c.y + -0.12122123*d.y + -0.15046698*e.y + -0.39540198*f.y + -0.0028491614*g.y + 0.22168712*h.y + -0.33935112*i.y;
	u = -0.02753673*a.z + 0.13554272*b.z + -0.08918299*c.z + -0.17173594*d.z + 0.46268475*e.z + -0.35359815*f.z + 0.046332352*g.z + 0.02462448*h.z + -0.023167444*i.z;
	v = -0.23453364*a.w + 0.07788929*b.w + 0.16012788*c.w + -0.41643515*d.w + -0.6417199*e.w + 0.3087294*f.w + -0.14682502*g.w + 0.25157255*h.w + -0.0602734*i.w;
	w = 0.028217131*na.x + 0.12867944*nb.x + -0.05617058*nc.x + 0.28762993*nd.x + -0.5784438*ne.x + -0.36014605*nf.x + 0.21616842*ng.x + -0.18586996*nh.x + -0.009710477*ni.x;
	x = 0.123937346*na.y + -0.112089925*nb.y + -0.079855986*nc.y + -0.65935284*nd.y + 1.6843947*ne.y + -0.37654027*nf.y + -0.5687655*ng.y + 0.36904392*nh.y + 0.22348003*ni.y;
	y = 0.10575013*na.z + -0.28616336*nb.z + 0.22265147*nc.z + -0.2137293*nd.z + -0.91093117*ne.z + 0.011338876*nf.z + 0.10558912*ng.z + -0.47041062*nh.z + 0.16206238*ni.z;
	z = 0.9702835*na.w + -0.82380474*nb.w + -0.0043063024*nc.w + 0.4436007*nd.w + -0.69435906*ne.w + -0.11961962*nf.w + 0.18174438*ng.w + -0.050473217*nh.w + 0.07299529*ni.w;
	float q = s+t+u+v+w+x+y+z+-0.042621654;
	s = 0.012985117*a.x + 0.069789566*b.x + 0.012881662*c.x + -0.013086082*d.x + -0.16663207*e.x + 0.18778817*f.x + -0.009702196*g.x + 0.038190898*h.x + -0.050225593*i.x;
	t = -0.07929176*a.y + -0.06990447*b.y + -0.06669893*c.y + 0.025257275*d.y + 0.7689759*e.y + -0.10249004*f.y + 0.017197285*g.y + -0.10194497*h.y + 0.090725824*i.y;
	u = 0.0030403193*a.z + 0.012294587*b.z + -0.023400322*c.z + -0.043591868*d.z + -0.16327766*e.z + -0.02788577*f.z + 0.018733488*g.z + -0.034326617*h.z + -0.05105706*i.z;
	v = -0.062092993*a.w + 0.18108387*b.w + 0.0864376*c.w + -0.16197896*d.w + -0.12865224*e.w + -0.069327936*f.w + 0.0015153112*g.w + 0.018491505*h.w + 0.049098536*i.w;
	w = 0.019960985*na.x + 0.051785935*nb.x + -0.21044643*nc.x + 0.09824475*nd.x + -0.14958306*ne.x + 0.3990458*nf.x + 0.016052058*ng.x + 0.049709063*nh.x + -0.17706677*ni.x;
	x = 0.019563846*na.y + 0.18184721*nb.y + -0.11986355*nc.y + -0.2601329*nd.y + -0.28785226*ne.y + 0.085305505*nf.y + 0.024360009*ng.y + -0.20685866*nh.y + -0.086421244*ni.y;
	y = -0.0028385085*na.z + -0.007392961*nb.z + 0.12550405*nc.z + 0.05340696*nd.z + -0.24601264*ne.z + -0.19635704*nf.z + -0.035968296*ng.z + 0.10348485*nh.z + -0.009769748*ni.z;
	z = 0.26647258*na.w + -0.63420767*nb.w + -0.02826515*nc.w + 0.06637238*nd.w + 0.57809395*ne.w + 0.06882983*nf.w + -0.004849368*ng.w + -0.093381576*nh.w + -0.10812531*ni.w;
	float r = s+t+u+v+w+x+y+z+-0.018241946;
	
	gl_FragColor = vec4(o, p, q, r);
}
`;

const frag6 = `
precision mediump float;

uniform sampler2D HOOKED;
uniform sampler2D LUMAN1;
uniform sampler2D LUMAN2;
uniform sampler2D LUMAN3;
uniform sampler2D LUMAN4;
uniform sampler2D LUMAN5;
uniform sampler2D NATIVE;
uniform vec2 HOOKED_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(HOOKED, pos);
}
vec4 LUMAN1_tex(vec2 pos) {
    return texture2D(LUMAN1, pos);
}
vec4 LUMAN2_tex(vec2 pos) {
    return texture2D(LUMAN2, pos);
}
vec4 LUMAN3_tex(vec2 pos) {
    return texture2D(LUMAN3, pos);
}
vec4 LUMAN4_tex(vec2 pos) {
    return texture2D(LUMAN4, pos);
}
vec4 LUMAN5_tex(vec2 pos) {
    return texture2D(LUMAN5, pos);
}
vec4 NATIVE_tex(vec2 pos) {
    return texture2D(NATIVE, pos);
}

void main() {
    vec2 dp = HOOKED_pt;
    vec2 HOOKED_pos = v_tex_pos;
	vec4 a = LUMAN1_tex(HOOKED_pos);
	vec4 b = LUMAN2_tex(HOOKED_pos);
	vec4 c = LUMAN3_tex(HOOKED_pos);
	vec4 d = LUMAN4_tex(HOOKED_pos);
	vec4 e = LUMAN5_tex(HOOKED_pos);
	
	vec4 na = -min(a, vec4(0));
	vec4 nb = -min(b, vec4(0));
	vec4 nc = -min(c, vec4(0));
	vec4 nd = -min(d, vec4(0));
	vec4 ne = -min(e, vec4(0));
	
	a = max(a, vec4(0));
	b = max(b, vec4(0));
	c = max(c, vec4(0));
	d = max(d, vec4(0));
	e = max(e, vec4(0));

	float o = 0.016170086*a.x + -0.07807932*a.y + -0.01608141*a.z + 0.04596583*a.w + 0.0010671375*na.x + 0.13604787*na.y + -0.103508055*na.z + -0.053727165*na.w + 0.05931074*b.x + -0.03741526*b.y + 0.007310368*b.z + 0.021383934*b.w + 0.07797022*nb.x + 0.010276286*nb.y + -0.044151705*nb.z + 0.018349322*nb.w + -0.10480624*c.x + -0.19607827*c.y + -0.017716367*c.z + -0.03210694*c.w + 0.030397506*nc.x + 0.13205609*nc.y + 0.027324466*nc.z + 0.011638977*nc.w + -0.046764173*d.x + -0.14180084*d.y + -0.041110236*d.z + -0.3233351*d.w + -0.13833268*nd.x + 0.35512686*nd.y + -0.08653635*nd.z + -0.15801503*nd.w + -0.26316383*e.x + -0.2056243*e.y + -0.09891177*e.z + 0.09735771*e.w + 0.17222679*ne.x + 0.10222737*ne.y + 0.17698137*ne.z + -0.045976873*ne.w + -0.016519222;
	float p = -0.0070673134*a.x + -0.10279413*a.y + -0.030861663*a.z + 0.019370042*a.w + -0.0014143038*na.x + 0.05432107*na.y + -0.15635669*na.z + -0.05455238*na.w + 0.027550258*b.x + 0.014056243*b.y + -0.016198097*b.z + 0.03419058*b.w + -0.004207751*nb.x + -0.0113672*nb.y + 0.034180697*nb.z + 0.04015298*nb.w + -0.06339332*c.x + 0.0036280584*c.y + -0.010639602*c.z + 0.026508855*c.w + -0.02524984*nc.x + 0.11936996*nc.y + -0.031202994*nc.z + -0.021372601*nc.w + -0.025080366*d.x + -0.021841787*d.y + 0.06487728*d.z + -0.06460682*d.w + 0.04119384*nd.x + -0.008643975*nd.y + -0.2078446*nd.z + 0.11259166*nd.w + -0.10560037*e.x + 0.14785078*e.y + 0.1384287*e.z + -0.06915313*e.w + 0.010694984*ne.x + -0.034556255*ne.y + -0.03377371*ne.z + 0.06635877*ne.w + -0.002248366;
	float q = 0.02117986*a.x + -0.051776726*a.y + 0.15544093*a.z + 0.070309296*a.w + -0.011411071*na.x + 0.0055163414*na.y + 0.06413486*na.z + -0.045615938*na.w + 0.033726115*b.x + -0.052270424*b.y + 0.019222505*b.z + 0.02011268*b.w + -0.11609392*nb.x + 0.033497345*nb.y + -0.06132894*nb.z + -0.10658528*nb.w + 0.038067166*c.x + 0.086731836*c.y + 0.08148008*c.z + 0.010150495*c.w + -0.016870074*nc.x + 0.01104681*nc.y + 0.009952575*nc.z + 0.020137098*nc.w + -0.06427216*d.x + -0.12534674*d.y + -0.09109642*d.z + -0.46550632*d.w + -0.1370387*nd.x + 0.24063608*nd.y + -0.33579165*nd.z + -0.08938409*nd.w + -0.09131308*e.x + -0.17998323*e.y + -0.33354574*e.z + -0.20851119*e.w + 0.21100727*ne.x + 0.0667875*ne.y + 0.23766036*ne.z + 0.10573718*ne.w + -0.023920521;
	float r = -0.06296154*a.x + 0.06051705*a.y + 0.11386459*a.z + 0.019399049*a.w + -0.015610163*na.x + 0.0037772388*na.y + 0.04038177*na.z + 0.020901382*na.w + 0.0468376*b.x + 0.004552797*b.y + 0.08530895*b.z + -0.0020661093*b.w + -0.075115256*nb.x + 0.01650069*nb.y + 0.025982859*nb.z + -0.063966826*nb.w + 0.14024706*c.x + 0.03896333*c.y + -0.070236415*c.z + 0.013854423*c.w + -0.023396354*nc.x + -0.10749727*nc.y + 0.018419292*nc.z + 0.0051121856*nc.w + -0.098157406*d.x + -0.24840991*d.y + -0.01761279*d.z + -0.48552045*d.w + -0.11399571*nd.x + 0.2751265*nd.y + -0.4713016*nd.z + 0.009285934*nd.w + -0.11395686*e.x + 0.04294104*e.y + -0.33598495*e.z + 0.14753135*e.w + 0.18233627*ne.x + 0.06840005*ne.y + 0.23921333*ne.z + -0.087927036*ne.w + -0.020836344;

	gl_FragColor = vec4(o, p, q, r);
}
`;

const frag7 = `
precision mediump float;

uniform sampler2D HOOKED;
uniform sampler2D NATIVE;
uniform vec2 HOOKED_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(HOOKED, pos);
}
vec4 NATIVE_tex(vec2 pos) {
    return texture2D(NATIVE, pos);
}

float max3v(float a, float b, float c) {
	return max(max(a, b), c);
}
float min3v(float a, float b, float c) {
	return min(min(a, b), c);
}

vec2 minmax3(vec2 pos, vec2 d) {
	float a = HOOKED_tex(pos - d).x;
	float b = HOOKED_tex(pos).x;
	float c = HOOKED_tex(pos + d).x;
	
	return vec2(min3v(a, b, c), max3v(a, b, c));
}

void main() {
    vec2 HOOKED_pos = v_tex_pos;
    gl_FragColor = vec4(minmax3(HOOKED_pos, vec2(HOOKED_pt.x, 0)), 0, 0);
}
`;

const frag8 = `
precision mediump float;

uniform sampler2D HOOKED;
uniform sampler2D MMKERNEL;
uniform sampler2D NATIVE;
uniform vec2 HOOKED_pt;
varying vec2 v_tex_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(HOOKED, pos);
}
vec4 MMKERNEL_tex(vec2 pos) {
    return texture2D(MMKERNEL, pos);
}
vec4 NATIVE_tex(vec2 pos) {
    return texture2D(NATIVE, pos);
}

float max3v(float a, float b, float c) {
	return max(max(a, b), c);
}
float min3v(float a, float b, float c) {
	return min(min(a, b), c);
}

vec2 minmax3(vec2 pos, vec2 d) {
	float a0 = MMKERNEL_tex(pos - d).x;
	float b0 = MMKERNEL_tex(pos).x;
	float c0 = MMKERNEL_tex(pos + d).x;
	
	float a1 = MMKERNEL_tex(pos - d).y;
	float b1 = MMKERNEL_tex(pos).y;
	float c1 = MMKERNEL_tex(pos + d).y;
	
	return vec2(min3v(a0, b0, c0), max3v(a1, b1, c1));
}

void main() {
    vec2 HOOKED_pos = v_tex_pos;
    gl_FragColor = vec4(minmax3(HOOKED_pos, vec2(0, HOOKED_pt.y)), 0, 0);
}
`;

const frag9 = `
precision mediump float;

uniform sampler2D HOOKED;
uniform sampler2D LUMAN0;
uniform sampler2D MMKERNEL;
uniform sampler2D NATIVE;
uniform vec2 HOOKED_pt;
varying vec2 v_tex_pos;

uniform float LUMAN0_size;
uniform vec2 LUMAN0_pt;

uniform vec2 MMKERNEL_pt;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(HOOKED, pos);
}
vec4 LUMAN0_tex(vec2 pos) {
    return texture2D(LUMAN0, pos);
}
vec4 MMKERNEL_tex(vec2 pos) {
    return texture2D(MMKERNEL, pos);
}
vec4 NATIVE_tex(vec2 pos) {
    return texture2D(NATIVE, pos);
}

#define STRENGTH 1.0 //De-blur proportional strength, higher is sharper. However, it is better to tweak BLUR_CURVE instead to avoid ringing.
#define BLUR_CURVE 0.6 //De-blur power curve, lower is sharper. Good values are between 0.3 - 1. Values greater than 1 softens the image;
#define BLUR_THRESHOLD 0.1 //Value where curve kicks in, used to not de-blur already sharp edges. Only de-blur values that fall below this threshold.
#define NOISE_THRESHOLD 0.001 //Value where curve stops, used to not sharpen noise. Only de-blur values that fall above this threshold.

void main() {
    vec2 HOOKED_pos = v_tex_pos;
    vec2 LUMAN0_pos = v_tex_pos;
    vec2 MMKERNEL_pos = v_tex_pos;
	vec2 f = fract(LUMAN0_pos * LUMAN0_size);
	ivec2 i = ivec2(f * vec2(2));
	float c0 = LUMAN0_tex((vec2(0.5) - f) * LUMAN0_pt + LUMAN0_pos)[1]; // Change this to 0 to see what happened. I dunno what the index is used for.
	float c = c0 * STRENGTH;
	
	vec2 mm = MMKERNEL_tex((vec2(0.5) - f) * MMKERNEL_pt + MMKERNEL_pos).xy;
	
	float t_range = BLUR_THRESHOLD - NOISE_THRESHOLD;
	
	float c_t = abs(c);
	if (c_t > NOISE_THRESHOLD && c_t < BLUR_THRESHOLD) {
		c_t = (c_t - NOISE_THRESHOLD) / t_range;
		c_t = pow(c_t, BLUR_CURVE);
		c_t = c_t * t_range + NOISE_THRESHOLD;
		c_t = c_t * sign(c);
		gl_FragColor = vec4(clamp(c_t + HOOKED_tex(HOOKED_pos).x, MMKERNEL_tex(HOOKED_pos).x, MMKERNEL_tex(HOOKED_pos).y), HOOKED_tex(HOOKED_pos).yz, 0);
	} else {
		gl_FragColor = vec4(c + HOOKED_tex(HOOKED_pos).x, HOOKED_tex(HOOKED_pos).yz, 0);
	}
	
}
`;

const fragDraw = `
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

    this.quadBuffer = createBuffer(gl, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]));
    this.framebuffer = gl.createFramebuffer();

    console.log('Compiling shaders...')
    this.program0 = createProgram(gl, quadVert, frag0);
    this.program1 = createProgram(gl, quadVert, frag1);
    this.program2 = createProgram(gl, quadVert, frag2);
    this.program3 = createProgram(gl, quadVert, frag3);
    this.program4 = createProgram(gl, quadVert, frag4);
    this.program5 = createProgram(gl, quadVert, frag5);
    this.program6 = createProgram(gl, quadVert, frag6);
    this.program7 = createProgram(gl, quadVert, frag7);
    this.program8 = createProgram(gl, quadVert, frag8);
    this.program9 = createProgram(gl, quadVert, frag9);
    this.programDraw = createProgram(gl, quadVert, fragDraw);

    this.temp0Texture = null;
    this.temp1Texture = null;
    this.outputTexture = null;
    this.mmkernelTexture = null;
    
    this.luman0Texture = null;
    this.luman1Texture = null;
    this.luman2Texture = null;
    this.luman3Texture = null;
    this.luman4Texture = null;
    this.luman5Texture = null;
    this.luman6Texture = null;

    this.scale = 1.0;
    this.screenRatio = window.screen.width/window.screen.height;
    this.playerRatio = 16/9 // Assuming default player ratio is 16:9 (this is true for Bilibili and ACFun).
    this.isLoggedPaused = false;
    this.isFullscreen = true;   // Setting this to true to resize the board on start.
    console.log("Default screen aspect ratio is set to " + this.screenRatio)
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

    this.temp0Texture = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    this.temp1Texture = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    this.outputTexture = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    this.mmkernelTexture = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    
    this.luman0Texture = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    this.luman1Texture = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    this.luman2Texture = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    this.luman3Texture = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    this.luman4Texture = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    this.luman5Texture = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
    this.luman6Texture = createTexture(gl, gl.LINEAR, emptyPixels, width, height);
}

Scaler.prototype.resizeBoard = function(originRatio, newRatio){
    if (Math.abs(originRatio-newRatio) > 0.001){    // To prevent precision-caused problem.
        console.log("Video ratio mismatched!")
        console.log("Video Ratio: " + originRatio)
        console.log("Screen ratio: " + newRatio)
        if(originRatio>newRatio){   // Not-so-wide screen, change height.
            let newHeight = newRatio/originRatio*100
            console.log("Setting new height precentage: " + newHeight + "%")
            globalBoard.style.height = newHeight + "%"
            globalBoard.style.marginTop = (100-newHeight)/3 + "%"
        } else {    // Wide screen, change width.
            let newWidth = originRatio/newRatio*100
            console.log("Setting new width precentage: " + newWidth + "%")
            globalBoard.style.width = newWidth + "%"
            globalBoard.style.marginLeft = (100-newWidth)/2 + "%"
        }
    }
}

Scaler.prototype.render = async function () {
    if (!this.inputMov || !this.inputTex) {
        return;
    }

    // Nasty trick to fix video quailty changing bug.
    if (this.gl.getError() == this.gl.INVALID_VALUE) {
        console.log('glError detected! Fetching new viedo tag... (This may happen due to resolution change)')
        let newMov = await getVideoTag()
        this.inputVideo(newMov)
    }

    let videoRatio = this.inputMov.videoWidth/this.inputMov.videoHeight
    if (document.fullscreenElement!=null) {  // To prevent float precision caused problem.
        if(!this.isFullscreen){
            console.log("Fullscreen detected.")
            this.resizeBoard(videoRatio, this.screenRatio)
            this.isFullscreen = true
        }
    } else {
        if(this.isFullscreen){
            console.log("Fullscreen deactivated.")
            // Reset all style.
            globalBoard.style.width = "100%"
            globalBoard.style.height = "100%"
            globalBoard.style.marginLeft = null
            globalBoard.style.marginTop = null
            // Then re-calculate board ratio.
            this.resizeBoard(videoRatio, this.playerRatio)
            this.isFullscreen = false
        }
    }

    // Check if video is paused.
    if (this.inputMov.paused){
        // If paused we stop rendering new frames.
        if(!this.isLoggedPaused){
            console.log("Video paused.")
            this.isLoggedPaused = true
        }
        return
    } else {
        // Else we continue rendering new frames.
        if(this.isLoggedPaused){
            console.log("Video continued.")
            this.isLoggedPaused = false
        }
    }

    if (this.inputMov) {
        updateTexture(this.gl, this.inputTex, this.inputMov);
    }

    // Automatic change scale according to original video resolution.
    // Upscaled to 1440p.
    let newScale = 1440 / this.inputMov.videoHeight;
    if (this.scale != newScale){
        this.scale = newScale;
        console.log('Setting scale to ' + this.scale);
    }

    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.disable(this.gl.STENCIL_TEST);

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    // Frag0
    bindFramebuffer(this.gl, this.framebuffer, this.luman0Texture); // SAVE LUMAN0
    this.gl.useProgram(this.program0.program);
    bindAttribute(this.gl, this.quadBuffer, this.program0.a_pos, 2);

    bindTexture(this.gl, this.inputTex, 0); // HOOKED NATIVE
    this.gl.uniform1i(this.program0.HOOKED, 0);
    this.gl.uniform2f(this.program0.HOOKED_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Frag1
    bindFramebuffer(this.gl, this.framebuffer, this.luman1Texture); // SAVE LUMAN1
    this.gl.useProgram(this.program1.program);
    bindAttribute(this.gl, this.quadBuffer, this.program1.a_pos, 2);

    bindTexture(this.gl, this.inputTex, 0); // HOOKED NATIVE
    this.gl.uniform1i(this.program1.HOOKED, 0);
    bindTexture(this.gl, this.luman0Texture, 1); // LUMAN0
    this.gl.uniform1i(this.program1.LUMAN0, 1);
    this.gl.uniform2f(this.program1.HOOKED_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Frag2
    bindFramebuffer(this.gl, this.framebuffer, this.luman2Texture); // SAVE LUMAN2
    this.gl.useProgram(this.program2.program);
    bindAttribute(this.gl, this.quadBuffer, this.program2.a_pos, 2);

    bindTexture(this.gl, this.inputTex, 0); // HOOKED NATIVE
    this.gl.uniform1i(this.program2.HOOKED, 0);
    bindTexture(this.gl, this.luman1Texture, 1); // LUMAN1
    this.gl.uniform1i(this.program2.LUMAN1, 1);
    this.gl.uniform2f(this.program2.HOOKED_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Frag3
    bindFramebuffer(this.gl, this.framebuffer, this.luman3Texture); // SAVE LUMAN3
    this.gl.useProgram(this.program3.program);
    bindAttribute(this.gl, this.quadBuffer, this.program3.a_pos, 2);

    bindTexture(this.gl, this.inputTex, 0); // HOOKED NATIVE
    this.gl.uniform1i(this.program3.HOOKED, 0);
    bindTexture(this.gl, this.luman2Texture, 1); // LUMAN2
    this.gl.uniform1i(this.program3.LUMAN2, 1);
    this.gl.uniform2f(this.program3.HOOKED_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Frag4
    bindFramebuffer(this.gl, this.framebuffer, this.luman4Texture); // SAVE LUMAN4
    this.gl.useProgram(this.program4.program);
    bindAttribute(this.gl, this.quadBuffer, this.program4.a_pos, 2);

    bindTexture(this.gl, this.inputTex, 0); // HOOKED NATIVE
    this.gl.uniform1i(this.program4.HOOKED, 0);
    bindTexture(this.gl, this.luman3Texture, 1); // LUMAN3
    this.gl.uniform1i(this.program4.LUMAN3, 1);
    this.gl.uniform2f(this.program4.HOOKED_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Frag5
    bindFramebuffer(this.gl, this.framebuffer, this.luman5Texture); // SAVE LUMAN5
    this.gl.useProgram(this.program5.program);
    bindAttribute(this.gl, this.quadBuffer, this.program5.a_pos, 2);

    bindTexture(this.gl, this.inputTex, 0); // HOOKED NATIVE
    this.gl.uniform1i(this.program5.HOOKED, 0);
    bindTexture(this.gl, this.luman4Texture, 1); // LUMAN4
    this.gl.uniform1i(this.program5.LUMAN4, 1);
    this.gl.uniform2f(this.program5.HOOKED_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Frag6
    bindFramebuffer(this.gl, this.framebuffer, this.temp0Texture); // SAVE LUMAN0
    this.gl.useProgram(this.program6.program);
    bindAttribute(this.gl, this.quadBuffer, this.program6.a_pos, 2);

    bindTexture(this.gl, this.inputTex, 0); // HOOKED NATIVE
    this.gl.uniform1i(this.program6.HOOKED, 0);
    bindTexture(this.gl, this.luman0Texture, 1); // LUMAN0
    this.gl.uniform1i(this.program6.LUMAN0, 1);
    bindTexture(this.gl, this.luman1Texture, 2); // LUMAN1
    this.gl.uniform1i(this.program6.LUMAN1, 2);
    bindTexture(this.gl, this.luman2Texture, 3); // LUMAN2
    this.gl.uniform1i(this.program6.LUMAN2, 3);
    bindTexture(this.gl, this.luman3Texture, 4); // LUMAN3
    this.gl.uniform1i(this.program6.LUMAN3, 4);
    bindTexture(this.gl, this.luman4Texture, 5); // LUMAN4
    this.gl.uniform1i(this.program6.LUMAN4, 5);
    bindTexture(this.gl, this.luman5Texture, 6); // LUMAN5
    this.gl.uniform1i(this.program6.LUMAN5, 6);
    this.gl.uniform2f(this.program6.HOOKED_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    
    // Frag7
    bindFramebuffer(this.gl, this.framebuffer, this.mmkernelTexture); // SAVE MMKERNEL
    this.gl.useProgram(this.program7.program);
    bindAttribute(this.gl, this.quadBuffer, this.program7.a_pos, 2);

    bindTexture(this.gl, this.inputTex, 0); // HOOKED NATIVE
    this.gl.uniform1i(this.program7.HOOKED, 0);
    this.gl.uniform2f(this.program7.HOOKED_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Frag8
    bindFramebuffer(this.gl, this.framebuffer, this.temp1Texture); // SAVE MMKERNEL
    this.gl.useProgram(this.program8.program);
    bindAttribute(this.gl, this.quadBuffer, this.program8.a_pos, 2);

    bindTexture(this.gl, this.inputTex, 0); // HOOKED NATIVE
    this.gl.uniform1i(this.program8.HOOKED, 0);
    bindTexture(this.gl, this.mmkernelTexture, 1); // MMKERNEL
    this.gl.uniform1i(this.program8.MMKERNEL, 1);
    this.gl.uniform2f(this.program8.HOOKED_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Frag9
    bindFramebuffer(this.gl, this.framebuffer, this.outputTexture); // SAVE
    this.gl.useProgram(this.program9.program);
    bindAttribute(this.gl, this.quadBuffer, this.program9.a_pos, 2);

    bindTexture(this.gl, this.inputTex, 0); // HOOKED NATIVE
    this.gl.uniform1i(this.program9.HOOKED, 0);
    bindTexture(this.gl, this.temp1Texture, 1); // MMKERNEL
    this.gl.uniform1i(this.program9.MMKERNEL, 1);
    bindTexture(this.gl, this.temp0Texture, 2); // LUMAN0
    this.gl.uniform1i(this.program9.LUMAN0, 2);
    this.gl.uniform2f(this.program9.HOOKED_pt, 1.0 / this.gl.canvas.width, 1.0 / this.gl.canvas.height);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Draw
    bindFramebuffer(this.gl, null);
    this.gl.useProgram(this.programDraw.program);
    bindAttribute(this.gl, this.quadBuffer, this.programDraw.a_pos, 2);
    bindTexture(this.gl, this.outputTexture, 0); // luman0
    this.gl.uniform1i(this.programDraw.u_texture, 0);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
}

// Parameters.
let globalScaler = null;
let globalMovOrig = null;
let globalBoard = null;
let globalScale = 2.0;
let globalCurrentHref=window.location.href

let globalUpdateId, globalPreviousDelta = 0;
let globalFpsLimit = 30;    // Limit fps to 30 fps. Change here if you want more frames to be rendered. (But usually 30 fps is pretty enough for most anime as they are mostly done on threes.)

function getScreenRefreshRate(callback, runIndefinitely = false){
    let requestId = null;
    let callbackTriggered = false;
    runIndefinitely = runIndefinitely || false;

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
    }
    
    let DOMHighResTimeStampCollection = [];

    let triggerAnimation = function(DOMHighResTimeStamp){
        DOMHighResTimeStampCollection.unshift(DOMHighResTimeStamp);
        
        if (DOMHighResTimeStampCollection.length > 10) {
            let t0 = DOMHighResTimeStampCollection.pop();
            let fps = Math.floor(1000 * 10 / (DOMHighResTimeStamp - t0));

            if(!callbackTriggered){
                callback.call(undefined, fps, DOMHighResTimeStampCollection);
            }

            if(runIndefinitely){
                callbackTriggered = false;
            }else{
                callbackTriggered = true;
            }
        }
    
        requestId = window.requestAnimationFrame(triggerAnimation);
    };
    
    window.requestAnimationFrame(triggerAnimation);

    // Stop after half second if it shouldn't run indefinitely
    if(!runIndefinitely){
        window.setTimeout(function(){
            window.cancelAnimationFrame(requestId);
            requestId = null;
        }, 500);
    }
}

async function injectCanvas() {
    console.log('Injecting canvas...')

    // Create a canvas (since video tag do not support WebGL).
    globalMovOrig = await getVideoTag()

    let div = globalMovOrig.parentElement
    if(window.location.href.toLowerCase().includes("bilibili.com")){
        console.log("Working on bilibili.com.")
        while(div.className!="bilibili-player-video") {
            await new Promise(r => setTimeout(r, 500));
        }
        div = globalMovOrig.parentElement
    }
    div.style.backgroundColor = "black" // Patch for ACFun.

    if (!globalBoard){
        console.log("globalBoard not exists. Creating new one.")

        globalBoard = document.createElement('canvas');
        // Make it visually fill the positioned parent
        globalBoard.style.width = '100%';
        globalBoard.style.height = '100%';
        // ...then set the internal size to match
        globalBoard.width = globalBoard.offsetWidth;
        globalBoard.height = globalBoard.offsetHeight;
        // Add it back to the div where contains the video tag we use as input.
    }
    console.log("Adding new canvas.")
    div.appendChild(globalBoard)

    // Hide original video tag, we don't need it to be displayed.
    globalMovOrig.style.display = 'none'
}

async function getVideoTag() {
    while(document.getElementsByTagName("video").length <= 0) {
        await new Promise(r => setTimeout(r, 500));
    }
    
    globalMovOrig=document.getElementsByTagName("video")[0]
    
    globalMovOrig.addEventListener('loadedmetadata', function () {
        globalScaler = !globalScaler?new Scaler(globalBoard.getContext('webgl')):globalScaler;
        globalScaler.inputVideo(globalMovOrig);
        globalScaler.resize(globalScale);
        globalScaler.scale = globalScale;
    }, true);
    globalMovOrig.addEventListener('error', function () {
        alert("Can't get video, sorry.");
    }, true);

    return globalMovOrig
}

async function doFilter() {
    // Setting our parameters for filtering.
    // scale: multipliers that we need to zoom in.
    // Here's the fun part. We create a pixel shader for our canvas
    console.log('Enabling filter...')

    // Auto detect refresh rate.
    getScreenRefreshRate(function(screenRefreshRate){
        globalFpsLimit = Math.floor((screenRefreshRate+1) / 2);
        globalFpsLimit = globalFpsLimit<30?30:globalFpsLimit;   // If refresh rate is below 30 fps we round it up to 30.
        console.log("Framerate limit is set to " + globalFpsLimit + " FPS.");
    });

    // Do it! Filter it! Profit!
    async function render(currentDelta) {
        // Notice that limiting the framerate here did increase performance.
        globalUpdateId = requestAnimationFrame(render);
        let delta = currentDelta - globalPreviousDelta;

        if (globalFpsLimit && delta < 1000/globalFpsLimit){
            return;
        }

        if (globalScaler) {
            globalScaler.render();
        }

        if (globalCurrentHref!=window.location.href){
            console.log("Page changed!")
            await injectCanvas()
            globalCurrentHref=window.location.href
        }

        globalPreviousDelta = currentDelta
    }

    globalUpdateId = requestAnimationFrame(render);
}

(async function () {
    console.log('Bilibili_Anime4K starting...')
    await injectCanvas()
    doFilter()
})();