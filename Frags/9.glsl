precision mediump float;

uniform sampler2D HOOKED;
uniform sampler2D LUMAN0;
uniform sampler2D MMKERNEL;
uniform sampler2D NATIVE;
uniform vec2 HOOKED_pt;
varying vec2 v_tex_pos;

uniform float LUMAN0_size;
uniform vec2 LUMAN0_pt;
varying vec2 LUMAN0_pos;

uniform vec2 MMKERNEL_pt;
varying vec2 MMKERNEL_pos;

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
	vec2 f = fract(LUMAN0_pos * LUMAN0_size);
	ivec2 i = ivec2(f * vec2(2));
	float c0 = LUMAN0_tex((vec2(0.5) - f) * LUMAN0_pt + LUMAN0_pos)[i.y * 2 + i.x];
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