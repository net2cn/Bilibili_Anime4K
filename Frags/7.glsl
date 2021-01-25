uniform sampler2D HOOKED;
uniform sampler2D NATIVE;
uniform vec2 HOOKED_pt;
varying vec2 HOOKED_pos;

vec4 HOOKED_tex(vec2 pos) {
    return texture2D(HOOKED, pos);
}
vec4 NATIVE_tex(vec2 pos) {
    return texture2D(NATIVE, pos);
}

//!DESC Anime4K-v3.1-Upscale(x2)+Deblur-CNN(M)-Kernel(X)
//!HOOK NATIVE
//!BIND HOOKED
//!WHEN OUTPUT.w NATIVE.w / 1.200 > OUTPUT.h NATIVE.h / 1.200 > *
//!SAVE MMKERNEL
//!COMPONENTS 2



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
    gl_FragColor = vec4(minmax3(HOOKED_pos, vec2(HOOKED_pt.x, 0)), 0, 0);
}

