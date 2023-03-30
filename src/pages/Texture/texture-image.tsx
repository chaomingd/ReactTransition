import Canvas from '../../components/Canvas';

const TextImagePage = () => {
  const vertexShader = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform vec2 u_resolution;
    void main() {
      vec2 zeroToOne = a_position / u_resolution;
      vec2 zeroToTow = zeroToOne * 2.0;
      vec2 clipSpace = zeroToTow - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;
  const fragmentShader = `
    precision mediump float;
    uniform sampler2D u_image;
    uniform vec2 u_imageSize;
    varying vec2 v_texCoord;
    void main() {
      vec2 onePixel = vec2(1.0, 1.0) / u_imageSize;
      gl_FragColor = (
        texture2D(u_image, v_texCoord) +
        texture2D(u_image, v_texCoord + vec2(onePixel.x, 0.0)) +
        texture2D(u_image, v_texCoord + vec2(-onePixel.x, 0.0))
      ) / 3.0;
      // gl_FragColor = texture2D(u_image, v_texCoord);
    }
  `;
  return (
    <Canvas
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      onInit={(gl, program) => {
        gl.useProgram(program);
        const img = new Image();
        img.src = require('./leaves.jpg');
        img.onload = () => {
          console.log(img.width, img.height);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.width = Math.pow(2, Math.floor(Math.log2(img.width)));
          canvas.height = Math.pow(2, Math.floor(Math.log2(img.height)));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const positions = [
            0,
            0,
            img.width,
            0,
            0,
            img.height,
            img.width,
            img.height,
          ];
          const positionBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW
          );

          const indices = [0, 1, 2, 1, 3, 2];

          const indicesBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
          gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint8Array(indices),
            gl.STATIC_DRAW
          );

          const uvs = [0, 0, 2, 0, 0, 2, 2, 2];

          const uvBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

          const positionLocation = gl.getAttribLocation(program, 'a_position');
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(positionLocation);

          const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
          gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
          gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(texCoordLocation);

          const originalImageTexture = createTexture(gl);
          gl.activeTexture(gl.TEXTURE0);

          // 绑定图像
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            canvas
          );

          const uImageLocation = gl.getUniformLocation(program, 'u_image');
          gl.uniform1i(uImageLocation, 0);

          const textures: WebGLTexture[] = [];
          const frameBuffers: WebGLFramebuffer[] = [];
          for (let i = 0; i < 2; i++) {
            const texture = createTexture(gl);
            textures.push(texture);
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGBA,
              img.width,
              img.height,
              0,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              null
            );

            const foo = gl.createFramebuffer()!;
            frameBuffers.push(foo);
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers);
            gl.framebufferTexture2D(
              gl.FRAMEBUFFER,
              gl.COLOR_ATTACHMENT0,
              gl.TEXTURE_2D,
              texture,
              0
            );
          }

          // 定义一些卷积核
          var kernels = {
            normal: [0, 0, 0, 0, 1, 0, 0, 0, 0],
            gaussianBlur: [
              0.045, 0.122, 0.045, 0.122, 0.332, 0.122, 0.045, 0.122, 0.045,
            ],
            unsharpen: [-1, -1, -1, -1, 9, -1, -1, -1, -1],
            emboss: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
          };

          // 将要使用的效果列表
          var effectsToApply = [
            'gaussianBlur',
            'emboss',
            'gaussianBlur',
            'unsharpen',
          ];

          // u_resolution
          const uResolutionLocation = gl.getUniformLocation(
            program,
            'u_resolution'
          );
          gl.uniform2fv(uResolutionLocation, [
            window.innerWidth,
            window.innerHeight,
          ]);

          // u_imageSize;
          const uImageSizeLocation = gl.getUniformLocation(
            program,
            'u_imageSize'
          );
          gl.uniform2f(uImageSizeLocation, img.width, img.height);

          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
        };
      }}
    />
  );
};

function createTexture(gl: WebGLRenderingContext) {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 设置纹理参数
  // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  return texture;
}

function useFramBuffer(gl: WebGLRenderingContext, frameBuffer: WebGLFramebuffer) {
  
}

export default TextImagePage;
