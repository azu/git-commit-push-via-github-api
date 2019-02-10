import * as GitHubApi from "@octokit/rest";

const debug = require("debug")("git-commit-push-via-github-api");
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;
const getReferenceCommit = function(github: GitHubApi, options: GitCommitPushOptions) {
    return new Promise((resolve, reject) => {
        github.git.getRef(
            {
                owner: options.owner,
                repo: options.repo,
                ref: options.fullyQualifiedRef
            },
            (err, res) => {
                if (err) {
                    debug("getReferenceCommit Error", JSON.stringify(err, null, "  "));
                    return reject(err);
                }
                debug("getReferenceCommit Response: %O", res);
                return resolve({ referenceCommitSha: res.data.object.sha });
            }
        );
    });
};

const createTree = function(github: GitHubApi, options: GitCommitPushOptions, data: any) {
    return new Promise((resolve, reject) => {
        const promises = options.files.map(file => {
            if (typeof file.path === "string" && typeof file.content === "string") {
                return github.git
                    .createBlob({
                        owner: options.owner,
                        repo: options.repo,
                        content: file.content,
                        encoding: "utf-8"
                    })
                    .then((blob: any) => {
                        return {
                            sha: blob.data.sha,
                            path: file.path,
                            mode: "100644",
                            type: "blob"
                        };
                    });
            } else if (typeof file.path === "string" && Buffer.isBuffer(file.content)) {
                return github.git
                    .createBlob({
                        owner: options.owner,
                        repo: options.repo,
                        content: file.content.toString("base64"),
                        encoding: "base64"
                    })
                    .then((blob: any) => {
                        return {
                            sha: blob.data.sha,
                            path: file.path,
                            mode: "100644",
                            type: "blob"
                        };
                    });
            }
            throw new Error(`This file can not handled: ${file}`);
        });
        return Promise.all(promises).then(files => {
            debug("files: %O", files);
            // TODO: d.ts bug?
            github.git.createTree(
                {
                    owner: options.owner,
                    repo: options.repo,
                    tree: files,
                    base_tree: data.referenceCommitSha
                } as any,
                (err: any, res: any) => {
                    if (err) {
                        debug("createTree", JSON.stringify(err, null, "  "));
                        return reject(err);
                    }
                    debug("createTree Response: %O", res);
                    return resolve(Object.assign(data, { newTreeSha: res.data.sha }));
                }
            );
        });
    });
};

const createCommit = function(github: GitHubApi, options: GitCommitPushOptions, data: any) {
    return new Promise((resolve, reject) => {
        github.git.createCommit(
            {
                owner: options.owner,
                repo: options.repo,
                message: options.commitMessage || "commit",
                tree: data.newTreeSha,
                parents: [data.referenceCommitSha]
            },
            (err, res) => {
                if (err) {
                    debug("createCommit", JSON.stringify(err, null, "  "));
                    return reject(err);
                }
                debug("createCommit Response: %O", res);
                return resolve(Object.assign(data, { newCommitSha: res.data.sha }));
            }
        );
    });
};

const updateReference = function(github: GitHubApi, options: GitCommitPushOptions, data: any) {
    return new Promise((resolve, reject) => {
        github.git.updateRef(
            {
                owner: options.owner,
                repo: options.repo,
                ref: options.fullyQualifiedRef,
                sha: data.newCommitSha,
                force: options.forceUpdate
            },
            (err, data) => {
                if (err) {
                    debug("updateReference", JSON.stringify(err, null, "  "));
                    return reject(err);
                }
                debug("updateReference Response: %O", data);
                return resolve(data);
            }
        );
    });
};

export interface GitCommitPushOptions {
    owner: string;
    repo: string;
    files: {
        path: string;
        content: string | Buffer;
    }[];
    fullyQualifiedRef: string;
    forceUpdate?: boolean;
    commitMessage?: string;
    token?: string; // or process.env.GITHUB_API_TOKEN
}

export const gitCommitPush = (options: GitCommitPushOptions) => {
    if (!options.owner || !options.repo || !options.files || !options.files.length) {
        return "";
    }
    const token = options.token || GITHUB_API_TOKEN;
    if (!token) {
        throw new Error(`token is not defined`);
    }
    const gitHub = new GitHubApi();
    if (token) {
        gitHub.authenticate({
            type: "oauth",
            token: token
        });
    }
    const filledOptions = {
        owner: options.owner,
        repo: options.repo,
        files: options.files,
        fullyQualifiedRef: options.fullyQualifiedRef || "heads/dev",
        forceUpdate: options.forceUpdate || false,
        commitMessage: options.commitMessage || "Commit - " + new Date().getTime().toString()
    };
    debug("options %O", options);
    return getReferenceCommit(gitHub, filledOptions)
        .then(data => createTree(gitHub, filledOptions, data))
        .then(data => createCommit(gitHub, filledOptions, data))
        .then(data => updateReference(gitHub, filledOptions, data));
};
