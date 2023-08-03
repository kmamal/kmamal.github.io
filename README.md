# GitHub Notes

The idea is to turn static GitHub pages into dynamic apps by using [isomarphic git](https://www.npmjs.com/package/isomorphic-git) to save changes back to the repo. This is a proof-of-concept note-taking app.

To escape read-only mode you have to tell git where the repo is by adding `backend-config-git` to localStorage, as a JSON string containing:
```json
{
	"repo": "https://github.com/user/repo",
	"branch": "master",
	"token": "<GITHUB USER TOKEN>",
}
```

In principle this should also work for any other service that offers static file hosting and a REST API.
