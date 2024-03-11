const containers = document.querySelectorAll('.docker');
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

socket.onopen = () => {
    console.log('WebSocket connection established');
}

socket.onmessage = (event) => {
    const containers_server = JSON.parse(event.data)
    console.log(containers_server);
    checkDiffs(containers_server);
}

socket.onclose = () => {
    console.log('WebSocket connection closed');
}

socket.onerror = (error) => {
    alert(`WebSocket error: ${error}`);
}

function checkDiffs(containers_server){
    if(containers_server.length !== containers.length){
        location.reload();
    }
    containers_server.forEach((container_server,index) => {
        const match = containers[index];
    })
}