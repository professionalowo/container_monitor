use rocket::{
    fs::{relative, NamedFile},
    get, launch, routes,
};
use rocket_dyn_templates::{context, Template};
use docker_cargo::container::{Container,self};

#[get("/")]
fn index() -> Template {
    let containers: Vec<Container> = container::get_all_containers().unwrap();
    Template::render("index", context! {containers: containers})
}
#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index])
        .mount("/public", rocket::fs::FileServer::from(relative!("public")))
        .attach(Template::fairing())
}
