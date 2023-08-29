"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { createFFmpeg, fetchFile } = FFmpeg;
class CustomVideoHandle {
    constructor() {
        this.video = document.createElement('video');
        this.video.crossOrigin = 'anonymous';
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.url_list = [];
        document.body.appendChild(this.canvas);
    }
    loadFfmpeg() {
        // 依赖ffmpeg.wasm WebAssembly
        if (!this.ffmpeg) {
            this.ffmpeg = createFFmpeg({
                corePath: "./libs/ffmpeg/ffmpeg-core.js",
                log: true,
            });
        }
        let promise = this.ffmpeg.isLoaded() ? Promise.resolve() : this.ffmpeg.load();
        return promise;
    }
    convertVideoToFrames(video_path, frame_rate) {
        return __awaiter(this, void 0, void 0, function* () {
            this.video.src = video_path;
            this.video.controls = true;
            this.video.width = 1024;
            return new Promise((resolve, reject) => {
                this.video.addEventListener('loadeddata', () => __awaiter(this, void 0, void 0, function* () {
                    const duration = this.video.duration;
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    let index_list = this.splitAndGetTimes(duration, frame_rate);
                    resolve(this.handleFrames(index_list));
                }));
            });
        });
    }
    handleFrames(index_list) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let frame_time of index_list) {
                this.video.currentTime = frame_time;
                yield this.waitForVideoToPlay();
                this.url_list.push(yield this.captureFrame());
            }
            return this.url_list;
        });
    }
    waitForVideoToPlay() {
        return new Promise(resolve => {
            const checkPlaying = () => {
                if (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                    resolve();
                }
                else {
                    requestAnimationFrame(checkPlaying);
                }
            };
            checkPlaying();
        });
    }
    captureFrame() {
        return __awaiter(this, void 0, void 0, function* () {
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            // 获取图像的像素数据
            const image_data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = image_data.data;
            // 对每个像素进行灰度处理
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const threshold = 128; // 阈值
                const color = avg > threshold ? 255 : 0; // 超过阈值的设为白色，否则设为黑色
                data[i] = color; // 红色通道
                data[i + 1] = color; // 绿色通道
                data[i + 2] = color; // 蓝色通道
            }
            // 将处理后的像素数据放回画布
            this.context.putImageData(image_data, 0, 0);
            // 在交界处绘制红色线条
            for (let y = 0; y < this.canvas.height - 1; y++) {
                for (let x = 0; x < this.canvas.width - 1; x++) {
                    const index = (y * this.canvas.width + x) * 4;
                    // 判断相邻像素的颜色
                    const currentPixelColor = (data[index] + data[index + 1] + data[index + 2]) / 3;
                    const nextPixelColor = (data[index + 4] + data[index + 5] + data[index + 6]) / 3;
                    // 如果相邻像素颜色不同，绘制红色线条
                    if (currentPixelColor !== nextPixelColor) {
                        data[index] = 255;
                        data[index + 1] = 0;
                        data[index + 2] = 0;
                    }
                    else {
                        data[index] = 255;
                        data[index + 1] = 255;
                        data[index + 2] = 255;
                    }
                }
            }
            this.context.putImageData(image_data, 0, 0);
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] === 255 && data[i + 1] === 0) {
                    data[i] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                }
            }
            this.context.putImageData(image_data, 0, 0);
            const blob = yield new Promise(resolve => {
                this.canvas.toBlob(blob => resolve(blob), 'image/png');
            });
            if (blob) {
                const blob_url = URL.createObjectURL(blob);
                return Promise.resolve(blob_url);
            }
            return Promise.reject(new Error('截取失败'));
        });
    }
    splitAndGetTimes(duration, frame_rate) {
        const times = [];
        const interval = 1 / frame_rate;
        for (let i = 0; i < duration; i += interval) {
            times.push(i);
        }
        return times;
    }
    convertImagesToVideo(image_paths = this.url_list, fps = 8, image_type = 'png') {
        let promise_list = image_paths.map(i => fetchFile(i));
        return this.loadFfmpeg()
            .then(() => {
            return Promise.all(promise_list);
        })
            .then((res) => {
            res.forEach((i, index) => {
                this.ffmpeg.FS('writeFile', `frame-${index}.${image_type}`, i);
            });
            return Promise.resolve();
        })
            .then(() => {
            const command = [
                '-r', `${fps}`,
                '-f', 'image2',
                '-i', `frame-%d.${image_type}`,
                '-c:v', 'libx264',
                'output_video.mp4'
            ];
            return this.ffmpeg.run(...command);
        })
            .then(() => {
            return this.ffmpeg.FS('readFile', 'output_video.mp4');
        })
            .then((mp4_data) => {
            let mp4_url = URL.createObjectURL(new Blob([mp4_data.buffer], { type: 'video/mp4' }));
            image_paths.forEach((_, index) => {
                this.ffmpeg.FS('unlink', `frame-${index}.${image_type}`);
            });
            this.ffmpeg.FS('unlink', 'output_video.mp4');
            return mp4_url;
        })
            .catch((err) => {
            throw err;
        });
    }
    getVideoVoice(video_url) {
        return this.loadFfmpeg()
            .then(() => {
            return fetchFile(video_url);
        })
            .then((res) => {
            this.ffmpeg.FS('writeFile', 'input.mp4', res);
            return this.ffmpeg.run('-i', 'input.mp4', '-acodec', 'libmp3lame', '-f', 'mp3', 'output_audio.mp3');
        })
            .then(() => {
            return this.ffmpeg.FS('readFile', 'output_audio.mp3');
        })
            .then((res) => {
            let mp3_url = URL.createObjectURL(new Blob([res.buffer], { type: 'audio/mp3' }));
            this.ffmpeg.FS('unlink', 'input.mp4');
            this.ffmpeg.FS('unlink', 'output_audio.mp3');
            return mp3_url;
        })
            .catch((err) => {
            console.log(err);
            throw err;
        });
    }
    addVideoVoice(video_url, voice_url) {
        return this.loadFfmpeg()
            .then(() => {
            return Promise.all([fetchFile(video_url), fetchFile(voice_url)]);
        })
            .then((res) => {
            let [video_data, voice_data] = res;
            return Promise.all([this.ffmpeg.FS('writeFile', 'input.mp4', video_data), this.ffmpeg.FS('writeFile', 'input.mp3', voice_data)]);
        })
            .then(() => {
            return this.ffmpeg.run('-i', 'input.mp4', '-i', 'input.mp3', '-c:v', 'copy', '-c:a', 'aac', '-strict', 'experimental', '-map', '0:v:0', '-map', '1:a:0', 'output.mp4');
        })
            .then(() => {
            return this.ffmpeg.FS('readFile', 'output.mp4');
        })
            .then((mp4_data) => {
            let mp4_url = URL.createObjectURL(new Blob([mp4_data.buffer], { type: 'video/mp4' }));
            this.ffmpeg.FS('unlink', 'input.mp4');
            this.ffmpeg.FS('unlink', 'input.mp3');
            this.ffmpeg.FS('unlink', 'output.mp4');
            return mp4_url;
        })
            .catch((err) => {
            throw err;
        });
    }
}
