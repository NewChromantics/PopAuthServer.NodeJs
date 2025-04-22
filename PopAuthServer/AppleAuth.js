import * as Database from './Database.js';
import * as AppleSignIn from 'apple-signin-auth';


//	https://developer.apple.com/documentation/signinwithapple/configuring-your-webpage-for-sign-in-with-apple
export async function HandleAuthResult(Params)
{
	console.log(`Auth request ${JSON.stringify(Params)}`);
	
	try
	{
		//	gr: temp: log entire request to database in a new entry
		//await Database.WriteDebugAuthRequest(Params);
	}
	catch(e)
	{
		console.error(`${e}`);
	}

	const ResultMeta = {};
	ResultMeta.IdentityToken = Params.id_token;
	ResultMeta.AuthUid = `Some Auth Uid`;
	
	return ResultMeta;
	
	/*
	//	state here provided same as on web
	{
		"state":"[STATE]",
		"code":"c1632f3ba08a7466cb7bf5f96fb6ac4ff.0.pzvw.vjiG6Y-7FOrd5UEl5FwVOQ",
		"id_token":"eyJraWQiOiJkTWxFUkJhRmRLIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiY29tLm5ld2Nocm9tYW50aWNzLm5vdHBva2VyLmFwcGxlc2lnbmluIiwiZXhwIjoxNzQ0OTAzMDM2LCJpYXQiOjE3NDQ4MTY2MzYsInN1YiI6IjAwMDk1Ni41YWM2YjBjN2M0ODI0NjAzYWMwMWFiMDgxNzNlMGY0OS4xMDAxIiwibm9uY2UiOiJbTk9OQ0VdIiwiY19oYXNoIjoiTTFoeGkybVpNTzk0MFN5UE9RaWtTdyIsImVtYWlsIjoicnA4YmtyOTQ1aEBwcml2YXRlcmVsYXkuYXBwbGVpZC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNfcHJpdmF0ZV9lbWFpbCI6dHJ1ZSwiYXV0aF90aW1lIjoxNzQ0ODE2NjM2LCJub25jZV9zdXBwb3J0ZWQiOnRydWV9.fnt5W-09AuAHVsMuKhLIo0pXyt1E1P0okN1coT7fYfG7RBg2FrEg5fCv3-EH88Dr9zH7l4LebWf2RA3u8Zu-1J3BpxuEBJhc5wxFQj-nexTmxIldwzMkePnRujudRk_vj7nU1ZduL_NHr0GSpVRSEaJf04IcZKZUK1Jp1RRoveUdoUi5re6W2Nasc6esaq6coktq3L5KY-_4IMUFRYtDizB_drxAfy_tLwlAxH6GKFcPGcErGursqjs_7IIzosGxMaW8fHmqrGSzo_sFfxQM0L02bEq2BEAqvaXTrlEIhJ8kw-Qfm82zl3FBllFru4q_NnEsTqxu4KXL0er7mWlt_Q"
	}*/
	
	//	if we dont have jwt, we can't identify the user at all
	//	and can't write anything (debug) to our own database
	if ( !Params.id_token )
	{
		throw `Apple auth missing id_token`;
	}
	/*
	code
	A single-use authentication code that expires after five minutes. To learn how to validate this code to obtain user tokens, see Generate and validate tokens.
	
	id_token
	A JSON web token (JWT) containing the user’s identification information. For more information, see Authenticating users with Sign in with Apple.
	
	state
	An arbitrary string passed by the init function, representing the current state of the authorization request. This value is also used to mitigate cross-site request forgery attacks, by comparing against the state value contained in the authorization response.
	
	user
	A JSON string containing the data requested in the scope property. The returned data is in the following format:
	
	{ "name": { "firstName": string, "lastName": string }, "email": string }
	 
	 
	 
	 

	 
	 If an error occurs, the HTTP body contains the following parameters:
	 
	 error
	 The returned error code.
	 
	 state
	 The state passed by the init function. Compare against the state value provided in the initial authorization request to mitigate cross-site request forgery attacks.
	 */
}

async function GetAuthUidFromAppleUserUid(AppleUserUid)
{
	//	check database for a user with this Uid
	//	we know the uid is valid (it's from apple)
	//	so we can create an account here! 
	
	//await Database.GetAuthUidFromAppleUserUid(AppleUserUid);

	return AppleUserUid;
}

export async function ResolveIdentityToAuthUid(IdentityToken)
{
	if ( !IdentityToken )
		throw `Missing IdentityToken`;
	
	const VerifyParams = {};
	VerifyParams.audience = 'com.newchromantics.notpoker.applesignin';
	//	this nonce is expected to match the original provided to get this identity token (jwt)
	//	gr: we could just read it from the jwt? is it in there?
	VerifyParams.nonce = 'nonce';
	VerifyParams.ignoreExpiration = false;
	
	const Resolved = await AppleSignIn.verifyIdToken(IdentityToken,VerifyParams);
	
	if ( Resolved.iss != 'https://appleid.apple.com' )
		throw `Verified from wrong source`;
	
	const AppleUserUid = Resolved.sub;
	const UserEmail = Resolved.email;
	//	iss: 'https://appleid.apple.com',
	//	aud: your service id
	//	exp: 1745436766,
	//	iat: 1745350366,
	//	sub: 'your persistent apple user id',
	//	nonce: 'nonce',
	//	email_verified: true,
	//	is_private_email: true,
	//	auth_time: 1745350366,
	//	nonce_supported: true
	
	const AuthUid = await GetAuthUidFromAppleUserUid(AppleUserUid);
	
	const ResultMeta = {};
	ResultMeta.AuthUid = AuthUid;
	
	return ResultMeta;
}
