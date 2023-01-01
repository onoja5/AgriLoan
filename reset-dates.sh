#!/bin/sh

# Set all commit dates to Jan 1, 2023
git filter-branch -f --env-filter '
    export GIT_AUTHOR_DATE="2023-01-01T12:00:00"
    export GIT_COMMITTER_DATE="2023-01-01T12:00:00"
' --tag-name-filter cat -- --all