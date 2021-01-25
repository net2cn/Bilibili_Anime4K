uniform sampler2D HOOKED;
uniform sampler2D MMKERNEL;
uniform sampler2D NATIVE;
uniform vec2 HOOKED_pt;
varying vec2 HOOKED_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(HOOKED, pos);
}
vec4 MMKERNEL_tex(vec2 pos) {
    return texture2D(MMKERNEL, pos);
}
vec4 NATIVE_tex(vec2 pos) {
    return texture2D(NATIVE, pos);
}

//!DESC Anime4K-v3.1-Upscale(x2)+Deblur-CNN(M)-Kernel(Y)
//!HOOK NATIVE
//!BIND HOOKED
//!WHEN OUTPUT.w NATIVE.w / 1.200 > OUTPUT.h NATIVE.h / 1.200 > *
//!BIND MMKERNEL
//!SAVE MMKERNEL
//!COMPONENTS 2



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
    gl_FragColor = vec4(minmax3(HOOKED_pos, vec2(0, HOOKED_pt.y)), 0, 0);
}

