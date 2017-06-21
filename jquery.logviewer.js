;( 	
function( factory ) 
{
	// AMD. Register as an anonymous module.
	if( typeof define === "function" && define.amd ) { define( [ "jquery" ], factory );	} 
	// Browser globals
	else { factory( $ ); }
}

( function( $ ) 
{
	var logViewer = function( options ) 
	{
		//
		doLVHead = function( id ) 
		{
			$.ajax( { 
				type: "HEAD",
				url: logViewer.options.logUrl,
				cache: false,
				complete: function( xhr, textStatus ) 
				{
					if( textStatus === "success" ) 
					{
						var newLenght = parseInt( xhr.getResponseHeader( "Content-Length" ) );
						checkLVLength( newLenght );
					}
				}
			} );
		},
				
		// 
		checkLVLength = function( newLenght ) 
		{
			if( logViewer.curLenght != newLenght )
			{
				if( logViewer.curLenght > newLenght )
				{
					logViewer.curLenght = 0;
					$( "#" + logViewer.options.targetObjectID ).append( '\nReseting ... \n' );
				}
				
				var getBytes = logViewer.curLenght;
				var readBytes = parseInt( logViewer.options.readBytes);

				if( logViewer.curLenght === 0 && newLenght > readBytes )
				{
					getBytes = newLenght - readBytes;
				} 
				else if (logViewer.curLenght > 0)
				{
					getBytes--;
				}

				// Считываем следующий кусок лога
				$.ajax( {
					type: "GET",
					url: logViewer.options.logUrl,
					cache: false,
					
					success: function( data )
					{
						data = logViewer.options.callback.call( this, data );
						$( "#" + logViewer.options.targetObjectID ).append( cleanLVtags( data ) );
						
						var objDiv = document.getElementById( logViewer.options.targetObjectID );
						objDiv.scrollTop = objDiv.scrollHeight;
					},
					
					beforeSend: function( http ) 
					{
						http.setRequestHeader( 'Range', 'bytes=' + getBytes + '-' );
					}
				} );
			}
			
			logViewer.curLenght = newLenght;
			setMyTimeOut( );
		},
				
		//
		setMyTimeOut = function ( )
		{
			if( logViewer.timeoutID > 0 ) 
			{
				window.clearTimeout( logViewer.timeoutID );
			}
			
			logViewer.timeoutID = window.setTimeout( doLVHead, logViewer.options.refreshtimeout );
		},
			
		//
		cleanLVtags = function( html )
		{
			if ( typeof html === 'string') 
			{
				return html.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
			} 
			else
			{
				return html;
			}
		};

		// Функция инициализации плагина
		return { 
			init: function( options )
			{
				var options = options || {};
				
				if( options.logUrl === undefined ) 
				{
					alert( 'Log URL missing' );
					return false;
				}
				
				options.refreshtimeout = options.refreshtimeout || '2000';
				options.readBytes = options.readBytes  || 10000;
				options.callback = options.callback || function( data ) { return data; };
				options.targetObjectID = $( this ).attr( 'id' );

				logViewer.options = options;
				logViewer.curLenght = 0;
				logViewer.curLenght = 0;

				doLVHead( );
			}
		};
	}( );

	// Прописываем плагин
	$.fn.extend( {
		logViewer: logViewer.init
	} );

} ) );
