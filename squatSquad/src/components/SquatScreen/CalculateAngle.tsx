// 角度計算関数
const calculateAngle = (
    Ax: number, Ay: number, Az: number,
    Bx: number, By: number, Bz: number,
    Cx: number, Cy: number, Cz: number
): number => {
    const vA: [number, number, number] = [Ax - Bx, Ay - By, Az - Bz];
    const vB: [number, number, number] = [Cx - Bx, Cy - By, Cz - Bz];

    const sizeA: number = Math.sqrt(vA.reduce((sum, v) => sum + v ** 2, 0));
    const sizeB: number = Math.sqrt(vB.reduce((sum, v) => sum + v ** 2, 0));

    const inner: number = vA.reduce((sum, v, i) => sum + v * vB[i], 0);
    const cosTheta: number = inner / (sizeA * sizeB);
    const theta: number = Math.acos(cosTheta) * (180 / Math.PI);

    return Math.round(theta);
};

export default calculateAngle;