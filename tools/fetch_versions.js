const { Octokit } = require('@octokit/rest')
const { writeFile } = require('fs')

// GitHub personal access token (optional)
const token = ''

// List of repositories to fetch release versions
const repositories = [
  { name: 'server', repo: 'nats-server' },
  { name: 'go', repo: 'nats.go' },
  { name: 'rust', repo: 'nats.rs' },
  { name: 'java', repo: 'nats.java' },
  { name: 'node', repo: 'nats.js' },
  { name: 'deno', repo: 'nats.deno' },
  { name: 'ws', repo: 'nats.ws' },
  { name: 'dotnet', repo: 'nats.net' },
  { name: 'ruby-pure', repo: 'nats.rb' },
  { name: 'python', repo: 'nats.py' },
  { name: 'c', repo: 'nats.c' },
  { name: 'cli', repo: 'natscli' },
  //  { name: 'elixir', repo: 'nats.ex' },
]

const owner = 'nats-io'

async function fetchLatestRelease(octokit, owner, repo) {
  const response = await octokit.repos.getLatestRelease({
    owner,
    repo,
  })

  // Trim the leading 'v' from the version.
  let latestRelease = response.data.tag_name
  if (latestRelease.startsWith('v')) {
    latestRelease = latestRelease.substring(1)
  }

  return latestRelease
}

async function fetchLatestRustReleases(octokit, owner) {
  const response = await octokit.repos.listReleases({
    owner: owner,
    repo: 'nats.rs',
    per_page: 100,
  })

  const releases = response.data
  let asyncRust = ''
  let syncRust = ''

  for (const release of releases) {
    if (release.tag_name.startsWith('async-nats/')) {
      asyncRust = release.tag_name.substring('async-nats/v'.length)
    } else if (release.tag_name.startsWith('nats/')) {
      syncRust = release.tag_name.substring('nats/v'.length)
    }

    if (asyncRust && syncRust) {
      break
    }
  }

  return { asyncRust, syncRust }
}

async function fetchLatestReleases() {
  const octokit = new Octokit({ auth: token })
  const versions = {}

  for (const repo of repositories) {
    try {
      if (repo.name === 'rust') {
        const { asyncRust, syncRust } = await fetchLatestRustReleases(octokit, owner)
        versions['rust'] = syncRust
        versions['rust-async'] = asyncRust
      } else {
        let version = await fetchLatestRelease(octokit, owner, repo.repo)
        versions[repo.name] = version
      }
    } catch (error) {
      console.error(`Error fetching latest release for ${owner}/${repo.repo}: ${error.message}`)
      return
    }
  }

  const json = JSON.stringify(versions, null, 2)

  writeFile('./src/versions.json', json, 'utf8', () => {
    console.log('versions.json written')
  })
}

fetchLatestReleases()
