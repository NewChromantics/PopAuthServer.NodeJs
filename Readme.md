Pop Auth Server
================
A nodejs server that runs in docker, giving a REST API to create and auth users.

Designed to run with GoogleCloudRun and configured with ENV vars so multiple
applications can be deployed with the same codebase.

You are expected to then have your own secondary service for account-data (stats, profile pictures etc) but use this to verify auth tokens

Originally based on https://cloud.google.com/sql/docs/mysql/connect-instance-cloud-run

Auth Server API
------------
For client
- Create User (uid)
- Authorise Uid Session
- Expire Session 

For other services
- Validate tokens for uid (ie from apple/google/oauth etc)
- Verify uid+tokens (before allowing changes to a uid-tied data/account) 

Account Server API
----------------
Your other service should have user-accounts that get Write requests with a token
That service then verifies token server-to-server before making changes
e.g.
- Set username (uid + sesion token)
- Update stats (uid + session token)



Setup
==================

Fork/Template Repository Configuration
-------------------------
Fork this repository per-project and configure for your own usage

Workflow deployment using repository `Action Variables` (via `${{var.xxx}}`)
- `GOOGLECLOUD_REGION` eg. `europe-west2`
- `GOOGLECLOUD_PROJECT` google cloud project
- `GOOGLECLOUD_REPOSITORY` name of repository [of images] under your `GOOGLECLOUD_PROJECT` in Artifact Registry
- `GOOGLECLOUD_IMAGENAME` eg `server` image name inside AR repository (+tag added in workflow)
Secrets
- `GOOGLECLOUD_SERVICE_ACCOUNT_KEY` this is a json key from a `GoogleCloud Service Account` 

Deployment
---------------------
- Create new `Google Cloud Project`
- Setup workflow above & deploy
- Create new `Google Cloud Run` instance and use image from Artifact Repository deployed in previous step
- `todo: setup database`
- `todo: configure cloud run instance App API key?`
