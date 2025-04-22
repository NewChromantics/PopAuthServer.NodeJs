/*

*/
import * as Express from 'express';
import * as Api from './Api.js';
import * as Params from './Params.js';
import * as Database from './Database.js';
import * as AppleAuth from './AppleAuth.js';

console.log(`Package Version; ${Params.Version}`);


//console.log(`Bootup list all users...`);
//Database.ListAllUsers().then(console.log).catch(console.error);


const CorsOrigin = Params.GetParam('CorsOrigin','*' );
const ErrorStatusCode = Params.GetInt('ErrorStatusCode',400);
const StaticFilesPath = Params.GetParam('StaticFilesPath','./PopAuthServer/');
const ListenPort = Params.GetInt('PORT',8888);	//	$PORT -> env PORT on google cloud
try
{
	const AllEnv = JSON.stringify(process.env,null,'\t');
	//console.log(`env (all) ${AllEnv}`);
}
catch(e)
{
	console.log(`env (all) error -> ${e}`);
}



const HttpServerApp = Express.default();

// Automatically parse request body as form data for application/x-www-form-urlencoded
//HttpServerApp.use(bodyParser.json()); // support json encoded bodies
HttpServerApp.use(Express.urlencoded({ extended: true }));

HttpServerApp.get('/', HandleRoot );
HttpServerApp.get(`/${Api.EndPoint_AppleAuthResult}`,HandleAppleAuthResultGet);
HttpServerApp.post(`/${Api.EndPoint_AppleAuthResult}`,HandleAppleAuthResult);
HttpServerApp.get(`/${Api.EndPoint_AppleAuthNotification}`,HandleAppleAuthNotificationGet);
HttpServerApp.post(`/${Api.EndPoint_AppleAuthNotification}`,HandleAppleAuthNotification);
HttpServerApp.get(`/${Api.EndPoint_ListUsers}`,HandleListUsers);
HttpServerApp.get(`/${Api.EndPoint_ResolveIdentity}`,HandleResolveIdentity);
HttpServerApp.use('/', Express.static(StaticFilesPath));

const HttpServer = HttpServerApp.listen( ListenPort, () => console.log( `Http server on ${JSON.stringify(HttpServer.address())}` ) );


function SetServerMeta(Meta)
{
	Meta.ServerVersion = Params.Version;
}


async function HandleRequest(Request,Response,Functor)
{
	try
	{
		const Output = await Functor();
		
		if ( typeof Output == typeof 'string' )
		{
			const IsHtml = Output.includes('<html>');
			const Mime = IsHtml ? 'text/html' : 'text/plain';
			Response.statusCode = 200;
			Response.setHeader('Content-Type',Mime);
			Response.setHeader('Access-Control-Allow-Origin',CorsOrigin);
			Response.end(Output);
			return;
		}
		else if ( typeof Output == typeof {} )
		{
			SetServerMeta(Output);

			const Json = JSON.stringify( Output, null, '\t' );
			Response.setHeader('Content-Type','application/json');
			Response.setHeader('Access-Control-Allow-Origin',CorsOrigin);
			Response.end(Json);
			return;
		}
		throw `Unhandled output type(${typeof Output}); ${Output}`;
	}
	catch (e)
	{
		console.log(`HandleRequest(${Request.url}) error -> ${e}`);
		Response.statusCode = ErrorStatusCode;
		Response.setHeader('Content-Type','text/plain');
		Response.end(`Error: ${e}`);
	}
}


async function HandleRoot(Request,Response)
{
	async function Run()
	{
		const Html = `
		<html><body>
		<h1>Auth Server ${Params.Version}</h1>
		<ul>
		</ul>
		</body></html>`;
		return Html;
	}
	await HandleRequest( Request, Response, Run );
	
}



async function HandleAppleAuthNotificationGet(Request,Response)
{
	throw `Unexpected apple auth notification with GET`;
}

async function HandleAppleAuthNotification(Request,Response)
{
	throw `todo: handle apple notification`;
}

//	https://developer.apple.com/documentation/signinwithapple/configuring-your-webpage-for-sign-in-with-apple
//	After the user clicks the Sign in with Apple button,
//	the framework sends the authorization information to 
//	Apple. Apple processes the authorization request, and 
//	sends an HTTP POST request containing the results of 
//	the authorization to the URL provided in redirectURI. 
//	The HTTP body contains the result parameters with a
//	content-type of application/x-www-form-urlencoded. 
//	A successful response contains the following parameters:
async function HandleAppleAuthResultGet(Request,Response)
{
	async function Run()
	{
		throw `Unexpected apple auth result with GET`;
	}
	await HandleRequest( Request, Response, Run );
}

async function HandleAppleAuthResult(Request,Response)
{
	async function Run()
	{
		console.log(`HandleAppleAuthResult Query: ${JSON.stringify(Request.body)}`);
		const Params = Request.body ?? {};
		const Result = await AppleAuth.HandleAuthResult(Params);
		
		//	result should be a page displayed to user? (for web)
		//	gr: what result should come back?? just 200?
		//		cant find documentation
		return Result ?? `Auth Accepted`;
	}
	await HandleRequest( Request, Response, Run );
}


async function HandleListUsers(Request,Response)
{
	async function Run()
	{
		const Users = await Database.ListAllUsers();
		
		const ResultJson = {};
		ResultJson.Users = Users;
		return ResultJson;
	}
	await HandleRequest( Request, Response, Run );
}



async function HandleResolveIdentity(Request,Response)
{
	async function Run()
	{
		const Params = Request.query ?? {};
		const IdentityToken = Request.query[Api.EndPoint_ResolveIdentity_Param_IdentityToken];
		const Result = await AppleAuth.ResolveIdentityToAuthUid(IdentityToken);
		
		return Result;
	}
	await HandleRequest( Request, Response, Run );
}

