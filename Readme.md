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
- Setup CloudSQL database like https://cloud.google.com/sql/docs/mysql/connect-instance-cloud-run#node.js
	- Setup cloud run env vars
	- `INSTANCE_UNIX_SOCKET`: Set to /cloudsql/YOUR_PROJECT_ID:us-central1:quickstart-instance
	- `INSTANCE_CONNECTION_NAME`: Set to your instance's Connection name that appears on the Cloud SQL instances page in the Google Cloud console.
	- `DB_NAME`: Set to quickstart-db.
	- `DB_USER`: Set to quickstart-user.
	- `DB_PASS`: Set to the password of the quickstart-user that you specified in the previous Create a user quickstart step.
