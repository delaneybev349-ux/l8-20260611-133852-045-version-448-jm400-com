import { H as Hls } from './hls-vendor-dru42stk.js';

const players = Array.from(document.querySelectorAll('[data-player]'));

function setMessage(shell, text) {
    const message = shell.querySelector('.player-message');
    if (message) {
        message.textContent = text || '';
    }
}

function attachHls(video, source, shell) {
    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            shell.classList.remove('is-loading');
            shell.classList.add('is-playing');
            setMessage(shell, '');
            video.play().catch(() => {
                setMessage(shell, '点击视频画面继续播放');
            });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data && data.fatal) {
                setMessage(shell, '视频加载失败，请稍后再试');
                shell.classList.remove('is-loading');
            }
        });

        shell._hls = hls;
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', () => {
            shell.classList.remove('is-loading');
            shell.classList.add('is-playing');
            setMessage(shell, '');
            video.play().catch(() => {
                setMessage(shell, '点击视频画面继续播放');
            });
        }, { once: true });
        return;
    }

    shell.classList.remove('is-loading');
    setMessage(shell, '当前浏览器不支持在线播放，请更换浏览器');
}

players.forEach((shell) => {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.play-trigger');

    if (!video || !button) {
        return;
    }

    const source = video.dataset.src;

    function start() {
        if (!source) {
            setMessage(shell, '视频地址暂不可用');
            return;
        }

        if (shell.classList.contains('is-playing') || shell.classList.contains('is-loading')) {
            video.play().catch(() => {});
            return;
        }

        shell.classList.add('is-loading');
        setMessage(shell, '正在加载视频');
        attachHls(video, source, shell);
    }

    button.addEventListener('click', start);
    video.addEventListener('click', start);

    video.addEventListener('play', () => {
        shell.classList.add('is-playing');
        setMessage(shell, '');
    });
});
