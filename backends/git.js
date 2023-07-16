/* global window, LightningFS, git */

await window.loadScript('https://unpkg.com/@isomorphic-git/lightning-fs@4.6.0')
await window.loadScript('https://unpkg.com/isomorphic-git@1.24.3')

import http from 'https://unpkg.com/isomorphic-git@beta/http/web/index.js'

const gitConfig = window.localStorage.getItem('backend-config-git')
let parsedGitConfig
try { parsedGitConfig = JSON.parse(gitConfig) } catch (error) {
	window.showError('Error in git-config: failed to parse json')
}
const { repo, branch = 'master', token } = parsedGitConfig
if (!repo) { window.showError('Error in git-config: repo not set') }
if (!token) { window.showError('Error in git-config: token not set') }

window.showMessage(`Syncing to ${repo}`)

const fs = new LightningFS('fs', { wipe: true })
const dir = '/'

let isInitialized = false
let isStoring = false
let shouldStoreAgain = false
const batch = new Map()

window.writeFile = async (path, data) => {
	batch.set(path, data)

	if (isStoring) {
		shouldStoreAgain = true
		return
	}
	isStoring = true
	shouldStoreAgain = false

	if (!isInitialized) {
		await git.clone({
			fs,
			http,
			dir,
			url: repo,
			ref: branch,
			singleBranch: true,
			depth: 1,
		})
		isInitialized = true
	}

	const batched = [ ...batch.entries() ]
	await Promise.all(batched.map((e) => fs.promises.writeFile(...e)))
	batch.clear()

	// await git.pull({ fs, http, dir })

	await git.add({ fs, http, dir, filepath: '.' })
	await git.commit({ fs, http, dir, message: 'update' })
	await git.push({
		fs,
		http,
		dir,
		remote: 'origin',
		ref: branch,
		onAuth: () => ({ username: token }),
	})

	isStoring = false
	if (shouldStoreAgain) { window.store() }
}
