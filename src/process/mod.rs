use rocket::{
    futures::{SinkExt, StreamExt},
    get,
    serde::{self, Serialize},
};
use sysinfo::System;
#[derive(Debug, Serialize, Copy, Clone)]
pub struct SysInfo {
    pub ram: u64,
    pub cpu: f32,
}

#[get("/")]
pub fn status(ws: rocket_ws::WebSocket) -> rocket_ws::Channel<'static> {
    ws.channel(move |mut stream| {
        Box::pin(async move {
            while let Some(_) = stream.next().await {
                let sys = get_sys_info();
                let serialized = serde::json::to_string(&sys).unwrap();
                let _ = stream.send(serialized.into()).await;
            }
            Ok(())
        })
    })
}

pub fn get_sys_info() -> SysInfo {
    let mut sys = System::new_all();
    sys.refresh_all();
    let ram = sys.used_memory();
    let cpu = sys.global_cpu_info().cpu_usage();
    SysInfo { ram, cpu }
}
