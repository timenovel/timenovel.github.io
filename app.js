// Zero hour: 5 January 2028, 00:00 Cairo time (EET, UTC+2 in January).
var TARGET = new Date('2028-01-05T00:00:00+02:00').getTime();

function remaining(now) {
    var ms = Math.max(0, TARGET - now);
    return {
        done: TARGET - now <= 0,
        days: Math.floor(ms / 86400000),
        hours: Math.floor(ms / 3600000) % 24,
        minutes: Math.floor(ms / 60000) % 60,
        seconds: Math.floor(ms / 1000) % 60
    };
}

function pad(n, len) {
    var s = String(n);
    while (s.length < len) s = '0' + s;
    return s;
}

function render() {
    var r = remaining(Date.now());
    var host = document.getElementById('zero-content');
    if (r.done) {
        host.innerHTML = '<p class="zero-done">لقد حلّ الزمن صفر</p>';
        return;
    }
    var units = [
        { value: pad(r.days, 3), label: 'أيام' },
        { value: pad(r.hours, 2), label: 'ساعات' },
        { value: pad(r.minutes, 2), label: 'دقائق' },
        { value: pad(r.seconds, 2), label: 'ثوانٍ' }
    ];
    var html = '';
    for (var i = 0; i < units.length; i++) {
        if (i > 0) html += '<span class="zero-sep" aria-hidden="true">:</span>';
        html += '<div class="zero-unit"><span class="zero-digits">' + units[i].value +
            '</span><span class="zero-label">' + units[i].label + '</span></div>';
    }
    host.innerHTML = html;
}

// Clock-tick sound (Doomsday-clock style): one short mechanical click per second.
// Browsers block autoplay audio, so the AudioContext is created only after the
// user enables sound via the toggle. Default: muted (persisted in localStorage).
var TICK_KEY = 'countdown-tick-enabled';
// Sound defaults ON; only an explicit mute (stored as '0') silences it.
var tickEnabled = true;
try { tickEnabled = localStorage.getItem(TICK_KEY) !== '0'; } catch (e) {}
var audioCtx = null;
var lastTickSecond = -1;

function ensureAudio() {
    if (!audioCtx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playTick() {
    var ctx = ensureAudio();
    if (!ctx) return;
    var t = ctx.currentTime;
    // Click: a very short high-passed noise burst, like a clock escapement.
    var dur = 0.03;
    var buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    }
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    var hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1800;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(hp).connect(gain).connect(ctx.destination);
    src.start(t);
}

var tickBtn = document.getElementById('tick-toggle');
function paintTickBtn() {
    tickBtn.innerHTML = tickEnabled ? '&#128266;' : '&#128263;';
    tickBtn.setAttribute('aria-pressed', tickEnabled ? 'true' : 'false');
    tickBtn.classList.toggle('tick-on', tickEnabled);
}
tickBtn.addEventListener('click', function () {
    tickEnabled = !tickEnabled;
    try { localStorage.setItem(TICK_KEY, tickEnabled ? '1' : '0'); } catch (e) {}
    if (tickEnabled) { ensureAudio(); lastTickSecond = -1; }
    paintTickBtn();
});
paintTickBtn();

// Sound is meant to start on page open. Browsers usually block autoplay audio,
// so if the AudioContext is still suspended, unlock it on the first touch,
// click or keypress anywhere on the page.
if (tickEnabled) {
    var ctx0 = ensureAudio();
    if (!ctx0 || ctx0.state !== 'running') {
        var unlockAudio = function () {
            ensureAudio();
            window.removeEventListener('pointerdown', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
        window.addEventListener('pointerdown', unlockAudio);
        window.addEventListener('touchstart', unlockAudio);
        window.addEventListener('keydown', unlockAudio);
    }
}

render();
setInterval(function () {
    render();
    if (tickEnabled) {
        var sec = Math.floor((TARGET - Date.now()) / 1000);
        if (sec !== lastTickSecond && sec >= 0) {
            lastTickSecond = sec;
            playTick();
        }
    }
}, 1000);
