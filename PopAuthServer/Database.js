/*
 
 API into database 
 
*/
import GetDatabaseInterface from './GoogleCloudSql.js'
import SqlString from 'sqlstring'

const UserTableName = 'auth';
const DebugJsonColumn = 'debug_json';
const UserUidColumn = 'auth_uid';
const AppleUidColumn = 'apple_uid';




export class MissingUserException extends Error
{
	constructor(message) 
	{
		super(message);
		this.name = "MissingUserException";
	}
}

export async function ListAllUsers()
{
	//	get sql connection
	const Sql = await GetDatabaseInterface();

	//	this returns array of objects, keyd to their column!	
	const Query = `SELECT * from ${UserTableName}`;
	const Result = await Sql.query(Query);
	
	//console.log(`result=${JSON.stringify(Result)}`);
	return Result;
}


export async function WriteDebugAuthRequest(Params)
{
	const ParamsJson = JSON.stringify(Params);
	const ParamsJsonValue = SqlString.escape(ParamsJson);

	const NowMs = new Date().getTime();
	const UserUid = `Debug_${NowMs}`;
	
	//	run sql query
	const Sql = await GetDatabaseInterface();
	const Query = `INSERT INTO ${UserTableName} (${UserUidColumn},${DebugJsonColumn})
					VALUES ('${UserUid}','${ParamsJsonValue}');
					`;
	await Sql.query(Query);
}


export async function GetAuthUidFromAppleUserUid(AppleUserUid)
{
	if ( !AppleUserUid )
		throw `Missing AppleUserUid`;
	
	//	this escape adds '' to string
	const AppleUserUidValue = SqlString.escape(AppleUserUid);
	
	//	run sql query
	const Query = `SELECT ${UserUidColumn} from ${UserTableName} where ${AppleUidColumn}=${AppleUserUidValue}`;
	const Sql = await GetDatabaseInterface();
	const Matches = await Sql.query(Query);
	if ( Matches == null )
		throw `Unexpected null from query`;
	
	if ( Matches.length == 0 )
		throw new MissingUserException(`No matching AuthUid for AppleUid(${AppleUserUid})`);
	
	if ( Matches.length > 1 )
	{
		console.log(`GetAuthUid query result`,Matches);
		throw `Multiple (${Matches.length}) AuthUids for AppleUid(${AppleUserUid})`;
	}
	
	const Match = Matches[0];
	const AuthUid = Match[UserUidColumn] ?? "";
	//console.log(`AppleUid match`,Match);
	
	//	database should have auto filled this in if allocated
	if ( AuthUid.length == 0 )
	{
		console.warn(`authuid empty for appleuid match`,Matches);
		throw `AuthUid for apple Uid(${AppleUserUid}) is empty (${AuthUid})`;
	}

	return AuthUid;
}


export async function GetOrCreateAuthUidFromAppleUserUid(AppleUserUid)
{
	if ( !AppleUserUid )
		throw `Missing AppleUserUid`;

	try
	{
		const ExistingAuthUid = await GetAuthUidFromAppleUserUid(AppleUserUid);
		return ExistingAuthUid;
	}
	catch(e)
	{
		if ( e instanceof MissingUserException )
		{
			//	fall through
		}
		else // real error, re-throw
		{
			throw e;
		}
	}
	
	const Sql = await GetDatabaseInterface();
	const Query = `INSERT INTO ${UserTableName} (${AppleUidColumn})
		VALUES ('${AppleUserUid}');
	`;
	const InsertResult = await Sql.query(Query);
	if ( !InsertResult )
		throw `query resulted in null insert`;
	
	//console.log(`Insert result;`,InsertResult);
	//	OkPacket
	
	//	refetch new entry
	const NewAuthUid = await GetAuthUidFromAppleUserUid(AppleUserUid);
	return NewAuthUid;
}
