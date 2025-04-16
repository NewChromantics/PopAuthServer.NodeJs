//	from https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/cloud-sql/mysql/mysql/connect-unix.js
//import * as createTcpPool from './connect-tcp.js';
//import * as createUnixSocketPool from './connect-unix.js';

import * as mysql from 'promise-mysql';
//import fs from 'fs';


//	https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/cloud-sql/mysql/mysql/connect-unix.js
// createUnixSocketPool initializes a Unix socket connection pool for
// a Cloud SQL instance of MySQL.
const createUnixSocketPool = async config => {
	// Note: Saving credentials in environment variables is convenient, but not
	// secure - consider a more secure solution such as
	// Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
	// keep secrets safe.
	return mysql.createPool({
		user: process.env.DB_USER, // e.g. 'my-db-user'
		password: process.env.DB_PASS, // e.g. 'my-db-password'
		database: process.env.DB_NAME, // e.g. 'my-database'
		socketPath: process.env.INSTANCE_UNIX_SOCKET, // e.g. '/cloudsql/project:region:instance'
		// Specify additional properties here.
		...config,
	});
};


//	https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/cloud-sql/mysql/mysql/connect-tcp.js

// createTcpPool initializes a TCP connection pool for a Cloud SQL
// instance of MySQL.
const createTcpPool = async config => {
	// Note: Saving credentials in environment variables is convenient, but not
	// secure - consider a more secure solution such as
	// Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
	// keep secrets safe.
	const dbConfig = {
		host: process.env.INSTANCE_HOST, // e.g. '127.0.0.1'
		port: process.env.DB_PORT, // e.g. '3306'
		user: process.env.DB_USER, // e.g. 'my-db-user'
		password: process.env.DB_PASS, // e.g. 'my-db-password'
		database: process.env.DB_NAME, // e.g. 'my-database'
		// ... Specify additional properties here.
		...config,
	};
	// [END cloud_sql_mysql_mysql_connect_tcp]
	
	// (OPTIONAL) Configure SSL certificates
	// For deployments that connect directly to a Cloud SQL instance without
	// using the Cloud SQL Proxy, configuring SSL certificates will ensure the
	// connection is encrypted.
	if (process.env.DB_ROOT_CERT) {
		throw `todo: add file system cert reading`;
		/*
		dbConfig.ssl = {
			sslmode: 'verify-full',
			ca: fs.readFileSync(process.env.DB_ROOT_CERT), // e.g., '/path/to/my/server-ca.pem'
			key: fs.readFileSync(process.env.DB_KEY), // e.g. '/path/to/my/client-key.pem'
			cert: fs.readFileSync(process.env.DB_CERT), // e.g. '/path/to/my/client-cert.pem'
		};
		 */
	}
	console.log(`CreatePool(${JSON.stringify(dbConfig)})`);
	// [START cloud_sql_mysql_mysql_connect_tcp]
	// Establish a connection to the database.
	return mysql.createPool(dbConfig);
};



async function AllocateDatabaseInterface()
{
	const config = {
		// [START cloud_sql_mysql_mysql_limit]
		// 'connectionLimit' is the maximum number of connections the pool is allowed
		// to keep at once.
		connectionLimit: 5,
		// [END cloud_sql_mysql_mysql_limit]
		
		// [START cloud_sql_mysql_mysql_timeout]
		// 'connectTimeout' is the maximum number of milliseconds before a timeout
		// occurs during the initial connection to the database.
		connectTimeout: 10000, // 10 seconds
		// 'acquireTimeout' is the maximum number of milliseconds to wait when
		// checking out a connection from the pool before a timeout error occurs.
		acquireTimeout: 10000, // 10 seconds
		// 'waitForConnections' determines the pool's action when no connections are
		// free. If true, the request will queued and a connection will be presented
		// when ready. If false, the pool will call back with an error.
		waitForConnections: true, // Default: true
		// 'queueLimit' is the maximum number of requests for connections the pool
		// will queue at once before returning an error. If 0, there is no limit.
		queueLimit: 0, // Default: 0
		// [END cloud_sql_mysql_mysql_timeout]
		
		// [START cloud_sql_mysql_mysql_backoff]
		// The mysql module automatically uses exponential delays between failed
		// connection attempts.
		// [END cloud_sql_mysql_mysql_backoff]
	};
	
	// Check if a Secret Manager secret version is defined
	// If a version is defined, retrieve the secret from Secret Manager and set as the DB_PASS
	const {CLOUD_SQL_CREDENTIALS_SECRET} = process.env;
	if (CLOUD_SQL_CREDENTIALS_SECRET) 
	{
		const secrets = await accessSecretVersion(CLOUD_SQL_CREDENTIALS_SECRET);
		try {
			process.env.DB_PASS = secrets.toString();
		} catch (err) {
			err.message = `Unable to parse secret from Secret Manager. Make sure that the secret is JSON formatted: \n ${err.message} `;
			throw err;
		}
	}
	
	if (process.env.INSTANCE_HOST) {
		// Use a TCP socket when INSTANCE_HOST (e.g., 127.0.0.1) is defined
		return createTcpPool(config);
	} else if (process.env.INSTANCE_UNIX_SOCKET) {
		// Use a Unix socket when INSTANCE_UNIX_SOCKET (e.g., /cloudsql/proj:region:instance) is defined.
		return createUnixSocketPool(config);
	} else {
		throw 'Set either the `INSTANCE_HOST` or `INSTANCE_UNIX_SOCKET` environment variable.';
	}
}

let CachedDatabaseInterface = null;

export async function GetDatabaseInterface()
{
	if ( CachedDatabaseInterface )
	{
		//	todo: verify is still good
		return CachedDatabaseInterface;
	}
	
	CachedDatabaseInterface = await AllocateDatabaseInterface();
	return CachedDatabaseInterface;
}
export default GetDatabaseInterface;
