import { readFileSync } from 'fs';

const env = readFileSync('.env', 'utf8');
const token = env.match(/GITHUB_TOKEN=(.+)/)?.[1]?.trim();

// Step 1: Get repos
const reposResp = await fetch(`https://api.github.com/user/repos?per_page=30&type=owner&sort=pushed&direction=desc`, {
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
});
const repos = await reposResp.json();
const nonFork = repos.filter(r => !r.fork).slice(0, 10);
console.log(`Repos to process: ${nonFork.length}`);

// Step 2: Get user ID
const uidResp = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: '{ user(login: "DanielDeshmukh") { id } }' })
});
const uidData = await uidResp.json();
const userId = uidData.data.user.id;
console.log(`User ID: ${userId}`);

// Step 3: For each repo, do GraphQL + REST
for (const repo of nonFork) {
  const owner = repo.full_name.split('/')[0];
  
  // GraphQL: newest + totalCount
  const gql = `{
    repository(owner: "${owner}", name: "${repo.name}") {
      defaultBranchRef {
        target {
          ... on Commit {
            history(author: { id: "${userId}" }, first: 1) {
              totalCount
              edges { node { committedDate } }
            }
          }
        }
      }
    }
  }`;
  
  try {
    const gqlResp = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: gql })
    });
    const gqlResult = await gqlResp.json();
    
    if (gqlResult.errors) {
      console.log(`${repo.name}: GQL ERROR: ${gqlResult.errors[0].message}`);
      continue;
    }
    
    const history = gqlResult.data?.repository?.defaultBranchRef?.target?.history;
    const newest = history?.edges?.[0]?.node?.committedDate;
    const totalCount = history?.totalCount ?? 0;
    
    if (!newest || totalCount === 0) {
      console.log(`${repo.name}: no commits (newest=${newest}, count=${totalCount})`);
      continue;
    }
    
    // REST: oldest commit
    const lastPage = Math.ceil(totalCount / 100);
    const restResp = await fetch(`https://api.github.com/repos/${owner}/${repo.name}/commits?author=${encodeURIComponent('DanielDeshmukh')}&per_page=100&page=${lastPage}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    });
    const commits = await restResp.json();
    const oldest = Array.isArray(commits) && commits.length > 0 ? commits[commits.length - 1]?.commit.author.date : null;
    
    if (oldest) {
      const span = Math.round((new Date(newest) - new Date(oldest)) / 86400000);
      console.log(`${repo.name}: newest=${newest} oldest=${oldest} span=${span}d`);
    } else {
      console.log(`${repo.name}: REST failed - commits=${JSON.stringify(commits).substring(0, 100)}`);
    }
  } catch (err) {
    console.log(`${repo.name}: EXCEPTION: ${err.message}`);
  }
}
