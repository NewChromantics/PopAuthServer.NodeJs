import * as Database from './Database.js';


//	https://developer.apple.com/documentation/signinwithapple/configuring-your-webpage-for-sign-in-with-apple
export async function HandleAuthResult(Params)
{
	//	gr: temp: log entire request to database in a new entry
	await Database.WriteDebugAuthRequest(Params);
	
	return "OK";
	
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

