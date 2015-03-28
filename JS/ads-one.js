


/*
* ads
*/

/**
 * Initial Setup
 */

var adDebug = false;

var adBase = 'http://ad.doubleclick.net/';
var adType = 'adj/';
var adSiteZone = 'heavy10.hp/homepage';
var adDefaultParams = {};

// Random number to use throughout ads
var ord = Math.random().toString().substr( 2 );
var ordMatch = window.location.search.match( /ord=([^&]*)/i );
if ( ordMatch ) { ord = ordMatch[1]; }

// Tiles increment down the page
var adTile = 0;

// Delay between individual ad units refreshing
var adRefreshDelay = 20;

// Delay between allowing calls to refreshAds()
var adRefreshReload = 200;
var adRefreshDisabled = false;

// Store ad parameters before a refresh so they aren't lost
var adParameterCache = {};

// Queue add calls
var adQueue = [];
var adDelayTimeout;

// Ad freezing minimizes randomly resizing DIVs during ad refreshes
var adFreezeDelay = 500;
var adFreezeTimeout;

/**
 * Generates an ad tag with optional parameters
 */
function generateTag ( parameters, justURL )
{
	if ( typeof parameters == 'undefined' ) { parameters = adDefaultParams; }
	else { parameters = jQuery.extend( {}, adDefaultParams, parameters ); }
	
	// Defaults
	var base = adBase;
	var type = adType;
	var siteZone = adSiteZone;
	var extras = '';
	
	// Use specified parameters
	base = pHelpr( parameters, 'base', base );
	type = pHelpr( parameters, 'type', type );
	siteZone = pHelpr( parameters, 'siteZone', siteZone );
	
	if ( pHaz( parameters, ['site','zone'] ) ) { siteZone = parameters.site + '/' + parameters.zone; };
	
	extras += pHelprP( parameters, 'keywords', ';kw=' );
	extras += pHelprP( parameters, 'categories', ';z=' );
	extras += pHelprP( parameters, 'c', ';!c=' );
	
	extras += pHelprP( parameters, 'position', ';pos=' );
	extras += pHelprP( parameters, 'dcopt', ';dcopt=' );
	extras += pHelprP( parameters, 'size', ';sz=' );
	
	extras += pHelprP( parameters, 'target', ';' );
	
	extras += pHelprP( parameters, 'dcmt', ';dcmt=' );
	
	if ( pHelpr( parameters, 'tile' ) != 'auto' )
		{ extras += pHelprP( parameters, 'tile', ';tile=' ); }
	else
		{ extras += ';tile=' + ( ++adTile ); }
	extras += pHelprP( parameters, 'ord', ';ord=', ';ord=' + ord );
	
	var adURL = base + type + siteZone + extras;
	
	if ( justURL ) { return adURL; }
	
	var html = '<scr' + 'ipt type="text/javascript" src="' + adURL + '"></scr' + 'ipt>';
	
	return html;
}

function generateTagURL ( parameters, justURL )
	{ return generateTag( parameters, true ); }

/**
 * Returns true if the specified parameters are defined
 */
function pHaz ( parameters, desired, noBlank )
{
	if ( typeof desired == 'undefined' ) { return true; }
	if ( typeof desired == 'string' ) { desired = desired.split( ',' ); }
	
	// No blank strings allowed
	if ( typeof noBlank == 'undefined' || noBlank ) for ( var i = 0; i < desired.length; i++ )
	{
		try { if ( typeof parameters[desired[i]] == 'undefined' || parameters[desired[i]] == '' ) { return false; } }
		catch ( e ) { return false; }
	}
	// Blank strings allowed
	else for ( var i = 0; i < desired.length; i++ )
	{
		try { if ( typeof parameters[desired[i]] == 'undefined' ) { return false; } }
		catch ( e ) { return false; }
	}
	
	return true;
}

/**
 * Gets the specified parameter from the parameters object or returns the default value
 */
function pHelpr ( parameters, name, defaultValue )
	{ return pHelprP( parameters, name, '', defaultValue ); }

/**
 * Gets the specified parameter from the parameters object with another string prepended or returns the default value
 */
function pHelprP ( parameters, name, prepend, defaultValue )
{
	if ( typeof prepend == 'undefined' ) { prepend = ''; }
	if ( typeof defaultValue == 'undefined' ) { defaultValue = ''; }
	try
	{
		if ( typeof parameters[name] == 'undefined' ) { return defaultValue; }
		else { return prepend + parameters[name]; }
	}
	catch ( e ) { return defaultValue; }
}

/**
 * Sniffs the parameters of all ads
 */
function sniffAllAdParameters ()
{
	jQuery( '.ad' ).each( function ( i, ad ) {
		sniffAdParameters( ad, adParameterCache[ad.id] );
	} );
}

/**
 * Given an object, tries to find an appropriate ad URL and sniff its parameters
 */
function sniffAdParameters ( ad, defaults )
{
	var parameters = typeof defaults == 'undefined' ? {} : defaults;
	// Loop through all the <script> tags
	var scriptSrc;
	jQuery( ad ).find( 'script' ).each( function ( i, object ) {
		scriptSrc = jQuery( object ).attr( 'src' );
		if ( typeof scriptSrc == 'undefined' || scriptSrc.indexOf( adBase ) < 0 ) { return; }
		var params = scriptSrc.split( ';' );
		// Set the siteZone
		params[0] = params[0].match( /(.*\/)([^\/]+\/)([^\/]+)\/([^\/]+)/ );
		parameters['base'] = params[0][1];
		parameters['type'] = params[0][2];
		parameters['site'] = params[0][3];
		parameters['zone'] = params[0][4];
		// Loop through parameters
		var key, value;
		var fC = true; // First category
		for ( var j = 1; j < params.length; j++ )
		{
			params[j] = params[j].match( /([^=]*)=(.*)/ );
			key = params[j][1];
			value = params[j][2];
			switch ( key )
			{
				case 'kw':
					parameters['keywords'] = value; break;
				case 'z':
					if ( fC || typeof parameters['categories'] == 'undefined' )
					{
						parameters['categories'] = '';
						fC = false;
					}
					if ( parameters['categories'] != '' )
						{ parameters['categories'] += ','; }
					parameters['categories'] += value; break;
				case '!c':
					parameters['c'] = value; break;
				case 'pos':
					parameters['position'] = value; break;
				case 'sz':
					parameters['size'] = value; break;
				case 'test':
					parameters['target'] = params[j][0]; break;
				case 'ord':
					//parameters[key] = Math.random().toString().substr( 2 ); break;
				case 'dcopt':
				case 'sz':
				case 'tile':
				case 'dcmt':
				default:
					parameters[key] = value; break;
			}
		}
	} );
	// Shake up the ord
	if ( typeof parameters['ord'] != 'undefined' )
		{ parameters['ord'] = ord; }
	// Save parameters
	adParameterCache[ ad.id ] = parameters;
	// Done
	return parameters;
}

/**
 * Refreshes all ads on the page
 */
function refreshAds ( stripParams, delay )
{
	if ( adRefreshDisabled ) { return false; }
	if ( adDebug ) { console.log( 'refreshAds()' ); }
	disableAdRefresh( adRefreshReload );
	freezeAdSizes();
	if ( typeof delay == 'undefined' ) { delay = true; }
	// Stop any current refreshes
	clearTimeout( adDelayTimeout );
	// Shuffle randomizer
	ord = Math.random().toString().substr( 2 );
	adTile = 0;
	// Go through ads
	jQuery( '.ad' ).each( function ( i, object ) {
		if ( delay ) 
			{ enqueueAd( object, stripParams ); }
		else
			{ refreshAd( object, stripParams ); }
	} );
	processAdQueue( delay );
}

/**
 * Refreshes the ad inside of the specified div
 */
function refreshAd ( ad, stripParams )
{
	if ( typeof ad == 'undefined' ) { ad = 0; }
	if ( typeof ad == 'number' )
		{ ad = jQuery( '.ad' )[ad]; }
	var adParameters = sniffAdParameters( ad, adParameterCache[ad.id] );
	// Strip ad parameters
	switch ( typeof stripParams )
	{
		case 'string':
			stripParams = stripParams.split( ',' );
		case 'object':
			for ( var i = 0; i < stripParams.length; i++ )
				{ delete adParameters[stripParams[i]]; }
			break;
		case 'number':
			delete adParameters[stripParam];
		default: break;
	}
	// Generate tag
	var adTag = generateTag( adParameters );
	if ( adDebug ) { console.log( 'adTag generated for ' + ad.id + ': ' + adTag ); }
	jQuery( ad ).empty().append( adTag );
}

/**
 * Enables ad refresh
 */
function enableAdRefresh ( until )
{
	adRefreshDisabled = false;
	if ( typeof until == 'number' )
		{ setTimeout( disableAdRefresh, adRefreshReload ); }
}

/**
 * Disables ad refresh
 */
function disableAdRefresh ( until )
{
	adRefreshDisabled = true;
	if ( typeof until == 'number' )
		{ setTimeout( enableAdRefresh, adRefreshReload ); }
}

/**
 * Sticks an ad into the queue
 */
function enqueueAd ( ad, stripParams )
	{ adQueue.push( { object:ad, stripParams:stripParams } ); }

/**
 * Bumps the next thing out of the ad queue
 */
function processAdQueue ( delay )
{
	if ( typeof delay == 'undefined' ) { delay = false; }
	if ( !delay )
	{
		var ad = adQueue.shift();
		if ( typeof ad == 'undefined' )
		{
			removeRogueDivs();
			unfreezeAdSizes( adFreezeDelay );
			return false;
		}
		refreshAd( ad['object'], ad['stripParams'] );
	}
	adDelayTimeout = setTimeout( processAdQueue, adRefreshDelay );
	return !delay;
}

/**
 * Function called when the wrapper is clicked
 */
function clickWrapper ()
{
	var url = jQuery( '#background' ).find( 'a' ).attr( 'href' );
	if ( typeof url != 'undefined' && url != '' )
		{ window.open( url, '_blank' ); }
}
jQuery( document.body ).ready( function () {
	jQuery( '#background' ).click( function ( event ) {
		event.preventDefault();
		clickWrapper();
	} );
} );

/**
 * Removes unrecognized <div> tags that are immediate children of the <body> tag
 */
function removeRogueDivs ( safeIDs )
{
	if ( typeof safeIDs == 'undefined' )
		{ safeIDs = [ 'gigya_ruler', 'content', 'background', 'social-bar', 'fb-root' ]; }
	else if ( typeof safeIDs == 'string' )
		{ safeIDs = safeIDs.split( ',' ); }
	jQuery( document.body ).children( 'div' ).each( function ( i, object ) {
		if ( object.id == 'undefined' || safeIDs.indexOf( object.id  ) < 0 )
			{ jQuery( object ).remove(); }
	} );
}


/**
 * Applies the current size of all the ad units
 */
function freezeAdSizes ( delay )
{
	clearTimeout( adFreezeTimeout );
	if ( typeof delay == 'number' && delay > 0 )
		{ adFreezeTimeout = setTimeout( freezeAdSizes, delay ); return; }
	jQuery( '.ad' ).each( function ( i, object ) {
		object = jQuery( object );
		object.css( {
			'width': object.width(),
			'height': object.height()
		} );
	} );
}

/**
 * Allows all ad units to size things however they want
 */
function unfreezeAdSizes ( delay )
{
	clearTimeout( adFreezeTimeout );
	if ( typeof delay == 'number' && delay > 0 )
		{ adFreezeTimeout = setTimeout( unfreezeAdSizes, delay ); return; }
	jQuery( '.ad' ).each( function ( i, object ) {
		object = jQuery( object );
		object.css( {
			'width': 'auto',
			'height': 'auto'
		} );
	} );
}















/*
* lagacy ads
*/
// Legacy Ad object emulates the old convoluted ad system, more or less
function LegacyAd () {}

LegacyAd.prototype.init = function ( id, properties )
{
	this.id = id;
	var value;
	for ( var key in properties )
	{
		value = properties[key];
		switch ( key )
		{
			case 'width':
				this.width = value; break;
			case 'height':
				this.height = value; break;
			default:
				try { console.log( 'Bad property: ' + key ); }
				catch ( error ) {}
				break;
		}
	}
};

LegacyAd.prototype.object = function ()
	{ return jQuery( '#' + this.id ); }

LegacyAd.prototype.serveAd = function ()
{
	for ( var i = 0; i < arguments.length; i++ )
	{
		if ( !arguments[i] )
			{ continue; }
		else switch ( typeof arguments[i] )
		{
			case 'string':
			default:
				if ( adDebug ) { console.log( 'Serving on ' + this.id + ': ' + arguments[i] ); }
				this.object().append( arguments[i] );
				break;
			case 'object':
				if ( typeof arguments[i].callback == 'function' )
					{ arguments[i].callback(); }
				break;
			case 'function':
				arguments[i]();
				break;
		}
	}
};

LegacyAd.prototype.clear = function ()
	{ this.object.empty(); };

LegacyAd.prototype.serveImageAd = function ( src, href )
	{ return this.serveAd( this.addImgLink( src, href ) ); }

LegacyAd.prototype.serveFlashAd = function ( src, href, width, height, flashVars )
	{ return this.serveAd( this.addSWF( src, href, width, height, flashVars ) ); }

LegacyAd.prototype.setBackgroundAd = function ( src, href )
{
	if ( typeof src == 'undefined' || src == '' ) { return false; }
	var html = '<img src="' + src + '" border="0"/>';
	if ( typeof href != 'undefined' && href != '' )
		{ html = '<a href="' + href + '" target="_blank">' + html + '</a>'; }
	return html;
};
LegacyAd.prototype.addImgLink = function ( src, href )
{
	if ( typeof src == 'undefined' || src == '' ) { return false; }
	var html = '<img src="' + src + '" border="0"/>';
	if ( typeof href != 'undefined' && href != '' )
		{ html = '<a href="' + href + '" target="_blank">' + html + '</a>'; }
	return html;
};
LegacyAd.prototype.addImage = function ( href, src )
{
	if ( typeof src == 'undefined' || src == '' ) { return false; }
	var html = '<img src="' + src + '" border="0"/>';
	if ( typeof href != 'undefined' && href != '' )
		{ html = '<a href="' + href + '" target="_blank">' + html + '</a>'; }
	return html;
};
LegacyAd.prototype.addSWF = function ( src, href, width, height, flashVars )
{
	if ( typeof width == 'undefined' ) { width = this.width; }
	if ( typeof height == 'undefined' ) { height = this.height; }
	if ( typeof flashVars == 'undefined' ) { flashVars = {}; }
	else if ( typeof flashVars == 'string' )
	{
		params = flashVars.split( ',' );
		flashVars = {};
		var key, value;
		for ( var j = 0; j < params.length; j++ )
		{
			params[j] = params[j].match( /([^=]*)=(.*)/ );
			if ( !params[j] ) { continue; }
			key = params[j][1];
			value = params[j][2];
			flashVars[key] = value;
		}
	}
	if ( typeof src == 'undefined' || src == '' ) { return false; }
	
	var divID = 'adSwf' + Math.random().toString().substr( 2 );
	var params = { wmode: 'transparent', base: src.replace( /(.*\/)([^\/]+)/i, '$1' ) };
	flashVars['clickTag'] = href;
	flashVars['clickTAG'] = href;
	
	var html = '<div id="' + divID + '"></div>';
	html += '<scr' + 'ipt type="text/javascript">';
	html += 'swfobject.embedSWF( \'' + src + '\', \'' + divID + '\', ' + width + ', ' + height + ', \'9.0.0\', \'\', ' + objToJSON( flashVars ) + ', ' + objToJSON( params ) + ' );';
	html += '</scr' + 'ipt>';
	return html;
};
LegacyAd.prototype.addPixel = function ( src )
{
	if ( typeof src == 'undefined' || src == '' ) { return false; }
	var html = '<img src="' + src + '"/>';
	return html;
};
LegacyAd.prototype.objectMerge = function ( object1, object2 )
{
	var merged = {}
	for ( key in object2 )
		{ merged[key] = object2[key]; }
	for ( key in object1 )
		{ merged[key] = object1[key]; }
	return merged;
}

// MRec
MRecAd.prototype = new LegacyAd;
function MRecAd ( id, properties )
{
	if ( typeof properties != 'undefined' ) { properties = {}; }
	this.init( id, this.objectMerge( {
		width: 300,
		height: 250
	}, properties ) );
}
var heavyMRec = new MRecAd( 'primary' );
var primary = heavyMRec;

// Marquee/Leaderboard
MarqueeAd.prototype = new LegacyAd;
function MarqueeAd ( id, properties )
{
	if ( typeof properties != 'undefined' ) { properties = {}; }
	this.init( id, this.objectMerge( {
		width: 990,
		height: 100
	}, properties ) );
}
var heavyMarquee = new MarqueeAd( 'marquee' );
var secondary = heavyMarquee;


// Operational Slot
OperationalAd.prototype = new LegacyAd;
function OperationalAd ( id, properties )
{
	if ( typeof properties != 'undefined' ) { properties = {}; }
	this.init( id, this.objectMerge( {
		width: 19,
		height: 190
	}, properties ) );
}
var heavyOperational = new OperationalAd( 'operational' );
var operational = heavyOperational;

// Wrapper/Background
WrapperAd.prototype = new LegacyAd;
function WrapperAd ( id, properties )
{
	if ( typeof properties != 'undefined' ) { properties = {}; }
	this.init( id, this.objectMerge( {
		width: 1440,
		height: 1080
	}, properties ) );
}
var heavyWrapper = new WrapperAd( 'wrapper' );
var background = heavyWrapper;

// Text Link
TextLinkAd.prototype = new LegacyAd;
function TextLinkAd ( id, properties )
{
	if ( typeof properties != 'undefined' ) { properties = {}; }
	this.init( id, this.objectMerge( {
		width: 180,
		height: 18
	}, properties ) );
}
var heavyTextLink = new TextLinkAd( 'textlink' );
var textlink = heavyTextLink;




