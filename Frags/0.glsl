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

//!DESC Anime4K-v3.1-Upscale(x2)+Deblur-CNN(M)-Conv-4x3x3x1
//!HOOK NATIVE
//!BIND HOOKED
//!WHEN OUTPUT.w NATIVE.w / 1.200 > OUTPUT.h NATIVE.h / 1.200 > *
//!SAVE LUMAN0
//!COMPONENTS 4

void main() {
	vec2 dp = HOOKED_pt;
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


