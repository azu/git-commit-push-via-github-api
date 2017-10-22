# git-commit-push-via-github-api

Git commit and push by using GitHub API.
 
No depended on Git binary.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install git-commit-push-via-github-api

## Usage

```js
const fs = require("fs");
const { gitCommitPush } = require("git-commit-push-via-github-api");
process.on("unhandledRejection", console.dir);
if (!process.env.GITHUB_API_TOKEN) {
    throw new Error("GITHUB_API_TOKEN=xxx node example.js");
}
gitCommitPush({
    // commit to https://github.com/azu/commit-to-github-test
    owner: "azu",
    repo: "commit-to-github-test",
    // commit files
    files: [
        { path: "README.md", content: fs.readFileSync(__dirname + "/README.md", "utf-8") },
        { path: "dir/input.txt", content: fs.readFileSync(__dirname + "/dir/input.txt", "utf-8") },
        // Pass binary as Buffer
        { path: "next-item.mp3", content: fs.readFileSync(__dirname + "/next-item.mp3") },
        { path: "image.png", content: fs.readFileSync(__dirname + "/image.png") }
    ],
    fullyQualifiedRef: "heads/master",
    forceUpdate: false, // optional default = false
    commitMessage: "HELLO"
})
    .then(res => {
        console.log("success", res);
    })
    .catch(err => {
        console.error(err);
    });
```


## Related 

- [Ramshackle-Jamathon/commit-to-github: make commits to github without git, perfect for AWS lambda](https://github.com/Ramshackle-Jamathon/commit-to-github)
- [wuzhizhe/uploadFileToGithub](https://github.com/wuzhizhe/uploadFileToGithub)

## Changelog

See [Releases page](https://github.com/azu/git-commit-push-via-github-api/releases).


## Running tests

Install devDependencies and Run `npm test`:

    GITHUB_API_TOKEN=xxx npm run test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/git-commit-push-via-github-api/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
