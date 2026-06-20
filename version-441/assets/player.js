(function () {
    var libraryUrl = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
    var libraryLoading = false;
    var libraryCallbacks = [];

    function whenReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function loadLibrary(callback) {
        if (window.Hls) {
            callback(window.Hls);
            return;
        }
        libraryCallbacks.push(callback);
        if (libraryLoading) {
            return;
        }
        libraryLoading = true;
        var script = document.createElement("script");
        script.src = libraryUrl;
        script.async = true;
        script.onload = function () {
            var callbacks = libraryCallbacks.slice();
            libraryCallbacks = [];
            callbacks.forEach(function (item) {
                item(window.Hls);
            });
        };
        document.head.appendChild(script);
    }

    function setupPlayer(shell) {
        var source = shell.getAttribute("data-source");
        var video = shell.querySelector("video");
        var overlay = shell.querySelector(".player-overlay");
        var button = shell.querySelector(".player-start");
        if (!source || !video) {
            return;
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function play() {
            hideOverlay();
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (video.getAttribute("src") !== source) {
                    video.setAttribute("src", source);
                }
                video.play().catch(function () {});
                return;
            }
            loadLibrary(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    if (!video.hlsInstance) {
                        video.hlsInstance = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        video.hlsInstance.loadSource(source);
                        video.hlsInstance.attachMedia(video);
                    }
                    video.play().catch(function () {});
                } else {
                    if (video.getAttribute("src") !== source) {
                        video.setAttribute("src", source);
                    }
                    video.play().catch(function () {});
                }
            });
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    }

    whenReady(function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
    });
})();
