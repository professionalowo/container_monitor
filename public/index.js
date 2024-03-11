const containers = Array.from(document.querySelectorAll('.docker'));
containers.forEach(container => {
    const status = container.dataset.status;
    const btn = container.querySelector('.btn');
    if (status !== "[object]") {
        container.classList.add("bg-danger-subtle");
        btn.innerHTML = "Start";
        btn.onclick = () => {
            fetch(`/containers/up/${container.id}`, {
                method: 'POST'
            })
                .then(response => response.json())
                .finally(() => location.reload())
        }
    }
    else {
        container.classList.add("bg-success-subtle");
        btn.innerHTML = "Stop";
        btn.onclick = () => {
            fetch(`/containers/down/${container.id}`, {
                method: 'POST'
            })
                .then(response => response.json())
                .finally(() => location.reload())
        }
    }
})

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