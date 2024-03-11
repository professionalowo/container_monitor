const syssocket = new WebSocket(`ws://${window.location.host}/sysinfo`);
let sysinterval;
syssocket.onopen = () => {
    console.log('WebSocket connection established');
    sysinterval = setInterval(() => {
        syssocket.send('status');
    }, 2000);
}

syssocket.onmessage = (event) => {
    const info = JSON.parse(event.data);
    console.log(info);
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