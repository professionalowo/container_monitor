const socket = new WebSocket(`ws://${window.location.host}/sysinfo`);
let interval;
socket.onopen = () => {
    console.log('WebSocket connection established');
    setInterval(() => {
        socket.send('status');
    }, 2000);
}

socket.onmessage = (event) => {
    const info = JSON.parse(event.data);
    console.log(info);
}

socket.onclose = () => {
    console.log('WebSocket connection closed');
    if (interval) {
        clearInterval(interval);
    }
}

socket.onerror = (error) => {
    alert(`WebSocket error: ${error}`);
}