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

render();
setInterval(render, 1000);
