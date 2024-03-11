use std::{
    hash::{DefaultHasher, Hasher},
    io::Cursor,
};

use rocket::{
    fairing::{Fairing, Info, Kind},
    Request, Response,
};

#[derive(Clone, Debug)]
pub struct UserInfo {
    pub login_url: String,
    pub exclude_urls: Vec<String>,
    pub user: AdminUser,
}
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct AdminUser {
    pub name: String,
    pub password: String,
}

pub fn calculate_hash<T: std::hash::Hash>(t: &T) -> u64 {
    let mut s = DefaultHasher::new();
    t.hash(&mut s);
    s.finish()
}

#[rocket::async_trait]
impl Fairing for UserInfo {
    fn info(&self) -> Info {
        Info {
            name: "Check User",
            kind: Kind::Request | Kind::Response,
        }
    }

    async fn on_response<'r>(&self, req: &'r Request<'_>, res: &mut Response<'r>) {
        if req.uri().path().to_string() == self.login_url
            || self
                .exclude_urls
                .iter()
                .any(|url| req.uri().path().to_string().starts_with(url))
        {
            return;
        }

        let user_cookie = req.cookies().get("session");
        match user_cookie {
            Some(cookie) => {
                if cookie.value() != calculate_hash(&self.user).to_string() {
                    let message = "Unauthorized";
                    res.set_status(rocket::http::Status::Unauthorized);
                    res.set_sized_body(message.len(), Cursor::new(message));
                }
            }
            None => {
                let message = "Unauthorized &rarr; <a href='login'>Login</a>";
                res.set_status(rocket::http::Status::Unauthorized);
                res.set_sized_body(message.len(), Cursor::new(message));
            }
        }
        println!("Checking user on {}", req.uri().path().to_string());
    }
}
