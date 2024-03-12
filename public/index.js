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

