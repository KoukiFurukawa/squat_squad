import React, { useRef, useEffect, useState } from 'react';
import { Pose, POSE_CONNECTIONS, Results, NormalizedLandmarkList } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors } from '@mediapipe/drawing_utils';
import calculateAngle from './CalculateAngle';
import Up from "./squat_image/Up.png";
import Down from "./squat_image/Down.png";
import Start from './squat_image/Start.png';
import Finished from './squat_image/Finished.png';

// スクワットをカウントするコンポーネント
const Squat: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const angles = useRef<number[]>([]);
    const startTime = useRef<number | null>(null);
    const isSquatting = useRef<boolean>(false);
    const [squatCount, setSquatCount] = useState<number>(0);
    const [isUp, setIsUp] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(5);
    const [countdownFinished, setCountdownFinished] = useState<boolean>(false);
    const [exerciseCountdown, setExerciseCountdown] = useState<number>(30);
    const [exerciseFinished, setExerciseFinished] = useState<boolean>(false);
    const [showStartImage, setShowStartImage] = useState<boolean>(false);
    const [showFinishedImage, setShowFinishedImage] = useState<boolean>(false);

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

    // カウントダウン終了時のStart.pngの表示ロジック
    useEffect(() => {
        if (countdown === 0) {
            setShowStartImage(true);
            const startTimer = setTimeout(() => {
                setShowStartImage(false);
            }, 1000); // 1秒後にStart.pngを非表示にする

            return () => clearTimeout(startTimer);
        }
    }, [countdown]);

    // スクワット計測開始後の30秒間のカウントダウンロジック
    useEffect(() => {
        if (countdownFinished) {
            const exerciseTimer = setInterval(() => {
                setExerciseCountdown((prev) => {
                    if (prev === 1) {
                        setExerciseFinished(true);
                        clearInterval(exerciseTimer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(exerciseTimer);
        }
    }, [countdownFinished]);

    // カウントダウン終了時の処理
    useEffect(() => {
        if (exerciseFinished) {
            setShowFinishedImage(true);
            const finishTimer = setTimeout(() => {
                setShowFinishedImage(false);
            }, 5000); // 5秒後にFinished.pngを非表示にする

            return () => clearTimeout(finishTimer);
        }
    }, [exerciseFinished]);

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
    }, [countdownFinished]);

    // MediapipeのPoseモジュールから結果を取得
    const onResults = (results: Results) => {
        if (canvasRef.current && !exerciseFinished) {
            const canvasCtx = canvasRef.current.getContext('2d');
            if (canvasCtx) {
                canvasCtx.save();
                canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                canvasCtx.scale(-1, 1);
                canvasCtx.translate(-canvasRef.current.width, 0);
                canvasCtx.drawImage(
                    results.image,
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height
                );

                if (countdownFinished && !exerciseFinished) {
                    canvasCtx.setTransform(1, 0, 0, 1, 0, 0);
                    if (isSquatting.current) {
                        setIsUp(true);
                    } else {
                        setIsUp(false);
                    }

                    if (results.poseLandmarks) {
                        drawConnectors(canvasCtx, flipLandmarks(results.poseLandmarks), POSE_CONNECTIONS, {
                            color: '#FFA500',
                            lineWidth: 2,
                        });
                        drawCustomLandmarks(canvasCtx, flipLandmarks(results.poseLandmarks));
                        logLandmarkPositions(flipLandmarks(results.poseLandmarks), canvasCtx);
                    }
                }
                canvasCtx.restore();
            }
        }
    };

    // ポーズのランドマークを水平反転させる関数
    const flipLandmarks = (landmarks: NormalizedLandmarkList) => {
        if (!canvasRef.current) return landmarks;
        return landmarks.map(landmark => ({
            ...landmark,
            x: 1 - landmark.x
        }));
    };

    // ポーズのランドマークの色指定
    const drawCustomLandmarks = (ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmarkList) => {
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
    };

    // 両肩・両腰・両膝の信頼度の平均を計算して信頼度が高い方のランドマークの座標を取得＆表示
    const logLandmarkPositions = (landmarks: NormalizedLandmarkList, ctx: CanvasRenderingContext2D) => {
        if (!landmarks) return;

        const calculateAverageConfidence = (indices: number[]) => {
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
        };

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

            angles.current.push(angle);

            const currentTime = Date.now();
            if (!startTime.current) {
                startTime.current = currentTime;
            }

            // 0.3秒経過したら平均を算出＆判定
            if (currentTime - startTime.current >= 300) {
                const averageAngle = Math.round(angles.current.reduce((sum, angle) => sum + angle, 0) / angles.current.length);

                // スクワットの判定＆回数カウント
                if (averageAngle < 100 && !isSquatting.current) {
                    isSquatting.current = true;
                } else if (averageAngle > 150 && isSquatting.current) {
                    isSquatting.current = false;
                    setSquatCount(prevCount => prevCount + 1);
                }

                // 配列をクリア＆開始時間をリセット
                angles.current = [];
                startTime.current = currentTime;
            }
        }
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
            {showStartImage && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <img src={Start} alt="Start" style={{ width: '100%', height: 'auto' }} />
                </div>
            )}
            {!showStartImage && countdownFinished && !exerciseFinished && (
                <div style={{ position: 'absolute', top: '15%', left: '85%', transform: 'translate(-50%, -50%)', fontSize: '350px', color: '#FFFFFF' }}>
                    {`${exerciseCountdown}s`}
                </div>
            )}
            {!showStartImage && countdownFinished && !exerciseFinished && (
                <>
                    <div style={{ position: 'absolute', top: '53%', left: '8%', fontSize: '130px', color: '#FFFFFF' }}>
                        回数
                    </div>
                    <div style={{ position: 'absolute', top: '58%', left: squatCount < 10 ? '10%' : squatCount < 100 ? '5%' : '0%', fontSize: '350px', color: '#FFFFFF' }}>
                        {squatCount}
                    </div>
                </>
            )}
            {!showStartImage && countdownFinished && !exerciseFinished && (
                <div style={{ position: 'absolute', top: isUp ? '55%' : '72%', left: isUp ? '70%' : '60%' }}>
                    {isUp ?
                        <img src={Up} alt="Up" style={{ width: '85%', height: 'auto' }} /> :
                        <img src={Down} alt="Down" style={{ width: '100%', height: 'auto' }} />}
                </div>
            )}
            {showFinishedImage && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <img src={Finished} alt="Finished" style={{ width: '100%', height: 'auto' }} />
                </div>
            )}
        </div>
    );
};

export default Squat;
