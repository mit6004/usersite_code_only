
// public methods

function display_video(params)
{
    params = set_defaults(params);
      
    // define the video here
    var qtEmbed = QT_GenerateOBJECTText_XHTML(
    		params['movie_source'], 
    		params['width'],
    		params['height'],
    		'', // required blacnk field
    		'enablejavascript', 'true',
    		'obj#id', 'movie1',
    		'emb#name', 'movie1',
    		'emb#id', 'movie1_emb',
    		'postdomevents', 'true',
    		'autoplay', 'false'
    )

		document.getElementById('movie_div').innerHTML = qtEmbed;

		if (params['should_resize'])
		  RegisterListener('qt_loadedmetadata', 'movie1', 'movie1_emb', set_display_area_to_fit_movie); 

		if (params['should_set_run_times'])
		  RegisterListener('qt_load', 'movie1', 'movie1_emb', set_run_times_from_params); 
}


function initialize_times()
{
  set_time_fields('start_time_units', 'start_time_display', 'start');
  set_time_fields('end_time_units',   'end_time_display',   'end'  );
}

function set_time_fields(units_field, display_field, position)
{
  switch (position)
  {
  case 'start':
    position = 0;
    break;
  case 'end':
    position = document.movie1.GetDuration();
    break;
  default:
    position = playhead_position();
  }
  
	document.getElementById(units_field).value = position;
	document.getElementById(display_field).value = format_time( position );
}

function set_run_times_from_params()
{
  var start_time = parseInt(params['start_time']);
  var end_time   = parseInt(params['end_time']  );
  if (end_time == 0)
  {
    if( document.movie1 )
      end_time = document.movie1.GetDuration();
  }
  
  set_run_times(start_time, end_time);
}

function update_dimension_fields(height_field_id, width_field_id)
{
  dimensions = get_movie_dimensions(document.movie1);
  
  height_field = document.getElementById(height_field_id);
  width_field  = document.getElementById(width_field_id);  
  
  if (height_field)
	  height_field.value = dimensions['height'];

  if (width_field)
	  width_field.value = dimensions['width'];
}


function set_display_area_to_fit_movie()
{
  dimensions = get_movie_dimensions(document.movie1);
  
  document.movie1.width  = dimensions['width'];
  document.movie1.height = dimensions['height'] + 16;

	document.movie1.SetControllerVisible(true);
}


// internal methods that depend on document.movie1
function playhead_position() {
	return document.movie1.GetTime();
}

function time_scale() {
	return document.movie1.GetTimeScale();
}

function set_run_times(start_time, end_time)
{
  document.movie1.SetStartTime(start_time);
  document.movie1.SetEndTime(end_time);
  document.movie1.Play();
  document.movie1.Stop();
}


// internal methods
function parseBool(val)
{
  if (val == 'true')
    return true;
  
  if (val == 'false')
    return false;
  
  return null;
}

function set_defaults(params)
{
  if (params['movie_source'] == '')
  {
    var error_message = 'Exception: Must specify a movie source.';
    alert(error_message);
    throw(error_message);
  }

  var default_params = {'height'               : 200,
                        'width'                : 200,
                        'should_resize'        : true,
                        'should_set_run_times' : false,
                        'start_time'           : 0,
                        'end_time'             : 0, 
                       }

  for(var key in default_params)
  {
    if (params[key] === '' || params[key] === NaN || params[key] === null)
    {
      params[key] = default_params[key];
    }
  }
  
  return params;
}

function get_movie_dimensions(obj)
{
	var rectangle = obj.GetRectangle();

	if (rectangle)
	{
	  rectangle = rectangle.split(',');
		var x1 = parseInt(rectangle[0]);
		var x2 = parseInt(rectangle[2]);
		var y1 = parseInt(rectangle[1]);
		var y2 = parseInt(rectangle[3]);

		var width = (x1 < 0) ? (x1 * -1) + x2 : x2 - x1;
		var height = (y1 < 0) ? (y1 * -1) + y2 : y2 - y1;
	}
	else
	{
		// a mov containing only audio
		var width = 200;
		var height = 0;
	}

  return {'height':height, 'width':width};
}


function format_time(time_in_video_units){
	totalSec = time_in_video_units / time_scale();

	hours = parseInt( totalSec / 3600 ) % 24;
	minutes = parseInt( totalSec / 60 ) % 60;
	seconds = parseInt( totalSec ) % 60;
	fframes  = Math.round( ((totalSec % 60) - seconds) * 100);

	result =  zero_pad(hours) + ":" + zero_pad(minutes) + ":" + zero_pad(seconds) + ":" + zero_pad(fframes);
	return result;
};

function zero_pad(number)
{
	return (number < 10 ? "0" + number: number)
}

function myAddListener(obj, evt, handler, captures)
{
	if ( document.addEventListener )
		obj.addEventListener(evt, handler, captures);
	else
		// IE
		obj.attachEvent('on' + evt, handler);
}

function RegisterListener(eventName, objID, embedID, listenerFcn)
{
	var obj = document.getElementById(objID);
	if ( !obj )
		obj = document.getElementById(embedID);
	if ( obj )
		myAddListener(obj, eventName, listenerFcn, false);
}