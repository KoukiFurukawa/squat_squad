import React, { useRef, useEffect } from 'react';
import { Pose, POSE_CONNECTIONS, Results, NormalizedLandmarkList } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors } from '@mediapipe/drawing_utils';

const Squat: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
                }
                canvasCtx.restore();
            }
        }
    }

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

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
            <video ref={videoRef} style={{ display: 'none' }}></video>
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: '100%' }}></canvas>
        </div>
    );
};

export default Squat;
