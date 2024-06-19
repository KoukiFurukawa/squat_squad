import React, { useRef, useEffect } from 'react';
import { Pose, POSE_CONNECTIONS, Results, NormalizedLandmarkList } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors } from '@mediapipe/drawing_utils';

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

// スクワットをカウントするコンポーネント
const Squat: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const angles = useRef<number[]>([]);
    const startTime = useRef<number | null>(null);

    // 姿勢推定前の初期化＆初期設定
    useEffect(() => {
        if (videoRef.current && canvasRef.current) {
            const pose = new Pose({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
            });

            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            pose.onResults(onResults);

            const camera = new Camera(videoRef.current, {
                onFrame: async () => {
                    if (videoRef.current) {
                        await pose.send({ image: videoRef.current });
                    }
                },
                width: window.innerHeight * (16 / 9),
                height: window.innerHeight,
            });
            camera.start();
        }
    }, []);

    // MediapipeのPoseモジュールから結果を取得
    function onResults(results: Results) {
        if (canvasRef.current) {
            const canvasCtx = canvasRef.current.getContext('2d');
            if (canvasCtx) {
                canvasCtx.save();
                canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                canvasCtx.drawImage(
                    results.image,
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height
                );
                if (results.poseLandmarks) {
                    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
                        color: '#FFA500',
                        lineWidth: 2,
                    });
                    drawCustomLandmarks(canvasCtx, results.poseLandmarks);
                    logLandmarkPositions(results.poseLandmarks);
                }
                canvasCtx.restore();
            }
        }
    }

    // ポーズのランドマークの色指定
    function drawCustomLandmarks(ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmarkList) {
        if (!canvasRef.current || !landmarks) return;
        for (let i = 0; i < landmarks.length; i++) {
            const x = landmarks[i].x * canvasRef.current.width;
            const y = landmarks[i].y * canvasRef.current.height;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#FF0000';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFA500';
            ctx.fill();
        }
    }

    // 両肩、両腰、両膝の信頼度の平均を計算し、信頼度が高い方のランドマークの座標を取得しログに出力
    function logLandmarkPositions(landmarks: NormalizedLandmarkList) {
        if (!landmarks) return;

        function calculateAverageConfidence(indices: number[]) {
            let validCount = 0;
            const totalConfidence = indices.reduce((sum, index) => {
                const landmark = landmarks[index];
                if (landmark && landmark.visibility != null) {
                    validCount++;
                    return sum + landmark.visibility;
                }
                return sum;
            }, 0);
            return validCount > 0 ? totalConfidence / validCount : 0;
        }

        const leftIndices = [11, 23, 25];  // 左肩、左腰、左膝のインデックス
        const rightIndices = [12, 24, 26]; // 右肩、右腰、右膝のインデックス

        const leftAverageConfidence = calculateAverageConfidence(leftIndices);
        const rightAverageConfidence = calculateAverageConfidence(rightIndices);

        const isLeftHigher = leftAverageConfidence > rightAverageConfidence;
        const selectedIndices = isLeftHigher ? leftIndices : rightIndices;

        const [shoulderIndex, hipIndex, kneeIndex] = selectedIndices;
        const shoulder = landmarks[shoulderIndex];
        const hip = landmarks[hipIndex];
        const knee = landmarks[kneeIndex];

        if (shoulder && hip && knee) {
            const angle = calculateAngle(
                shoulder.x, shoulder.y, shoulder.z,
                hip.x, hip.y, hip.z,
                knee.x, knee.y, knee.z
            );

            // 角度を配列に追加
            angles.current.push(angle);

            const currentTime = Date.now();
            if (!startTime.current) {
                startTime.current = currentTime;
            }

            // 0.5秒経過したら平均を計算して出力
            if (currentTime - startTime.current >= 500) {
                const averageAngle = Math.round(angles.current.reduce((sum, angle) => sum + angle, 0) / angles.current.length);
                console.log(`Average Hip Angle (last 0.5s): ${averageAngle} degrees`);

                // 配列をクリアし、開始時間をリセット
                angles.current = [];
                startTime.current = currentTime;
            }
        }
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
            <video ref={videoRef} style={{ display: 'none' }}></video>
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: '100%' }}></canvas>
        </div>
    );
};

export default Squat;
