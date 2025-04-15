Pop Auth Server
================
A nodejs server that runs in docker, giving a REST API to create and auth users.

Designed to run with GoogleCloudRun and configured with ENV vars so multiple
applications can be deployed with the same codebase.

You are expected to then have your own secondary service for account-data (stats, profile pictures etc) but use this to verify auth tokens


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
