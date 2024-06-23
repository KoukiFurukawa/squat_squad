import React, { useRef, useEffect, useState } from 'react';
import { Pose, POSE_CONNECTIONS, Results, NormalizedLandmarkList } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors } from '@mediapipe/drawing_utils';
import Up from "./squat_image/Up.png";
import Down from "./squat_image/Down.png";
import Start from './squat_image/Start.png';
import Finished from './squat_image/Finished.png';

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
    const squatCount = useRef<number>(0);
    const isSquatting = useRef<boolean>(false);
    const upImageRef = useRef<HTMLImageElement>(new Image());
    const downImageRef = useRef<HTMLImageElement>(new Image());

    const [countdown, setCountdown] = useState<number>(5);
    const [countdownFinished, setCountdownFinished] = useState<boolean>(false);

    // 計測開始前のカウントダウンロジック
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1) {
                    setCountdownFinished(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // 姿勢推定前の初期化＆初期設定
    useEffect(() => {
        upImageRef.current.src = Up;
        downImageRef.current.src = Down;

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
    }, [countdownFinished]);

    // MediapipeのPoseモジュールから結果を取得
    function onResults(results: Results) {
        if (canvasRef.current) {
            const canvasCtx = canvasRef.current.getContext('2d');
            if (canvasCtx) {
                canvasCtx.save();
                canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                // 水平反転を設定
                canvasCtx.scale(-1, 1);
                canvasCtx.translate(-canvasRef.current.width, 0);

                // 画像を描画
                canvasCtx.drawImage(
                    results.image,
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height
                );

                // カウントダウンが終わった後にスクワット回数およびUp/Downを表示
                if (countdownFinished) {
                    // 反転を解除してカウントを描画
                    canvasCtx.setTransform(1, 0, 0, 1, 0, 0);
                    drawSquatCount(canvasCtx, squatCount.current);

                    // スクワット状態に応じた画像を表示
                    if (isSquatting.current === true) {
                        canvasCtx.drawImage(upImageRef.current, 200, 75, 85, 78);
                    } else {
                        canvasCtx.drawImage(downImageRef.current, 180, 100, 100, 50);
                    }

                    // 再び水平反転を設定
                    canvasCtx.scale(-1, 1);
                    canvasCtx.translate(-canvasRef.current.width, 0);

                    // ポーズのランドマークを描画
                    if (results.poseLandmarks) {
                        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
                            color: '#FFA500',
                            lineWidth: 2,
                        });
                        drawCustomLandmarks(canvasCtx, results.poseLandmarks);
                        logLandmarkPositions(results.poseLandmarks, canvasCtx);
                    }
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

    // 両肩・両腰・両膝の信頼度の平均を計算して信頼度が高い方のランドマークの座標を取得＆表示
    function logLandmarkPositions(landmarks: NormalizedLandmarkList, ctx: CanvasRenderingContext2D) {
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

            // 0.5秒経過したら平均を算出＆判定
            if (currentTime - startTime.current >= 300) {
                const averageAngle = Math.round(angles.current.reduce((sum, angle) => sum + angle, 0) / angles.current.length);
                console.log(`Average Hip Angle (last 0.3s): ${averageAngle} degrees`);

                // スクワットの判定＆回数カウント
                if (averageAngle < 100 && !isSquatting.current) {
                    isSquatting.current = true;
                } else if (averageAngle > 150 && isSquatting.current) {
                    isSquatting.current = false;
                    squatCount.current += 1;
                }

                // 配列をクリア＆開始時間をリセット
                angles.current = [];
                startTime.current = currentTime;
            }
        }
    }

    // スクワット回数をキャンバスに描画
    function drawSquatCount(ctx: CanvasRenderingContext2D, count: number) {
        ctx.font = '25px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`回数`, 35, 100);

        // 桁数に応じたx座標を設定
        let xPosition = 42;
        if (count.toString().length === 2) {
            xPosition = 27;
        } else if (count.toString().length === 3) {
            xPosition = 15;
        }

        ctx.font = '50px sans-serif';
        ctx.fillText(`${count}`, xPosition, 145);
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
            <video ref={videoRef} style={{ display: 'none' }}></video>
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: '100%' }}></canvas>
            {!countdownFinished && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '900px', color: '#FFFFFF' }}>
                    {countdown}
                </div>
            )}
        </div>
    );
};

export default Squat;
