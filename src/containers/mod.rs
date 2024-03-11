use std::{thread, time::Duration};

use docker_cargo::container::{Container, DockerError};
use rocket::{
    futures::{SinkExt, StreamExt},
    get,
    http::Status,
    post, serde,
};

#[post("/up/<id>")]
pub fn up(id: &str) -> Status {
    match Container::try_start_by_id_or_name(&id) {
        Ok(_) => Status::Ok,
        Err(_) => Status::InternalServerError,
    }
}

#[post("/down/<id>")]
pub fn down(id: &str) -> Status {
    match Container::try_stop_by_id_or_name(&id) {
        Ok(_) => Status::Ok,
        Err(_) => Status::InternalServerError,
    }
}

#[get("/status")]
pub fn status(ws: rocket_ws::WebSocket) -> rocket_ws::Channel<'static> {
    ws.channel(move |mut stream| {
        Box::pin(async move {
            while let Some(_) = stream.next().await {
                let containers = docker_cargo::container::get_all_containers().unwrap();
                let serialized = serde::json::to_string(&containers).unwrap();
                let _ = stream.send(serialized.into()).await;
            }
            Ok(())
        })
    })
}
