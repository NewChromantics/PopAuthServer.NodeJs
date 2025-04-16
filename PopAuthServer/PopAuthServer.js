/*

*/
import * as Express from 'express';
import * as Api from './Api.js'
import * as Params from './Params.js'

console.log(`Package Version; ${Params.Version}`);



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
HttpServerApp.get('/', HandleRoot );
HttpServerApp.get(`/${Api.EndPoint_AppleAuthResult}`,HandleAppleAuthResultGet);
HttpServerApp.post(`/${Api.EndPoint_AppleAuthResult}`,HandleAppleAuthResult);
HttpServerApp.get(`/${Api.EndPoint_AppleAuthNotification}`,HandleAppleAuthNotificationGet);
HttpServerApp.post(`/${Api.EndPoint_AppleAuthNotification}`,HandleAppleAuthNotification);
//HttpServerApp.get(`/${Api.EndPoint_JoinPublicGame}`,HandleJoinPublicGame);
HttpServerApp.use('/', Express.static(StaticFilesPath));

const HttpServer = HttpServerApp.listen( ListenPort, () => console.log( `Http server on ${JSON.stringify(HttpServer.address())}` ) );



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
			SetMasterServerMeta(Output);

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
		console.log(`HandleRequest error -> ${e}`);
		Response.statusCode = ErrorStatusCode;
		Response.setHeader('Content-Type','text/plain');
		Response.end(`Error ${e}`);
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
	throw `Unexpected apple auth result with GET`;
}

async function HandleAppleAuthResult(Request,Response)
{
	//	get params from request POST
	//	HandleAuthResult(Params)
	throw `todo: handle apple auth`;
}

