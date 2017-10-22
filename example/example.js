const fs = require("fs");
const { gitCommitPush } = require("../lib/git-commit-push-via-github-api");
process.on("unhandledRejection", console.dir);
if (!process.env.GITHUB_API_TOKEN) {
    throw new Error("GITHUB_API_TOKEN=xxx node example.js");
}
gitCommitPush({
    user: "azu",
    repo: "commit-to-github-test",
    files: [
        { path: "README.md", content: fs.readFileSync(__dirname + "/README.md", "utf-8") },
        { path: "dir/input.txt", content: fs.readFileSync(__dirname + "/dir/input.txt", "utf-8") },
        // Pass binary as Buffer
        { path: "next-item.mp3", content: fs.readFileSync(__dirname + "/next-item.mp3") },
        { path: "image.png", content: fs.readFileSync(__dirname + "/image.png") }
    ],
    fullyQualifiedRef: "heads/master", //optional default = "heads/dev"
    forceUpdate: false, //optional default = false
    commitMessage: "HELLOW" //option default = "AutoCommit - " + new Date().getTime().toString();
})
    .then(res => {
        console.log("success", res);
    })
    .catch(err => {
        console.error(err);
    });
