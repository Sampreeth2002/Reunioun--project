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
let token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Mzc1MTk0NmI3OGQ1OWU1YmY0NzRmYzEiLCJpYXQiOjE2Njg3NDAwOTh9.oUO0auz9Uqb2i-VwXMNckPaSPCJS1R6uk7O5uTlbLH0";

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

// Test to check following the user
describe("POST /api/follow/{id}", () => {
  let userId = "6376e9c84233f72a006260c0";
  let currentUserId = "63751946b78d59e5bf474fc1";

  before(async function () {
    let user = await User.findById(userId);
    let currentUser = await User.findById(currentUserId);

    await user.updateOne({ $pull: { followers: currentUserId } });
    await currentUser.updateOne({ $pull: { followings: userId } });
  });

  after(async function () {
    let user = await User.findById(userId);
    let currentUser = await User.findById(currentUserId);
    expect(user.followers.includes(currentUserId)).to.equal(true);
    expect(currentUser.followings.includes(userId)).to.equal(true);
  });

  it("should successfully follow the user", async () => {
    const res = await request(app)
      .post(`/api/follow/${userId}`)
      .set("auth-token", token);
    expect(res.status).to.equal(200);
  });
});

describe("POST /api/follow/{id}", () => {
  let userId = "6376e9c84233f72a006260c0";
  let currentUserId = "63751946b78d59e5bf474fc1";

  it("should send message if already following the user", async () => {
    const res = await request(app)
      .post(`/api/follow/${userId}`)
      .set("auth-token", token);
    expect(res.text).to.equal("You have already followed the user");
  });
});

//Test to check unfollow the user
describe("POST /api/unfollow/{id}", () => {
  let userId = "6376e9c84233f72a006260c0";
  let currentUserId = "63751946b78d59e5bf474fc1";

  after(async function () {
    let user = await User.findById(userId);
    let currentUser = await User.findById(currentUserId);
    expect(user.followers.includes(currentUserId)).to.equal(false);
    expect(currentUser.followings.includes(userId)).to.equal(false);
  });

  it("should successfully un-follow the user", async () => {
    const res = await request(app)
      .post(`/api/unfollow/${userId}`)
      .set("auth-token", token);
    expect(res.status).to.equal(200);
  });
});

// Test for uploading post successfully
let postId;
describe("POST /api/posts", () => {
  it("should upload the post and return details of the post", async () => {
    let postDetails = {
      title: "Post upload testing bu mocha",
      description: "Description for the post",
    };
    const res = await request(app)
      .post("/api/posts/")
      .send(postDetails)
      .set("auth-token", token);

    expect(res.status).to.equal(200);
    postId = res.body.post_id;
  });

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

  it("uploading without description for a post, returns error message ", async () => {
    let postDetails = {
      title: "Title for the test post",
    };
    const res = await request(app)
      .post("/api/posts/")
      .send(postDetails)
      .set("auth-token", token);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Please enter description of the post");
  });
});

// Test for uploading post without title or description
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

// Test for deleting the post
describe("Delete /api/posts/{id}", () => {
  let no_of_posts_before_post_request = 0;
  let no_of_posts_after_post_request = 0;
  before(async function () {
    no_of_posts_before_post_request = await Post.find({}).count();
  });

  // No of posts before is more since a post have been deleted
  after(async function () {
    no_of_posts_after_post_request = await Post.find({}).count();
    expect(no_of_posts_after_post_request).to.equal(
      no_of_posts_before_post_request - 1
    );
  });

  it("should succesfully delete the posts", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("auth-token", token);
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Your Post have been deleted");
  });
});

// Test for liking the post
describe("like /api/posts/{id}", () => {
  let currentUserId = "63751946b78d59e5bf474fc1";
  let no_of_likes_before = 0;
  let no_of_likes_after = 0;
  let postId = "6376292b7f4b2bc06f7bccca";
  before(async function () {
    let post = await Post.findById(postId);
    no_of_likes_before = post.likes.length;
  });

  after(async function () {
    let post = await Post.findById(postId);
    no_of_likes_after = post.likes.length;
    expect(no_of_likes_after).to.equal(no_of_likes_before + 1);
  });

  it("should succesfully like the post", async () => {
    const res = await request(app)
      .post(`/api/like/${postId}`)
      .set("auth-token", token);
    expect(res.text).to.equal("You have liked the post");
  });
});

describe("like /api/like/{id}", () => {
  let currentUserId = "63751946b78d59e5bf474fc1";
  let no_of_likes_before = 0;
  let no_of_likes_after = 0;
  let postId = "6376292b7f4b2bc06f7bccca";
  before(async function () {
    let post = await Post.findById(postId);
    no_of_likes_before = post.likes.length;
  });

  after(async function () {
    let post = await Post.findById(postId);
    no_of_likes_after = post.likes.length;
    expect(no_of_likes_after).to.equal(no_of_likes_before);
    await post.updateOne({ $pull: { likes: currentUserId } });
  });

  it("should return error message if liked the post again", async () => {
    const res = await request(app)
      .post(`/api/like/${postId}`)
      .set("auth-token", token);
    expect(res.text).to.equal("Already liked the post");
  });
});

// Test for un-liking the post
describe("POST /api/unlike/{id}", () => {
  let currentUserId = "63751946b78d59e5bf474fc1";
  let no_of_unlikes_before = 0;
  let no_of_unlikes_after = 0;
  let postId = "6376292b7f4b2bc06f7bccca";
  before(async function () {
    let post = await Post.findById(postId);
    no_of_unlikes_before = post.unlikes.length;
  });

  after(async function () {
    let post = await Post.findById(postId);
    no_of_unlikes_after = post.unlikes.length;
    expect(no_of_unlikes_after).to.equal(no_of_unlikes_before + 1);
  });

  it("should succesfully unlike the post", async () => {
    const res = await request(app)
      .post(`/api/unlike/${postId}`)
      .set("auth-token", token);
    expect(res.text).to.equal("You have unliked the post");
  });
});

describe("POST /api/unlike/{id}", () => {
  let currentUserId = "63751946b78d59e5bf474fc1";
  let no_of_unlikes_before = 0;
  let no_of_unlikes_after = 0;
  let postId = "6376292b7f4b2bc06f7bccca";
  before(async function () {
    let post = await Post.findById(postId);
    no_of_unlikes_before = post.unlikes.length;
  });

  after(async function () {
    let post = await Post.findById(postId);
    no_of_unlikes_after = post.unlikes.length;
    expect(no_of_unlikes_after).to.equal(no_of_unlikes_before);
    await post.updateOne({ $pull: { unlikes: currentUserId } });
  });

  it("should return error message if unliked the post again", async () => {
    const res = await request(app)
      .post(`/api/unlike/${postId}`)
      .set("auth-token", token);
    expect(res.text).to.equal("Already unliked the post");
  });
});

// Test to get the user details
describe("/get users", () => {
  it("should give user details", async () => {
    const res = await request(app).get("/api/user").set("auth-token", token);
    expect(res.status).to.equal(200);
  });
});
