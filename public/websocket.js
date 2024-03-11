const containers = Array.from(document.querySelectorAll('.docker'));
const socket = new WebSocket(`ws://${window.location.host}/containers/status`);
let interval;
socket.onopen = () => {
    console.log('WebSocket connection established');
    setInterval(() => {
        socket.send('status');
    }, 8000);
}

socket.onmessage = (event) => {
    const containers_server = JSON.parse(event.data)
    checkDiffs(containers, containers_server);
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

function checkDiffs(containers, serverdata) {
    if (serverdata.length != containers.length) {
        location.reload();
    }
    for (let index in containers) {
        try {
            const container = containers[index];
            const container_server = serverdata[index];
            if (container.dataset.status == "[object]" && !"Running" in container_server.status) {
                location.reload();
                return;
            } else if (container.dataset.status != "[object]" && !!container_server.status.Running) {
                location.reload();
                return;
            }
        } catch (error) {
            location.reload();
        }
    }
}

window.onbeforeunload = () => {
    socket.close();
}