---
title: Pull Requests
sidebar_position: 3
---


## Adding To Existing PR
If there are open PRs on task that you are working on, or notice something you may want to add to a PR:
### 1. Fork & Clone Main Repo
```sh
git clone https://github.com/YOUR_USERNAME/CONTRIBUTOR_FORK.git
cd CONTRIBUTOR_FORK
```
### 2. Add Collaborators Repo as Remote 
```sh
git remote add original https://github.com/ORIGINAL_CONTRIBUTOR/ORIGINAL_REPO.git
```
### 3. Fetch Branches From Remove 
```sh
git fetch original
```
### 4. Checkout Desired Branch 
```sh
git checkout original/BRANCH_NAME
```
### 5. Add Your Changes 
```sh 
git add ./<files-changes>
git commit -m "Add my changes to contribute to the PR"
```
### 6. Push Your Changes
```sh
git push origin my-changes
```

from here, a PR can be made to your peers branch, or into the 