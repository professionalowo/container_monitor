const syssocket = new WebSocket(`ws://${window.location.host}/sysinfo`);
let sysinterval;
syssocket.onopen = () => {
    console.log('WebSocket connection established');

}


syssocket.onclose = () => {
    console.log('WebSocket connection closed');
    if (sysinterval) {
        clearInterval(interval);
    }
}

syssocket.onerror = (error) => {
    alert(`WebSocket error: ${error}`);
}

// On chart load, start an interval that adds points to the chart and animate
// the pulsating marker.
const onChartLoad = function () {
    const chart = this;
    const cpu = chart.series[0];
    const ram = chart.series[1];

    sysinterval = setInterval(() => {
        if (syssocket.readyState === 1)
            syssocket.send('status');
    }, 1000);

    syssocket.onmessage = (event) => {
        const info = JSON.parse(event.data);
        console.log(info);
        const x = (new Date()).getTime()
        cpu.addPoint([x, info.cpu], true, true);
        ram.addPoint([x, info.ram], true, true);
    }

};


// Plugin to add a pulsating marker on add point
Highcharts.addEvent(Highcharts.Series, 'addPoint', e => {
    const point = e.point,
        series = e.target;

    if (!series.pulse) {
        series.pulse = series.chart.renderer.circle()
            .add(series.markerGroup);
    }

    setTimeout(() => {
        series.pulse
            .attr({
                x: series.xAxis.toPixels(point.x, true),
                y: series.yAxis.toPixels(point.y, true),
                r: series.options.marker.radius,
                opacity: 1,
                fill: series.color
            })
            .animate({
                r: 20,
                opacity: 0
            }, {
                duration: 1000
            });
    }, 1);
});
data = (function getInitialData() {
    return Array(10).fill(0);
})();

Highcharts.chart('chart', {
    credits: {
        enabled: false
    },
    chart: {
        reflow: true,
        styledMode: true,
        type: 'spline',
        events: {
            load: onChartLoad
        }
    },

    time: {
        useUTC: false
    },

    title: {
        text: 'System Information'
    },

    accessibility: {
        announceNewData: {
            enabled: true,
            minAnnounceInterval: 15000,
            announcementFormatter: function (allSeries, newSeries, newPoint) {
                if (newPoint) {
                    return 'New point added. Value: ' + newPoint.y;
                }
                return false;
            }
        }
    },

    xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        maxPadding: 0.1
    },

    yAxis: {
        title: {
            text: 'Usage in %'
        },
        plotLines: [
            {
                value: 100,
                width: 1,
                color: '#808080'
            },
            {
                value: 100,
                width: 1,
                color: '#808080'
            }
        ]
    },

    tooltip: {
        headerFormat: '<b>{series.name}</b><br/>',
        pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
    },

    legend: {
        enabled: false
    },

    exporting: {
        enabled: false
    },

    series: [
        {
            name: 'CPU',
            lineWidth: 2,
            color: Highcharts.getOptions().colors[2],
            data
        }, {
            name: 'RAM',
            lineWidth: 2,
            color: Highcharts.getOptions().colors[1],
            data
        }
    ]
});