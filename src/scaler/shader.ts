// Original WebGL implementation by NeuroWhAI.
// 1.0RC2 by net2cn
// https://github.com/bloc97/Anime4K/blob/master/web/main.js

export class Shaders{
    quadVert = `
        precision mediump float;

        attribute vec2 a_pos;
        varying vec2 v_tex_pos;

        void main() {
            v_tex_pos = a_pos;
            gl_Position = vec4(1.0 - 2.0 * a_pos, 0, 1);
        }
        `;

    scaleFrag = `
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

    thinLinesFrag = `
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

    lumaFrag = `
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

    lumaGausXFrag = `
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

    lumaGausYFrag = `
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

    lineDetectFrag = `
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

    lineGausXFrag = `
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

    lineGausYFrag = `
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

    gradFrag = `
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

    refineFrag = `
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

    fxaaFrag = `
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

    drawFrag = `
        precision mediump float;

        uniform sampler2D u_texture;
        varying vec2 v_tex_pos;

        void main() {
            vec4 color = texture2D(u_texture, vec2(v_tex_pos.x, 1.0 - v_tex_pos.y));
            gl_FragColor = color;
        }
        `;
}