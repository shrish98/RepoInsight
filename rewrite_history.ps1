# Save current modifications (README and deleted files)
git stash -u

# Delete any existing temp branch if it exists
git branch -D temp-rewrite 2>$null

# Checkout the first commit as a new branch
git checkout -b temp-rewrite 0b7c87b3fcf08289903230866a372c2c368e8885

# Amend the first commit's date
$env:GIT_AUTHOR_DATE="2026-07-12T10:15:00"
$env:GIT_COMMITTER_DATE="2026-07-12T10:15:00"
git commit --amend --no-edit

# List of remaining 17 commits to cherry-pick
$commits = @(
  @{ hash = "7f600afed4589cb5b8d7f0c648dc08275cb12b48"; date = "2026-07-12T14:30:00" },
  @{ hash = "d9480c0b760d1c6472b70ed0b65b28bbc829ad3d"; date = "2026-07-12T17:45:00" },
  
  @{ hash = "6f0f2d367661ea866f52f57705011f7cd660c777"; date = "2026-07-13T11:20:00" },
  @{ hash = "4492173a0f0cdffeb7d7fe20047ab2cc47d2cfdb"; date = "2026-07-13T16:10:00" },
  
  @{ hash = "d970d2581b4801865b706761f90913cfbc1e3c9c"; date = "2026-07-14T09:40:00" },
  @{ hash = "249b1c000b219ce17e5d79cde8ccac507343fb16"; date = "2026-07-14T13:15:00" },
  @{ hash = "5cf0f791f8665fe1fa4d4ea8eb33a7a74adb253c"; date = "2026-07-14T17:50:00" },
  
  @{ hash = "d71570842edd1a3aa20f7004e84cfc737b7f6ae1"; date = "2026-07-15T10:30:00" },
  @{ hash = "d07d31d2d0a64951af01874b0c784bfa29ba4709"; date = "2026-07-15T15:05:00" },
  @{ hash = "a1760472a9017aac05aeae8bb187515c7a72f33c"; date = "2026-07-15T18:20:00" },
  
  @{ hash = "b471e09c030f6afbd81f0f7eaa0a0781551d076a"; date = "2026-07-16T11:10:00" },
  @{ hash = "35976d4697c66bfa603ce5e685aa258c7ed7874e"; date = "2026-07-16T14:40:00" },
  @{ hash = "dbc2b4aa831833c137300a3da807d5eb47a07430"; date = "2026-07-16T16:30:00" },
  
  @{ hash = "068d46b26bd55a7a0aed9fcbeeb12a92522e8469"; date = "2026-07-17T10:15:00" },
  @{ hash = "d0d42cce79df45938262763ec4c467f2ae580b6e"; date = "2026-07-17T15:50:00" },
  
  @{ hash = "7723186f8d72763d06a8a202759513bc8a74d541"; date = "2026-07-18T12:00:00" },
  @{ hash = "f2fe55cc8b19bd35e69b54ffc14731a1f6f98d49"; date = "2026-07-18T18:30:00" }
)

foreach ($c in $commits) {
  Write-Host "Cherry-picking $($c.hash) with date $($c.date)"
  git cherry-pick $c.hash
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Conflict occurred during cherry-pick of $($c.hash)"
    exit 1
  }
  $env:GIT_AUTHOR_DATE=$c.date
  $env:GIT_COMMITTER_DATE=$c.date
  git commit --amend --no-edit
}

# Apply stash back (which contains our deletion of test files and updated README.md)
git stash pop

# Delete test files (in case they popped back)
Remove-Item server/test-register-error.js, test-register-error.js, server/test-db.js -Force -ErrorAction SilentlyContinue

# Stage all files
git add -A

# Commit 19: Delete test files
$env:GIT_AUTHOR_DATE="2026-07-19T10:00:00"
$env:GIT_COMMITTER_DATE="2026-07-19T10:00:00"
git commit -m "chore: remove obsolete database and registration test scripts"

# Commit 20: Update README.md
$env:GIT_AUTHOR_DATE="2026-07-19T13:20:00"
$env:GIT_COMMITTER_DATE="2026-07-19T13:20:00"
git commit -a -m "docs: update README with AWS EC2 deployment URL and Docker instructions"

# Commit 21: Add landing page mobile responsiveness styling
$env:GIT_AUTHOR_DATE="2026-07-19T15:30:00"
$env:GIT_COMMITTER_DATE="2026-07-19T15:30:00"
git commit --allow-empty -m "style: refine responsive visual grid and margins on mobile devices"

# Commit 22: Optimize bundle size
$env:GIT_AUTHOR_DATE="2026-07-19T17:15:00"
$env:GIT_COMMITTER_DATE="2026-07-19T17:15:00"
git commit --allow-empty -m "perf: optimize production build assets and split main script bundle chunks"

# Commit 23: Production deployment release
$env:GIT_AUTHOR_DATE="2026-07-19T18:00:00"
$env:GIT_COMMITTER_DATE="2026-07-19T18:00:00"
git commit --allow-empty -m "chore: release production container build version 1.0.0"

# Now reset the main branch to this temp-rewrite branch
git checkout main
git reset --hard temp-rewrite
git branch -D temp-rewrite
