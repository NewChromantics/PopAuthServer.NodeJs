//	pull some params out of package.json
//	node 22 now uses  with {} instead of assert{}
import PackageJson from './package.json' with { "type": "json" }


function GetVersion()
{
	//	"version": "0.0.1",
	const VersionString = PackageJson.version;
	if ( typeof VersionString != typeof '' )
		throw `PackageJson.Version isn't a string; ${VersionString}`;
	
	const VersionParts = VersionString.split('.').map( n => parseInt(n) );
	if ( VersionParts.find( n => !Number.isInteger(n) ) )
		throw `PackageJson.Version (${VersionParts}) not parsed as integers`;
	
	return VersionParts;
}
	


function TypeifyValue(ValueString)
{
	//	already not-a-string so don't change it
	if ( typeof ValueString != typeof '' )
		return ValueString;
	
	switch ( ValueString.toLowerCase().trim() )
	{
		case 'false':
			return false;
			
		case 'true':
			return true;
	}
	
	//	todo? spot ints

	//	no change
	return ValueString;
}



function GetParams()
{
	const Params = {};
	
	Params.Version = GetVersion();
	
	function ParseCommandLineArg(Argument)
	{
		const Parts = Argument.split('=');
		let Key = Parts.shift();
		
		//	trim - or --
		while ( Key.startsWith('-') )
			Key = Key.slice(1);
		
		//	ignore empty param
		if ( Key.length == 0 )
		{
			console.warn(`Got empty line param [${Key}]`);
			return;
		}
		
		//	make all params lowercase
		Key = Key.toLowerCase();
		
		//	keep anything with = in the value
		let Value = Parts.join('=');
		//	default non-value'd arguments to true to indicate presence
		if ( Value.length == 0 )
			Value = true;
		
		//	turn false and true keywords into bools, so that "false" == false
		Value = TypeifyValue(Value);
			
		//console.log(`Got command line param [${Key}]=[${Value}]`);
		Params[Key] = Value;
	}
	
	process.argv.forEach(ParseCommandLineArg);
	return Params;
}

const Params = GetParams();


export function GetInt(Key,DefaultValueIfMissing)
{
	let Value = GetParam( Key, DefaultValueIfMissing );
	
	const ValueNumber = Number(Value);	//	parseInt will turn "5aaaa" into 5

	//	gr: this catches NaN
	if ( !Number.isInteger(ValueNumber) )
		throw `${Value}(${Key}) needs to be integer`;
	
	return Value;
}


//	if you specify a default, this wont throw and instead return the default
export function GetParam(Key,DefaultValueIfMissing=undefined)
{
	//	gr: lower case only applies to CLI
	let CliKey = Key.toLowerCase();
	
	//	CLI args get priority
	if ( Params.hasOwnProperty(CliKey) )
		return Params[CliKey];

	/*
	//	try github inputs
	const InputValue = core.getInput(Key);
	if ( InputValue )
		return InputValue;
	*/
	//	now try env var
	if ( process.env.hasOwnProperty(Key) )
		return process.env[Key];
	
	if ( DefaultValueIfMissing === undefined )
		throw `Missing required parameter, github input or env var "${Key}"`;
	
	return DefaultValueIfMissing;
}


//	some helpful consistent exports
export const Version = Params.Version;

export default Params;
