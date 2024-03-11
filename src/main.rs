use docker_cargo::container::{self, Container};
use middleware::{calculate_hash, AdminUser};
use rocket::http::{Cookie, CookieJar};
use rocket::time::{Duration, OffsetDateTime};
use rocket::State;
use rocket::{
    form::{Form, FromForm},
    fs::relative,
    get, launch, post,
    response::Redirect,
    routes,
};
use rocket_dyn_templates::{context, Template};

mod containers;
mod middleware;
mod process;
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
fn post_login(
    form: Form<LoginInput<'_>>,
    cookies: &CookieJar<'_>,
    state: &State<AdminUser>,
) -> Redirect {
    if form.username == state.name && form.password == state.password {
        let cookie = Cookie::build(("session", calculate_hash(state.inner()).to_string()))
            .path("/")
            .secure(true)
            .expires(OffsetDateTime::now_utc() + Duration::minutes(15))
            .http_only(true);
        cookies.add(cookie);
    }
    Redirect::to("/")
}
#[get("/logout")]
fn logout(cookies: &CookieJar<'_>) -> Redirect {
    cookies.remove("session");
    Redirect::to("/")
}

#[launch]
fn rocket() -> _ {
    dotenv::dotenv().ok();
    let admin = AdminUser {
        name: dotenv::var("ADMIN_NAME").unwrap(),
        password: dotenv::var("ADMIN_PW").unwrap(),
    };
    rocket::build()
        .mount("/", routes![index, login, logout, post_login])
        .mount(
            "/containers",
            routes![containers::up, containers::down, containers::status],
        )
        .mount("/sysinfo", routes![process::status])
        .mount("/public", rocket::fs::FileServer::from(relative!("public")))
        .attach(Template::fairing())
        .attach(middleware::UserInfo {
            user: admin.clone(),
            login_url: "/login".to_string(),
            exclude_urls: vec![
                "/login".to_string(),
                "/logout".to_string(),
                "/public".to_string(),
                "/favicon.ico".to_string(),
            ],
        })
        .manage(admin.clone())
}
