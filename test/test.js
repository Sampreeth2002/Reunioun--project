const expect = require("chai").expect;
const request = require("supertest");
const app = require("../index");
const chai = require("chai");
const chaiHttp = require("chai-http");

// MongoDB imports
const User = require("../model/User");
const Post = require("../model/Post");

chai.should();
chai.use(chaiHttp);
let token;

describe("POST /api/authenticate", () => {
  it("should return JWT token if successfull authentication", async () => {
    let loginDetails = {
      email: "sampreeth.2002@gmail.com",
      password: "sampreeth",
    };
    const res = await request(app).post("/api/authenticate").send(loginDetails);
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Login Successfull");
    token = res.body.token;
  });
});

describe("POST /api/posts", () => {
  //   it("should upload the post and return details of the post", async () => {
  //     let postDetails = {
  //       title: "Post upload testing bu mocha",
  //       description: "Description for the post",
  //     };
  //     const res = await request(app)
  //       .post("/api/posts/")
  //       .send(postDetails)
  //       .set("auth-token", token);

  //     expect(res.status).to.equal(200);
  //   });

  it("uploading without title for a post, returns error message ", async () => {
    let postDetails = {
      description: "Description for the post",
    };
    const res = await request(app)
      .post("/api/posts/")
      .send(postDetails)
      .set("auth-token", token);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Please enter title of the post");
  });
});

describe("unsuccessfull upload of the posts", () => {
  let no_of_posts_before_post_request = 0;
  let no_of_posts_after_post_request = 0;
  before(async function () {
    no_of_posts_before_post_request = await Post.find({}).count();
  });

  after(async function () {
    no_of_posts_after_post_request = await Post.find({}).count();
    expect(no_of_posts_after_post_request).to.equal(
      no_of_posts_before_post_request
    );
  });

  it("uploading without description for a post, returns error message ", async () => {
    let postDetails = {
      description: "Description for the post",
    };
    const res = await request(app)
      .post("/api/posts/")
      .send(postDetails)
      .set("auth-token", token);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Please enter title of the post");
  });
});

describe("/get users", () => {
  it("should give user details", async () => {
    const res = await request(app).get("/api/user").set("auth-token", token);
    expect(res.status).to.equal(200);
  });
});
