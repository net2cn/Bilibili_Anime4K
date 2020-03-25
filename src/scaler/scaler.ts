import {Shaders} from "./shader"

function createShader(gl: WebGLRenderingContext, type: any, source: string) {
    let shader = gl.createShader(type);

    if (shader){
        gl.shaderSource(shader, source);

        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader)!);
        }
    
        return shader;
    }
    else{
        throw new Error("An error has occurred when creating WebGL shader.")
    }
}

function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
    let program = gl.createProgram();

    //console.log(fragmentSource)

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    if(program && vertexShader && fragmentShader) {
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
    
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program)!);
        }
    
        var wrapper:any = { program: program }
    
        var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (var i = 0; i < numAttributes; i++) {
            var attribute = gl.getActiveAttrib(program, i);
            wrapper[attribute!.name] = gl.getAttribLocation(program, attribute!.name);
        }
        var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (var i$1 = 0; i$1 < numUniforms; i$1++) {
            var uniform = gl.getActiveUniform(program, i$1);
            wrapper[uniform!.name] = gl.getUniformLocation(program, uniform!.name);
        }
    
        return wrapper;
    }
    else{
        throw new Error("An error has occurred when creating WebGL program.")
    }
}

function createTexture(gl: WebGLRenderingContext, filter: any, data: any, width: any, height: any) {
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

function bindTexture(gl: WebGLRenderingContext, texture: any, unit: any) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
}

function updateTexture(gl: WebGLRenderingContext, texture: any, src: any) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
}

function createBuffer(gl: WebGLRenderingContext, data: any) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
}

function bindAttribute(gl: WebGLRenderingContext, buffer: any, attribute: any, numComponents: any) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, numComponents, gl.FLOAT, false, 0, 0);
}

function bindFramebuffer(gl: WebGLRenderingContext, framebuffer: any, texture: any) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    if (texture) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }
}

export class Scaler {
    shader: any
    gl: WebGLRenderingContext
    inputTex!: WebGLTexture
    inputMov!: HTMLVideoElement;
    inputWidth: any
    inputHeight: any

    quadBuffer: any
    framebuffer: any

    scaleProgram: any
    thinLinesProgram: any
    lumaProgram: any
    lumaGausXProgram: any
    lumaGausYProgram: any
    lineDetectProgram: any
    lineGausXProgram: any
    lineGausYProgram: any
    gradProgram: any
    refineProgram: any
    fxaaProgram: any
    drawProgram: any

    scaleTexture: any
    scaleTexture2: any

    postKernelTexture: any
    postKernelTexture2: any

    scale = 1.0;

    constructor(gl: WebGLRenderingContext){
        this.shader = new Shaders();
        this.gl = gl;
        console.log('Compiling shaders...')

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

    input(mov: HTMLVideoElement) {
        const width = mov.videoWidth;
        const height = mov.videoHeight;
    
        this.inputWidth = width;
        this.inputHeight = height;
    
        let emptyPixels = new Uint8Array(width * height * 4);
        this.inputTex = createTexture(this.gl, this.gl.LINEAR, emptyPixels, width, height)!;
        this.inputMov = mov;
    }

    resize(scale: number) {
        const width = Math.round(this.inputWidth * scale);
        const height = Math.round(this.inputHeight * scale);
    
        this.gl.canvas.width = width;
        this.gl.canvas.height = height;
    
        let emptyPixels = new Uint8Array(width * height * 4);
        this.scaleTexture = createTexture(this.gl, this.gl.LINEAR, emptyPixels, width, height);
        this.scaleTexture2 = createTexture(this.gl, this.gl.LINEAR, emptyPixels, width, height);
        this.postKernelTexture = createTexture(this.gl, this.gl.LINEAR, emptyPixels, width, height);
        this.postKernelTexture2 = createTexture(this.gl, this.gl.LINEAR, emptyPixels, width, height);
    }

    render () {
        if (!this.inputTex) {
            return;
        }
    
        let scalePgm = this.scaleProgram;
        let thinLinesPgm = this.thinLinesProgram;
        let lumaPgm = this.lumaProgram;
        let lumaGausXPgm = this.lumaGausXProgram;
        let lumaGausYPgm = this.lumaGausYProgram;
        let lineDetectPgm = this.lineDetectProgram;
        let lineGausXPgm = this.lineGausXProgram;
        let lineGausYPgm = this.lineGausYProgram;
        let gradPgm = this.gradProgram;
        let refinePgm = this.refineProgram;
        let fxaaPgm = this.fxaaProgram;
        let drawPgm = this.drawProgram;
    
        // Nasty trick to fix video quailty changing bug.
        if (this.gl.getError() == this.gl.INVALID_VALUE) {
            console.log('glError detected! Fetching new viedo tag... (This may happen due to resolution change)')
            let newMov = document.getElementsByTagName("video")[0]
            this.input(newMov)
        }
    
        if (this.inputMov) {
            updateTexture(this.gl, this.inputTex, this.inputMov);
        }
    
        // Automatic change scale according to original video resolution.
        if(this.inputMov.videoHeight > 0){
            let newScale = 1440 / this.inputMov.videoHeight;
            if (this.scale != newScale){
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
    }

}
