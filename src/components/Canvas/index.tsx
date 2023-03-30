import { useEffect, useRef } from 'react';
import './index.scss';

interface ICanvasProps {
  onInit: (gl: WebGLRenderingContext, program: WebGLProgram) => any;
  fragmentShader: string;
  vertexShader: string;
}
const Canvas = ({ vertexShader, fragmentShader, onInit }: ICanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const rect = containerRef.current!.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const gl = canvas.getContext('webgl')!;
    const program = createProgram(gl, vertexShader, fragmentShader);
    containerRef.current!.appendChild(canvas);
    if (program) {
      onInit(gl, program);
    }
    return () => {
      canvas.parentNode?.removeChild(canvas);
    };
    // eslint-disable-next-line
  }, []);
  return <div ref={containerRef} className="webgl-canvas"></div>;
};

function createProgram(
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  let compileStatus: boolean;
  compileStatus = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if (!compileStatus) {
    console.log(gl.getShaderInfoLog(vertexShader));
    return null;
  }
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  compileStatus = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (!compileStatus) {
    console.log(gl.getShaderInfoLog(fragmentShader));
    return null;
  }

  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return program;
}

export default Canvas;
