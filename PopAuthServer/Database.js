/*
 
 API into database 
 
*/
import GetDatabaseInterface from './GoogleCloudSql.js'

const UserTableName = 'auth';

export async function ListAllUsers()
{
	//	get sql connection
	const Sql = await GetDatabaseInterface();

	//	this returns array of objects, keyd to their column!	
	const Query = `SELECT * from ${UserTableName}`;
	const Result = await Sql.query(Query);
	
	return Result;
	
	console.log(`result=${JSON.stringify(Result)}`);
	
	//	for each row
	//	get each column
	
	//	todo: auto detect columns
	const Columns = [
					 'user_uid',
					 'apple_uid','apple_jwt','apple_laststate','apple_userjson'
					 ];

	const Users = [];
	return Users;
}


export async function FindUserWithAppleId(AppleUid)
{
	//	get sql connection
	//	find user with uid
	
}


export async function GetOrCreateUserWithAppleUid(AppleUid)
{
	const ExistingEntry = await FindUserWithAppleId(AppleUid);
	
	//	get sql connection
	//	find user with uid
	//	if none, create
	
}

