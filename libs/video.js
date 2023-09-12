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
                corePath: "/libs/ffmpeg/ffmpeg-core.js",
                log: window.is_dev,
            });
        }
        let promise = this.ffmpeg.isLoaded() ? Promise.resolve() : this.ffmpeg.load();
        return promise;
    }
    convertVideoToFrames({ video_url = '', frame_rate = 8, blob_url = true } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            this.video.src = video_url;
            this.video.controls = true;
            this.video.width = 1024;
            return new Promise((resolve, reject) => {
                this.video.addEventListener('loadeddata', () => __awaiter(this, void 0, void 0, function* () {
                    const duration = this.video.duration;
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    let index_list = this.splitAndGetTimes(duration, frame_rate);
                    resolve(this.handleFrames(index_list, blob_url));
                }));
            });
        });
    }
    handleFrames(index_list, blob_url = true) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let frame_time of index_list) {
                this.video.currentTime = frame_time;
                yield this.waitForVideoToPlay();
                this.url_list.push(yield this.captureFrame(blob_url));
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
    captureFrame(blob_url = true) {
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
                return Promise.resolve(blob_url ? URL.createObjectURL(blob) : blob);
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
    convertImagesToVideo({ image_paths = this.url_list, fps = 8, image_type = 'png', blob_url = true } = {}) {
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
            image_paths.forEach((_, index) => {
                this.ffmpeg.FS('unlink', `frame-${index}.${image_type}`);
            });
            this.ffmpeg.FS('unlink', 'output_video.mp4');
            let blob = new Blob([mp4_data.buffer], { type: 'video/mp4' });
            return blob_url ? URL.createObjectURL(blob) : blob;
        })
            .catch((err) => {
            throw err;
        });
    }
    getVideoVoice({ video_url = '', blob_url = true } = {}) {
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
            this.ffmpeg.FS('unlink', 'input.mp4');
            this.ffmpeg.FS('unlink', 'output_audio.mp3');
            let blob = new Blob([res.buffer], { type: 'audio/mp3' });
            return blob_url ? URL.createObjectURL(blob) : blob;
        })
            .catch((err) => {
            console.log(err);
            throw err;
        });
    }
    addVideoVoice({ video_url = '', voice_url = '', blob_url = true }) {
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
            this.ffmpeg.FS('unlink', 'input.mp4');
            this.ffmpeg.FS('unlink', 'input.mp3');
            this.ffmpeg.FS('unlink', 'output.mp4');
            let blob = new Blob([mp4_data.buffer], { type: 'video/mp4' });
            return blob_url ? URL.createObjectURL(blob) : blob;
        })
            .catch((err) => {
            throw err;
        });
    }
    reverseVideoAndAudio({ video_url = '', blob_url = true }) {
        console.log('反转视频');
        return this.loadFfmpeg()
            .then(() => {
            return fetchFile(video_url);
        })
            .then((video_data) => {
            return this.ffmpeg.FS('writeFile', 'input.mp4', video_data);
        })
            .then(() => {
            const command = [
                '-i', 'input.mp4',
                '-vf', 'reverse',
                '-af', 'areverse',
                'output.mp4'
            ];
            return this.ffmpeg.run(...command);
        })
            .then(() => {
            return this.ffmpeg.FS('readFile', 'output.mp4');
        })
            .then((mp4_data) => {
            this.ffmpeg.FS('unlink', 'input.mp4');
            this.ffmpeg.FS('unlink', 'output.mp4');
            let blob = new Blob([mp4_data.buffer], { type: 'video/mp4' });
            return blob_url ? URL.createObjectURL(blob) : blob;
        })
            .catch((err) => {
            throw err;
        });
    }
    composeAudioAndImages({ voice_urls = [], image_urls = [], image_type = 'png', blob_url = true }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (voice_urls.length !== image_urls.length) {
                throw new Error('The number of audio files must match the number of image files.');
            }
            let index = 0;
            let video_list = [];
            for (let voice_url of voice_urls) {
                video_list.push(yield this.voiceAddImage({ voice_url, image_url: image_urls[index], image_type }));
                index++;
            }
            try {
                const video_data_list = yield Promise.all(video_list.map((i) => fetchFile(i)));
                const write_promises = video_data_list.map((data, index) => {
                    return this.ffmpeg.FS('writeFile', `input_${index}.mp4`, data);
                });
                yield Promise.all(write_promises);
                const input_args = video_list.map((_, index) => ['-i', `input_${index}.mp4`]).flat();
                const command = [
                    ...input_args,
                    '-filter_complex', `concat=n=${video_list.length}:v=1:a=1 [v] [a]`,
                    '-map', '[v]',
                    '-map', '[a]',
                    '-c:v', 'libx264',
                    '-c:a', 'aac',
                    'output.mp4',
                ];
                yield this.ffmpeg.run(...command);
                const mp4_data = yield this.ffmpeg.FS('readFile', 'output.mp4');
                video_data_list.forEach((_, index) => {
                    this.ffmpeg.FS('unlink', `input_${index}.mp4`);
                });
                this.ffmpeg.FS('unlink', 'output.mp4');
                const blob = new Blob([mp4_data.buffer], { type: 'video/mp4' });
                return blob_url ? URL.createObjectURL(blob) : blob;
            }
            catch (err) {
                throw err;
            }
        });
    }
    voiceAddImage({ voice_url = '', image_url = '', image_type = 'png', blob_url = true }) {
        return this.loadFfmpeg()
            .then(() => {
            return Promise.all([fetchFile(voice_url), fetchFile(image_url)]);
        })
            .then((res) => {
            let [image_data, voice_data] = res;
            return Promise.all([this.ffmpeg.FS('writeFile', `image.${image_type}`, image_data), this.ffmpeg.FS('writeFile', 'input.mp3', voice_data)]);
        })
            .then((res) => {
            const command = [
                '-i', `image.${image_type}`,
                '-i', 'input.mp3',
                '-c:v', 'libx264',
                '-tune', 'stillimage',
                '-c:a', 'aac',
                '-strict', 'experimental',
                '-pix_fmt', 'yuv420p',
                '-q:v', '1',
                'output.mp4',
            ];
            return this.ffmpeg.run(...command);
        })
            .then(() => {
            return this.ffmpeg.FS('readFile', 'output.mp4');
        })
            .then((mp4_data) => {
            this.ffmpeg.FS('unlink', `image.${image_type}`);
            this.ffmpeg.FS('unlink', 'input.mp3');
            this.ffmpeg.FS('unlink', 'output.mp4');
            let blob = new Blob([mp4_data.buffer], { type: 'video/mp4' });
            return blob_url ? URL.createObjectURL(blob) : blob;
        })
            .catch((err) => {
            throw err;
        });
    }
}
