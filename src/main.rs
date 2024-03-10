use docker_cargo::container::{self, Container};
use middleware::AdminUser;
use rocket::{
    form::{Form, FromForm},
    fs::{relative, NamedFile},
    get, launch, post,
    response::Redirect,
    routes,
};
use rocket::http::{Cookie, CookieJar};
use rocket_dyn_templates::{context, Template};

mod middleware;


#[derive(FromForm)]
struct LoginInput<'r> {
    username: &'r str,
    password: &'r str,
}

#[get("/")]
fn index() -> Template {
    let containers: Vec<Container> = container::get_all_containers().unwrap();
    Template::render("index", context! {containers: containers})
}

#[get("/login")]
fn login() -> Template {
    Template::render("login", context! {})
}

#[post("/login", data = "<form>")]
fn post_login(form: Form<LoginInput<'_>>, cookies: &CookieJar<'_>) -> Redirect {
    println!("username: {}, password: {}", form.username, form.password);
    Redirect::to("/")
}
#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index, login, post_login])
        .mount("/public", rocket::fs::FileServer::from(relative!("public")))
        .attach(Template::fairing())
        .attach(middleware::UserInfo {
            user: AdminUser {
                name: "admin".to_string(),
                password: "admin".to_string(),
            },
            login_url: "/login".to_string(),
            exclude_urls: vec![
                "/login".to_string(),
                "/public".to_string(),
                "/favicon.ico".to_string(),
            ],
        })
}
